import { Test, type TestingModule } from '@nestjs/testing'

import { WorkspacePermissionGuard } from '../authorization/guard/workspace-permission.guard'

import { WorkspaceController } from './workspace.controller'
import { WorkspaceService } from './workspace.service'

import type { CreateWorkspaceDto } from './dto/create-workspace.dto'
import type { UpdateWorkspaceDto } from './dto/update-workspace.dto'
import type { ExecutionContext } from '@nestjs/common'

describe('WorkspaceController', () => {
  let controller: WorkspaceController
  let service: WorkspaceService

  const mockWorkspaceService = {
    createWorkspace: jest.fn(),
    updateWorkspaceDetails: jest.fn(),
    deleteWorkspace: jest.fn(),
    getActiveWorkspacesForUser: jest.fn(),
    getWorkspaceBySlug: jest.fn(),
    getWorkspaceById: jest.fn(),
    getAllWorkspacesOfCurrentUser: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceController],
      providers: [
        {
          provide: WorkspaceService,
          useValue: mockWorkspaceService,
        },
      ],
    })
      .overrideGuard(WorkspacePermissionGuard)
      .useValue({
        canActivate: (_: ExecutionContext) => true,
      })
      .compile()

    controller = module.get<WorkspaceController>(WorkspaceController)
    service = module.get<WorkspaceService>(WorkspaceService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('createWorkspace', () => {
    it('should call workspaceService.createWorkspace', async () => {
      const dto: CreateWorkspaceDto = { name: 'Test Workspace', slug: 'test-workspace' }
      const userId = 'user-123'
      mockWorkspaceService.createWorkspace.mockResolvedValue({ id: 'ws-123', ...dto })

      const result = await controller.createWorkspace(userId, dto)
      expect(service.createWorkspace).toHaveBeenCalledWith(userId, dto)
      expect(result).toEqual({ id: 'ws-123', ...dto })
    })
  })

  describe('updateWorkspaceDetails', () => {
    it('should call workspaceService.updateWorkspaceDetails', async () => {
      const dto: UpdateWorkspaceDto = { name: 'Updated Workspace' }
      const workspaceId = 'ws-123'
      mockWorkspaceService.updateWorkspaceDetails.mockResolvedValue({ id: workspaceId, ...dto })

      const result = await controller.updateWorkspaceDetails(dto, workspaceId)
      expect(service.updateWorkspaceDetails).toHaveBeenCalledWith(workspaceId, dto)
      expect(result).toEqual({ id: workspaceId, ...dto })
    })
  })

  describe('deleteWorkspace', () => {
    it('should call workspaceService.deleteWorkspace', async () => {
      const workspaceId = 'ws-123'
      mockWorkspaceService.deleteWorkspace.mockResolvedValue(undefined)

      await controller.deleteWorkspace(workspaceId)
      expect(service.deleteWorkspace).toHaveBeenCalledWith(workspaceId)
    })
  })

  describe('getCurrentUserWorkspaces', () => {
    it('should call workspaceService.getActiveWorkspacesForUser', async () => {
      const userId = 'user-123'
      mockWorkspaceService.getActiveWorkspacesForUser.mockResolvedValue([{ id: 'ws-123' }])

      const result = await controller.getCurrentUserWorkspaces(userId)
      expect(service.getActiveWorkspacesForUser).toHaveBeenCalledWith(userId)
      expect(result).toEqual([{ id: 'ws-123' }])
    })
  })

  describe('getWorkspaceBySlug', () => {
    it('should call workspaceService.getWorkspaceBySlug', async () => {
      const slug = 'test-workspace'
      mockWorkspaceService.getWorkspaceBySlug.mockResolvedValue({ id: 'ws-123', slug })

      const result = await controller.getWorkspaceBySlug(slug)
      expect(service.getWorkspaceBySlug).toHaveBeenCalledWith(slug)
      expect(result).toEqual({ id: 'ws-123', slug })
    })
  })

  describe('getWorkspaceById', () => {
    it('should call workspaceService.getWorkspaceById', async () => {
      const workspaceId = 'ws-123'
      mockWorkspaceService.getWorkspaceById.mockResolvedValue({ id: workspaceId })

      const result = await controller.getWorkspaceById(workspaceId)
      expect(service.getWorkspaceById).toHaveBeenCalledWith(workspaceId)
      expect(result).toEqual({ id: workspaceId })
    })
  })

  describe('getAllWorkspacesOfCurrentUser', () => {
    it('should call workspaceService.getAllWorkspacesOfCurrentUser', async () => {
      const userId = 'user-123'
      mockWorkspaceService.getAllWorkspacesOfCurrentUser.mockResolvedValue([{ id: 'ws-123' }])

      const result = await controller.getAllWorkspacesOfCurrentUser(userId)
      expect(service.getAllWorkspacesOfCurrentUser).toHaveBeenCalledWith(userId)
      expect(result).toEqual([{ id: 'ws-123' }])
    })
  })
})
