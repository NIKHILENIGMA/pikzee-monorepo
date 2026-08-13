import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { and, eq } from 'drizzle-orm'

import { DbService, workspaceMembers, workspaces, users } from '@pikzee/shared-db'
import { WorkspaceMember } from '@pikzee/shared-types'

import { CreateMemberDto } from './dto/create-member.dto'
import { UpdateMemberDto } from './dto/update-member.dto'

@Injectable()
export class MembersService {
  constructor(private readonly db: DbService) {}

  // ===========================================================================
  // Mutations
  // ===========================================================================

  /**
   * Directly creates a new member in the workspace.
   *
   * Description:
   * This is a low-level mutation usually called internally by the system
   * after a user accepts a workspace invitation. It bypasses role-based checks.
   *
   * @param data The payload containing the user ID, workspace ID, and role.
   */
  async createMember(data: CreateMemberDto): Promise<void> {
    await this.db.conn.insert(workspaceMembers).values(data)
  }

  /**
   * Updates the role of an existing workspace member.
   *
   * Business Rules Enforced:
   * - Validates that the target member actually exists and belongs to the specified workspace.
   * - Prevents the workspace OWNER from having their role changed (ownership must be transferred instead).
   * - Prevents redundant updates if the new role matches the current role.
   *
   * @param memberId The ID of the member to update.
   * @param workspaceId The ID of the workspace (used to verify membership).
   * @param data The payload containing the new role.
   * @throws {NotFoundException} If the member record does not exist.
   * @throws {ForbiddenException} If the member does not belong to the workspace,
   *     is the workspace OWNER, or the role is unchanged.
   */
  async updateMemberRole(
    memberId: string,
    workspaceId: string,
    data: UpdateMemberDto,
  ): Promise<void> {
    const [memberWithWorkspaceDetails] = await this.db.conn
      .select({
        id: workspaceMembers.id,
        userId: workspaceMembers.userId,
        role: workspaceMembers.role,
        workspaceId: workspaces.id,
        ownerId: workspaces.ownerId,
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
      .where(eq(workspaceMembers.id, memberId))

    if (!memberWithWorkspaceDetails) {
      throw new NotFoundException('Member not found')
    }

    if (memberWithWorkspaceDetails.workspaceId !== workspaceId) {
      throw new ForbiddenException('Member does not belong to the specified workspace')
    }

    if (memberWithWorkspaceDetails.userId === memberWithWorkspaceDetails.ownerId) {
      throw new ForbiddenException('Cannot change the role of the workspace OWNER')
    }

    if (memberWithWorkspaceDetails.role === data.role) {
      throw new ForbiddenException('The new role is the same as the current role')
    }

    await this.db.conn
      .update(workspaceMembers)
      .set(data)
      .where(and(eq(workspaceMembers.id, memberId), eq(workspaceMembers.workspaceId, workspaceId)))
      .returning()
  }

  /**
   * Removes a member from the workspace.
   *
   * Business Rules Enforced:
   * - Validates that the target member actually exists and belongs to the workspace.
   * - Prevents the workspace OWNER from being removed or leaving voluntarily.
   * - Enforces hierarchy: only the OWNER can remove an ADMIN, though an ADMIN can voluntarily leave.
   *
   * @param memberId The ID of the member to remove.
   * @param workspaceId The ID of the workspace.
   * @param requestUserId The user ID of the person initiating the removal.
   * @throws {NotFoundException} If the member record does not exist.
   * @throws {ForbiddenException} If attempting to remove the workspace OWNER,
   *     or if a non-owner attempts to remove an ADMIN.
   */
  async removeMember(memberId: string, workspaceId: string, requestUserId: string): Promise<void> {
    const [workspaceMemberWithDetails] = await this.db.conn
      .select({
        id: workspaceMembers.id,
        userId: workspaceMembers.userId,
        role: workspaceMembers.role,
        workspaceId: workspaces.id,
        ownerId: workspaces.ownerId,
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
      .where(eq(workspaceMembers.id, memberId))

    if (!workspaceMemberWithDetails) {
      throw new NotFoundException('Member not found')
    }

    if (workspaceMemberWithDetails.workspaceId !== workspaceId) {
      throw new ForbiddenException('Member does not belong to the specified workspace')
    }

    if (workspaceMemberWithDetails.userId === workspaceMemberWithDetails.ownerId) {
      throw new ForbiddenException('Cannot remove the workspace OWNER')
    }

    if (workspaceMemberWithDetails.role === 'ADMIN') {
      const isRequesterOwner = requestUserId === workspaceMemberWithDetails.ownerId
      const isLeavingVoluntarily = requestUserId === workspaceMemberWithDetails.userId

      if (!isRequesterOwner && !isLeavingVoluntarily) {
        throw new ForbiddenException('Only the workspace OWNER can remove an ADMIN')
      }
    }

    await this.db.conn
      .delete(workspaceMembers)
      .where(and(eq(workspaceMembers.id, memberId), eq(workspaceMembers.workspaceId, workspaceId)))
      .returning()
  }

  // ===========================================================================
  // Queries
  // ===========================================================================

  /**
   * Retrieves a workspace member by their membership ID.
   *
   * @param memberId The ID of the member record.
   * @returns The workspace member record.
   * @throws {NotFoundException} If the member is not found.
   */
  async findMemberById(memberId: string): Promise<WorkspaceMember> {
    const [member] = await this.db.conn
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.id, memberId))

    if (!member) {
      throw new NotFoundException('Member not found')
    }

    return member
  }

  /**
   * Retrieves all members associated with a given workspace ID.
   *
   * Description:
   * Performs a SQL JOIN with the local `users` table to fetch the profile
   * details (email, firstName, lastName) of each member alongside their
   * workspace role, avoiding the need for external Clerk API calls.
   *
   * @param workspaceId The ID of the workspace.
   * @returns A list of workspace member records enriched with user profile data.
   */
  async findMembersByWorkspaceId(workspaceId: string): Promise<WorkspaceMember[]> {
    const members = await this.db.conn
      .select({
        id: workspaceMembers.id,
        userId: workspaceMembers.userId,
        role: workspaceMembers.role,
        workspaceId: workspaceMembers.workspaceId,
        createdAt: workspaceMembers.createdAt,
        updatedAt: workspaceMembers.updatedAt,
        // User profile details
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        avatar: users.firstName, // TODO: Add avatar field to users table and update this mapping accordingly
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userId, users.id))
      .where(eq(workspaceMembers.workspaceId, workspaceId))

    return members
  }

  /**
   * Retrieves a specific member record by user ID and workspace ID.
   *
   * @param userId The ID of the user.
   * @param workspaceId The ID of the workspace.
   * @returns The workspace member record, or null if not found.
   */
  async findMemberByUserIdAndWorkspaceId(
    userId: string,
    workspaceId: string,
  ): Promise<WorkspaceMember | null> {
    const [member] = await this.db.conn
      .select()
      .from(workspaceMembers)
      .where(
        and(eq(workspaceMembers.userId, userId), eq(workspaceMembers.workspaceId, workspaceId)),
      )

    return member || null
  }
}
