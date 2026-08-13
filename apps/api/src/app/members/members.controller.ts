import { Controller, Get, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common'

import { WorkspacePermission } from '@pikzee/shared-types'

import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { AllowSelf } from '../authorization/decorators/allow-self.decorator'
import { RequirePermissions } from '../authorization/decorators/require-permissions.decorator'
import { WorkspacePermissionGuard } from '../authorization/guard/workspace-permission.guard'

import { UpdateMemberDto } from './dto/update-member.dto'
import { MembersService } from './members.service'

@Controller('workspaces/:workspaceId/members')
@UseGuards(WorkspacePermissionGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  /**
   * Retrieves all members of a specific workspace.
   * Required permission: MEMBER_READ (Viewers, Commenters, Editors, Admins)
   */
  @Get()
  @RequirePermissions(WorkspacePermission.MEMBER_READ)
  async getMembers(@Param('workspaceId') workspaceId: string) {
    return this.membersService.findMembersByWorkspaceId(workspaceId)
  }

  /**
   * Updates a member's role in the workspace.
   * Required permission: MEMBER_UPDATE (Admins only)
   */
  @Patch(':memberId')
  @RequirePermissions(WorkspacePermission.MEMBER_UPDATE)
  async updateMember(
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    return this.membersService.updateMemberRole(memberId, workspaceId, updateMemberDto)
  }

  /**
   * Removes a member from the workspace (or allows a member to leave).
   * Required permission: MEMBER_REMOVE (Admins only) OR the user is removing themselves (@AllowSelf).
   */
  @Delete(':memberId')
  @AllowSelf()
  @RequirePermissions(WorkspacePermission.MEMBER_REMOVE)
  async removeMember(
    @CurrentUser('userId') requestUserId: string,
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.membersService.removeMember(memberId, workspaceId, requestUserId)
  }
}
