import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { and, desc, eq } from 'drizzle-orm'

import { DbService, workspaceMembers, workspaces } from '@pikzee/shared-db'
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  WorkspaceRole,
  WorkspaceStatus,
} from '@pikzee/shared-types'

@Injectable()
export class WorkspaceService {
  private readonly logger = new Logger(WorkspaceService.name)

  constructor(private readonly db: DbService) {}

  // ===========================================================================
  // Mutations
  // ===========================================================================

  /**
   * Creates a new workspace and sets the creator as the ADMIN.
   *
   * Business Rules Enforced:
   * - MVP Limit: A user can only own a maximum of 1 workspace.
   * - Slugs must be globally unique (auto-generates unique suffix if necessary).
   *
   * @param userId The ID of the user creating the workspace.
   * @param data The payload containing workspace details (name, logo, etc.).
   * @throws {ForbiddenException} If the user already owns a workspace.
   * @returns The newly created workspace record.
   */
  async createWorkspace(userId: string, data: CreateWorkspaceDto) {
    const [existingWorkspace] = await this.db.conn
      .select()
      .from(workspaces)
      .where(eq(workspaces.ownerId, userId))
      .limit(1)

    if (existingWorkspace) {
      throw new ForbiddenException(
        'You already have a workspace. You cannot create more than one workspace.',
      )
    }

    // Check if the slug is unique, mutate if necessary
    const isUnique: boolean = await this.checkSlugUniqueness(data.slug)
    if (!isUnique) {
      data.slug = await this.generateUniqueSlug(data.slug)
    }

    // Create the workspace and the workspace member in a single transaction
    const workspace = await this.db.conn.transaction(async (tx) => {
      const [newWorkspace] = await tx
        .insert(workspaces)
        .values({ ...data, ownerId: userId })
        .returning()

      await tx.insert(workspaceMembers).values({
        workspaceId: newWorkspace.id,
        userId: userId,
        role: WorkspaceRole.ADMIN,
      })

      return newWorkspace
    })

    this.logger.log(`Workspace created with ID: ${workspace.id} by user: ${userId}`)

    return workspace
  }

  /**
   * Updates general details of an existing workspace.
   *
   * Business Rules Enforced:
   * - Only ACTIVE workspaces can be updated (archived/suspended are read-only).
   * - The caller must have been verified by the WorkspacePermissionGuard prior to this call.
   *
   * @param workspaceId The ID of the workspace to update.
   * @param data The payload containing fields to update (slug is omitted by DTO validation).
   * @throws {NotFoundException} If the workspace does not exist.
   * @throws {ForbiddenException} If the workspace is suspended or archived.
   * @returns The updated workspace record.
   */
  async updateWorkspaceDetails(workspaceId: string, data: UpdateWorkspaceDto) {
    const [updatedWorkspace] = await this.db.conn
      .update(workspaces)
      .set(data)
      .where(and(eq(workspaces.id, workspaceId), eq(workspaces.status, WorkspaceStatus.ACTIVE)))
      .returning()

    if (!updatedWorkspace) {
      const getWorkspace = await this.getWorkspaceById(workspaceId)
      if (!getWorkspace) {
        throw new NotFoundException('Workspace not found.')
      }
      throw new ForbiddenException(
        'Workspace not found or you do not have permission to update it.',
      )
    }

    return updatedWorkspace
  }

  /**
   * Deletes a workspace from the database.
   *
   * Business Rules Enforced:
   * - Only ACTIVE workspaces can be deleted.
   * - The caller must have been verified by the WorkspacePermissionGuard prior to this call.
   *
   * @param workspaceId The ID of the workspace to delete.
   * @throws {NotFoundException} If the workspace does not exist.
   * @throws {ForbiddenException} If the workspace cannot be deleted due to its status.
   */
  async deleteWorkspace(workspaceId: string) {
    const [deletedWorkspace] = await this.db.conn
      .delete(workspaces)
      .where(and(eq(workspaces.id, workspaceId), eq(workspaces.status, WorkspaceStatus.ACTIVE)))
      .returning()

    if (!deletedWorkspace) {
      const getWorkspace = await this.getWorkspaceById(workspaceId)
      if (!getWorkspace) {
        throw new NotFoundException('Workspace not found.')
      }
      throw new ForbiddenException(
        'Workspace not found or you do not have permission to delete it.',
      )
    }
  }

  // ===========================================================================
  // Queries
  // ===========================================================================

  /**
   * Retrieves all workspaces associated with a specific user.
   *
   * Description:
   * Performs an inner join with the `workspaceMembers` table to fetch only workspaces
   * the user is a part of. It also extracts the user's role in each workspace.
   *
   * @param userId The ID of the user requesting their workspaces.
   * @returns A list of ACTIVE workspaces enriched with the user's specific role.
   */
  async getActiveWorkspacesForUser(userId: string) {
    const allWorkspaces = await this.db.conn
      .select({
        id: workspaces.id,
        name: workspaces.name,
        slug: workspaces.slug,
        logoUrl: workspaces.logoUrl,
        ownerId: workspaces.ownerId,
        role: workspaceMembers.role,
      })
      .from(workspaces)
      .innerJoin(workspaceMembers, eq(workspaces.id, workspaceMembers.workspaceId))
      .where(
        and(eq(workspaceMembers.userId, userId), eq(workspaces.status, WorkspaceStatus.ACTIVE)),
      )
      .orderBy(desc(workspaces.createdAt))

    return allWorkspaces
  }

  /**
   * Retrieves a single workspace by its unique UUID.
   *
   * @param workspaceId The UUID of the workspace.
   * @returns The workspace record.
   */
  async getWorkspaceById(workspaceId: string) {
    return this.db.conn.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1)
  }

  /**
   * Retrieves a single workspace by its unique URL slug.
   *
   * @param slug The globally unique slug of the workspace.
   * @returns The workspace record.
   */
  async getWorkspaceBySlug(slug: string) {
    return this.db.conn.select().from(workspaces).where(eq(workspaces.slug, slug)).limit(1)
  }

  /**
   * Retrieves a list of all workspaces globally.
   * Used for internal system monitoring or admin panels.
   *
   * @returns A list of all workspaces.
   */
  async getAllWorkspaces() {
    return this.db.conn.select().from(workspaces)
  }

  /**
   * Checks if a user is the absolute owner of a given workspace.
   *
   * @param userId The UUID of the user.
   * @param workspaceId The UUID of the workspace.
   * @returns boolean True if the user is the owner, false otherwise.
   */
  async verifyWorkspaceOwnership(userId: string, workspaceId: string): Promise<boolean> {
    const [workspace] = await this.db.conn
      .select()
      .from(workspaces)
      .where(and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, userId)))
      .limit(1)

    return !!workspace
  }

  // ===========================================================================
  // Private Helpers
  // ===========================================================================

  /**
   * Verifies if a slug is globally unique in the database.
   */
  private async checkSlugUniqueness(slug: string): Promise<boolean> {
    const existingWorkspace = await this.db.conn
      .select()
      .from(workspaces)
      .where(eq(workspaces.slug, slug))
      .limit(1)

    return existingWorkspace.length === 0
  }

  /**
   * Recursively appends an integer to a slug until it is globally unique.
   */
  private async generateUniqueSlug(slug: string): Promise<string> {
    let uniqueSlug = slug
    let counter = 1

    while (!(await this.checkSlugUniqueness(uniqueSlug))) {
      uniqueSlug = `${slug}-${counter}`
      counter++
    }

    return uniqueSlug
  }
}
