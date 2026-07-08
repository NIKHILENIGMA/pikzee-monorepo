import { Body, Controller, Patch, Delete, Get, Post, Param } from '@nestjs/common'

import { CurrentUser } from '../auth/decorators/current-user.decorator'

import { CreateWorkspaceDto } from './dto/create-workspace.dto'
import { UpdateWorkspaceDto } from './dto/update-workspace.dto'
import { WorkspaceService } from './workspace.service'

@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  // Create a new workspace
  @Post()
  async create(
    @CurrentUser('userId') userId: string,
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ) {
    return this.workspaceService.create(userId, createWorkspaceDto)
  }

  // Get all workspaces
  @Get()
  async findAll() {
    return this.workspaceService.findAll()
  }

  // Get workspaces belonging to the current user
  @Get('mine')
  async findMine(@CurrentUser('userId') userId: string) {
    return this.workspaceService.findWorkspacesByUserId(userId)
  }

  // Update an existing workspace
  @Patch(':workspaceId')
  async update(
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.workspaceService.update(workspaceId, updateWorkspaceDto)
  }

  // Delete a workspace
  @Delete(':workspaceId')
  async delete(@Param('workspaceId') workspaceId: string, @CurrentUser('userId') userId: string) {
    return this.workspaceService.delete(workspaceId, userId)
  }

  // Get a workspace by ID
  @Get(':workspaceId')
  async findOne(@Param('workspaceId') workspaceId: string) {
    return this.workspaceService.findOneByWorkspaceId(workspaceId)
  }

  // Get a workspace by slug
  @Get('slug/:slug')
  async findOneBySlug(@Param('slug') slug: string) {
    return this.workspaceService.findOneByWorkspaceSlug(slug)
  }

  // Invite members (stub)
  @Post(':workspaceId/invitations')
  async invite(
    @Param('workspaceId') workspaceId: string,
    @Body() inviteDto: { emails: string[]; role: string },
  ) {
    return { success: true, invited: inviteDto.emails }
  }
}
