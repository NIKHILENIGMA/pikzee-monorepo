import {
  Body,
  Controller,
  Patch,
  Delete,
  Get,
  Post,
  Param,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common'

import { WorkspacePermission } from '@pikzee/shared-types'

import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { RequirePermissions } from '../authorization/decorators/require-permissions.decorator'
import { WorkspacePermissionGuard } from '../authorization/guard/workspace-permission.guard'

import { CreateWorkspaceDto } from './dto/create-workspace.dto'
import { UpdateWorkspaceDto } from './dto/update-workspace.dto'
import { WorkspaceService } from './workspace.service'

@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  // ===========================================================================
  // MUTATIONS (POST, PATCH, DELETE)
  // ===========================================================================

  /**
   * Creates a new workspace.
   * Required permission: None (Authenticated user)
   * Note: Enforces MVP limit of 1 workspace per user.
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async createWorkspace(
    @CurrentUser('userId') userId: string,
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ) {
    return this.workspaceService.createWorkspace(userId, createWorkspaceDto)
  }

  /**
   * Updates an existing workspace's general details (name, logo).
   * Required permission: WORKSPACE_WRITE
   */
  @Patch(':workspaceId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(WorkspacePermissionGuard)
  @RequirePermissions(WorkspacePermission.WORKSPACE_WRITE, WorkspacePermission.WORKSPACE_READ)
  async updateWorkspaceDetails(
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.workspaceService.updateWorkspaceDetails(workspaceId, updateWorkspaceDto)
  }

  /**
   * Deletes a workspace.
   * Required permission: WORKSPACE_WRITE
   */
  @Delete(':workspaceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(WorkspacePermissionGuard)
  @RequirePermissions(WorkspacePermission.WORKSPACE_WRITE, WorkspacePermission.WORKSPACE_READ)
  async deleteWorkspace(@Param('workspaceId') workspaceId: string) {
    return this.workspaceService.deleteWorkspace(workspaceId)
  }

  // ===========================================================================
  // QUERIES (GET)
  // ===========================================================================

  /**
   * Retrieves all active workspaces belonging to the current user.
   * Required permission: None (Authenticated user)
   */
  @Get('mine')
  @HttpCode(HttpStatus.OK)
  async getCurrentUserWorkspaces(@CurrentUser('userId') userId: string) {
    return this.workspaceService.getActiveWorkspacesForUser(userId)
  }

  /**
   * Retrieves a workspace by its unique slug.
   * Required permission: WORKSPACE_READ
   */
  @Get('slug/:slug')
  @HttpCode(HttpStatus.OK)
  @UseGuards(WorkspacePermissionGuard)
  @RequirePermissions(WorkspacePermission.WORKSPACE_READ)
  async getWorkspaceBySlug(@Param('slug') slug: string) {
    return this.workspaceService.getWorkspaceBySlug(slug)
  }

  /**
   * Retrieves a workspace by its UUID.
   * Required permission: WORKSPACE_READ
   */
  @Get(':workspaceId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(WorkspacePermissionGuard)
  @RequirePermissions(WorkspacePermission.WORKSPACE_READ)
  async getWorkspaceById(@Param('workspaceId') workspaceId: string) {
    return this.workspaceService.getWorkspaceById(workspaceId)
  }

  /**
   * Retrieves all workspaces globally.
   * Required permission: None (Should ideally be restricted to internal admin tools)
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllWorkspaces() {
    return this.workspaceService.getAllWorkspaces()
  }
}
