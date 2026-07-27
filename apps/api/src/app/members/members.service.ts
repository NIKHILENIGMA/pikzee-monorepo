import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { and, eq } from 'drizzle-orm'

import { DbService, workspaceMembers } from '@pikzee/shared-db'
import { WorkspaceMember } from '@pikzee/shared-types'

import { CreateMemberDto } from './dto/create-member.dto'
import { UpdateMemberDto } from './dto/update-member.dto'

@Injectable()
export class MembersService {
  constructor(private readonly db: DbService) {}

  async create(data: CreateMemberDto): Promise<void> {
    await this.db.conn.insert(workspaceMembers).values(data)
  }

  async update(memberId: string, data: UpdateMemberDto): Promise<void> {
    const [updateMember] = await this.db.conn
      .update(workspaceMembers)
      .set(data)
      .where(eq(workspaceMembers.id, memberId))
      .returning()

    if (!updateMember) {
      const [member] = await this.db.conn
        .select()
        .from(workspaceMembers)
        .where(eq(workspaceMembers.id, memberId))
      if (!member) {
        throw new NotFoundException('Member might have been deleted or does not exist')
      }
      throw new ForbiddenException('You do not have permission to update this member')
    }
  }

  async delete(memberId: string): Promise<void> {
    const [deletedMember] = await this.db.conn
      .delete(workspaceMembers)
      .where(eq(workspaceMembers.id, memberId))
      .returning()

    if (!deletedMember) {
      const [member] = await this.db.conn
        .select()
        .from(workspaceMembers)
        .where(eq(workspaceMembers.id, memberId))
      if (!member) {
        throw new NotFoundException('Member might have been deleted or does not exist')
      }

      throw new ForbiddenException('You do not have permission to delete this member')
    }
  }

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

  async findMembersByWorkspaceId(workspaceId: string): Promise<WorkspaceMember[]> {
    return await this.db.conn
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.workspaceId, workspaceId))
  }

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
