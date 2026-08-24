import crypto from 'node:crypto'

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { and, eq } from 'drizzle-orm'

import { DbService, users, workspaceInvitations, workspaceMembers } from '@pikzee/shared-db'
import {
  InvitationStatus,
  NotificationChannelEnum,
  NotificationEventEnum,
  WorkspaceRole,
} from '@pikzee/shared-types'

import { NotificationService } from '../notification/notification.service'

@Injectable()
export class InvitationService {
  constructor(
    private readonly db: DbService,
    private readonly notificationService: NotificationService,
  ) {}

  // ===========================================================================
  // Mutations
  // ===========================================================================

  /**
   * Generates a new invitation token and dispatches an invite email.
   *
   * Business Rules Enforced:
   * - Validates that the user is not already an active member of the workspace.
   * - Prevents creating duplicate pending invitations for the same email.
   *
   * @param workspaceId The ID of the workspace.
   * @param email The email address to invite.
   * @param role The workspace role to assign to the invited user.
   * @param inviterId The user ID of the person sending the invitation.
   * @returns The generated token and expiration date.
   * @throws {ConflictException} If the user is already a member or has a pending invite.
   */
  async createInvitation(
    workspaceId: string,
    email: string,
    role: WorkspaceRole,
    inviterId: string,
    customMessage?: string,
  ) {
    // check if the user is already a member of the workspace
    const [existingMember] = await this.db.conn
      .select({
        id: workspaceMembers.id,
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userId, users.id))
      .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(users.email, email)))

    if (existingMember) {
      throw new ConflictException('The user is already a member of the workspace.')
    }

    // check if there is already a pending invitation for the same email and workspace
    const [existingPendingInvitation] = await this.db.conn
      .select()
      .from(workspaceInvitations)
      .where(
        and(
          eq(workspaceInvitations.email, email),
          eq(workspaceInvitations.workspaceId, workspaceId),
          eq(workspaceInvitations.status, 'PENDING'),
        ),
      )

    if (existingPendingInvitation) {
      throw new ConflictException(
        'An invitation is already pending for this email in the workspace.',
      )
    }

    // 1. Generate token and expiration date
    const token = this.generateToken(21) // 21 characters long
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expires in 7 days

    // 2. Insert into workspace_invitations table
    await this.db.conn.insert(workspaceInvitations).values({
      workspaceId,
      inviterId,
      email,
      role,
      token,
      expiresAt,
      status: InvitationStatus.PENDING,
    })
    // 3. Trigger email dispatch stub
    await this.notificationService.notify({
      recipient: email,
      event: NotificationEventEnum.WORKSPACE_INVITATION,
      channel: [NotificationChannelEnum.EMAIL],
      meta: {
        invitationLink: `https://yourapp.com/invitations/${token}`,
        welcomeMessage: customMessage || 'You have been invited to join our workspace!',
        token,
      },
    })
    return { token, expiresAt }
  }

  /**
   * Consumes an invitation token and adds the user to the workspace.
   *
   * Business Rules Enforced:
   * - Validates that the token exists, is 'PENDING', and is not expired.
   * - Verifies that the authenticated user's email matches the invited email.
   * - Executes atomicity through a database transaction to insert the member and update token status.
   *
   * @param token The invitation token.
   * @param userId The ID of the authenticated user accepting the invite.
   * @param authenticatedEmail The email of the authenticated user.
   * @throws {NotFoundException} If the token is invalid or expired.
   * @throws {ForbiddenException} If the authenticated email does not match the invitation.
   */
  async acceptInvitation(token: string, userId: string, authenticatedEmail: string) {
    // 1. Verify token
    const invitation = await this.verifyToken(token)

    // 2. Validate authenticatedEmail matches token's email
    if (invitation.email !== authenticatedEmail) {
      throw new ForbiddenException('Authenticated email does not match invitation email.')
    }

    await this.db.conn.transaction(async (tx) => {
      // 3. Insert user into workspace_members
      await tx.insert(workspaceMembers).values({
        workspaceId: invitation.workspaceId,
        userId,
        role: invitation.role,
      })

      // 4. Update token status to ACCEPTED
      await tx
        .update(workspaceInvitations)
        .set({ status: InvitationStatus.ACCEPTED })
        .where(eq(workspaceInvitations.token, token))
    })
  }

  /**
   * Revokes a pending invitation (tombstone soft-delete).
   *
   * Business Rules Enforced:
   * - Validates that the invitation exists within the specified workspace.
   * - Only 'PENDING' invitations can be revoked.
   *
   * @param invitationId The ID of the invitation record.
   * @param workspaceId The ID of the workspace (used as a security boundary).
   * @throws {NotFoundException} If the invitation is not found.
   * @throws {BadRequestException} If the invitation is not in a 'PENDING' state.
   */
  async revokeInvitation(invitationId: string, workspaceId: string) {
    const [invitation] = await this.db.conn
      .select()
      .from(workspaceInvitations)
      .where(
        and(
          eq(workspaceInvitations.id, invitationId),
          eq(workspaceInvitations.workspaceId, workspaceId),
        ),
      )

    if (!invitation) {
      throw new NotFoundException('Invitation not found.')
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException('Only pending invitations can be revoked.')
    }

    await this.db.conn
      .update(workspaceInvitations)
      .set({ status: InvitationStatus.REVOKED }) // Set status to REVOKED
      .where(eq(workspaceInvitations.id, invitationId))

    return { message: 'Invitation revoked successfully.' }
  }

  // ===========================================================================
  // Queries
  // ===========================================================================

  /**
   * Retrieves all active, unexpired pending invitations for a workspace.
   *
   * @param workspaceId The ID of the workspace.
   * @returns A list of pending workspace invitations.
   */
  async getPendingInvitations(workspaceId: string) {
    const invitations = await this.db.conn
      .select()
      .from(workspaceInvitations)
      .where(
        and(
          eq(workspaceInvitations.workspaceId, workspaceId),
          eq(workspaceInvitations.status, InvitationStatus.PENDING),
        ),
      )

    return invitations
  }

  /**
   * Retrieves masked details for a given invitation token.
   *
   * @param token The invitation token.
   * @returns Masked invitation details for public UI rendering.
   * @throws {NotFoundException} If the token is invalid or expired.
   */
  async getPublicInviteDetails(token: string) {
    const invitation = await this.verifyToken(token)

    return {
      workspaceId: invitation.workspaceId,
      email: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
    }
  }

  private async verifyToken(token: string) {
    // 1. Query workspace_invitations by token
    const [invitation] = await this.db.conn
      .select()
      .from(workspaceInvitations)
      .where(eq(workspaceInvitations.token, token))

    // 2. Check if invitation exists
    if (!invitation) {
      throw new NotFoundException('Invitation token not found.')
    }

    // 2. Check if expiresAt > now() and status === 'PENDING'
    if (invitation.status !== 'PENDING' || invitation.expiresAt <= new Date()) {
      throw new NotFoundException('Invalid or expired invitation token.')
    }

    return invitation
  }

  private generateToken(size = 21): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
    const bytes = crypto.randomBytes(size)
    let token = ''
    for (let i = 0; i < size; i++) {
      // Map random bytes directly to the 64-character URL-safe alphabet
      token += alphabet[bytes[i] & 63]
    }
    return token
  }
}
