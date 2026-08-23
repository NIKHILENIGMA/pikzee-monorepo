import { Controller, Post, Get, Param, Body, UseGuards, Delete } from '@nestjs/common'

import { WorkspacePermission, WorkspaceRole } from '@pikzee/shared-types'

import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { ClerkGuard } from '../auth/guards/clerk-guard.guard'
import { RequirePermissions } from '../authorization/decorators/require-permissions.decorator'
import { WorkspacePermissionGuard } from '../authorization/guard/workspace-permission.guard'

import { InvitationService } from './invitation.service'

@Controller()
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  /**
   * Creates and sends a new invitation to a user.
   * Required permission: WORKSPACE_INVITE
   */
  @Post('workspaces/:workspaceId/invitations')
  @UseGuards(ClerkGuard, WorkspacePermissionGuard)
  @RequirePermissions(WorkspacePermission.WORKSPACE_INVITE)
  async createInvitation(
    @Param('workspaceId') workspaceId: string,
    @Body('email') email: string,
    @Body('role') role: WorkspaceRole,
    @CurrentUser('userId') userId: string,
  ) {
    return this.invitationService.createInvitation(workspaceId, email, role, userId)
  }

  /**
   * Retrieves all pending invitations for a specific workspace.
   * Required permission: WORKSPACE_INVITE
   */
  @Get('workspaces/:workspaceId/invitations')
  @UseGuards(ClerkGuard, WorkspacePermissionGuard)
  @RequirePermissions(WorkspacePermission.WORKSPACE_INVITE)
  async getPendingInvitations(@Param('workspaceId') workspaceId: string) {
    return this.invitationService.getPendingInvitations(workspaceId)
  }

  /**
   * Public endpoint to view masked details of an invitation token.
   * Required permission: None (Public)
   */
  @Get('invitations/:token')
  async getPublicInviteDetails(@Param('token') token: string) {
    return this.invitationService.getPublicInviteDetails(token)
  }

  /**
   * Accepts a pending invitation.
   * Required permission: Valid Clerk Auth Token
   */
  @Post('invitations/:token/accept')
  @UseGuards(ClerkGuard)
  async acceptInvitation(
    @Param('token') token: string,
    @CurrentUser('userId') userId: string,
    @Body('email') email: string,
  ) {
    return this.invitationService.acceptInvitation(token, userId, email)
  }

  /**
   * Revokes a pending invitation.
   * Required permission: WORKSPACE_INVITE
   */
  @Delete('workspaces/:workspaceId/invitations/:invitationId')
  @UseGuards(ClerkGuard, WorkspacePermissionGuard)
  @RequirePermissions(WorkspacePermission.WORKSPACE_INVITE)
  async revokeInvitation(
    @Param('workspaceId') workspaceId: string,
    @Param('invitationId') invitationId: string,
  ) {
    return this.invitationService.revokeInvitation(workspaceId, invitationId)
  }
}
