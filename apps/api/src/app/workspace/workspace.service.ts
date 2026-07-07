import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { and, eq } from 'drizzle-orm'

import { DbService, workspaceMembers, workspaces } from '@pikzee/shared-db'
import { CreateWorkspaceDto, UpdateWorkspaceDto } from '@pikzee/shared-types'

@Injectable()
export class WorkspaceService {
  constructor(private readonly db: DbService) {}

  async create(userId: string, data: CreateWorkspaceDto) {
    // Check if the slug is unique
    const isUnique: boolean = await this.isSlugUnique(data.slug)
    if (!isUnique) {
      throw new ConflictException('Workspace slug already exists. Please choose a different slug.')
    }

    // Create the workspace and the workspace member in a transaction
    const workspace = await this.db.conn.transaction(async (tx) => {
      const [newWorkspace] = await tx
        .insert(workspaces)
        .values({ ...data, ownerId: userId })
        .returning()

      await tx.insert(workspaceMembers).values({
        workspaceId: newWorkspace.id,
        userId: userId,
        role: 'ADMIN',
      })

      return newWorkspace
    })

    return workspace
  }

  async findAll() {
    return this.db.conn.select().from(workspaces)
  }

  async update(workspaceId: string, data: UpdateWorkspaceDto) {
    const updatedWorkspace = await this.db.conn
      .update(workspaces)
      .set(data)
      .where(eq(workspaces.id, workspaceId))
      .returning()

    // If no workspace was updated, check if the workspace exists and throw appropriate exceptions
    if (!updatedWorkspace) {
      const getWorkspace = await this.findOneByWorkspaceId(workspaceId)
      if (!getWorkspace) {
        throw new NotFoundException('Workspace not found.')
      }
      throw new ForbiddenException(
        'Workspace not found or you do not have permission to update it.',
      )
    }

    return updatedWorkspace
  }

  async delete(workspaceId: string, userId: string) {
    const [deletedWorkspace] = await this.db.conn
      .delete(workspaces)
      .where(and(eq(workspaces.id, workspaceId), eq(workspaces.ownerId, userId)))
      .returning()

    if (!deletedWorkspace) {
      const getWorkspace = await this.findOneByWorkspaceId(workspaceId)
      if (!getWorkspace) {
        throw new NotFoundException('Workspace not found.')
      }
      throw new ForbiddenException(
        'Workspace not found or you do not have permission to delete it.',
      )
    }
  }

  async findOneByWorkspaceId(workspaceId: string) {
    return this.db.conn.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1)
  }

  async findOneByWorkspaceSlug(slug: string) {
    return this.db.conn.select().from(workspaces).where(eq(workspaces.slug, slug)).limit(1)
  }

  private async isSlugUnique(slug: string): Promise<boolean> {
    const existingWorkspace = await this.db.conn
      .select()
      .from(workspaces)
      .where(eq(workspaces.slug, slug))
      .limit(1)

    return existingWorkspace.length === 0
  }
}
