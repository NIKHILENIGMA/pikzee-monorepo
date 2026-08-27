import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'

import { DbService } from '@pikzee/shared-db'

import { WorkspaceService } from './workspace.service'

describe('WorkspaceService', () => {
  let service: WorkspaceService
  let mockQueryBuilder: Record<string, jest.Mock>

  beforeEach(async () => {
    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([]),
      transaction: jest.fn().mockImplementation(async (cb) => {
        return cb(mockQueryBuilder)
      }),
    }

    const dbServiceMock = { conn: mockQueryBuilder }

    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkspaceService, { provide: DbService, useValue: dbServiceMock }],
    }).compile()

    service = module.get<WorkspaceService>(WorkspaceService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('createWorkspace', () => {
    it('should successfully create a workspace if user has none', async () => {
      mockQueryBuilder.limit.mockResolvedValueOnce([])
      mockQueryBuilder.limit.mockResolvedValueOnce([])
      mockQueryBuilder.returning.mockResolvedValueOnce([{ id: 'new-ws-1' }])

      const result = await service.createWorkspace('user-1', {
        name: 'Test',
        slug: 'test',
      })

      expect(result).toHaveProperty('id', 'new-ws-1')
      expect(mockQueryBuilder.transaction).toHaveBeenCalled()
      expect(mockQueryBuilder.insert).toHaveBeenCalledTimes(2)
    })

    it('should throw ForbiddenException if user already has a workspace', async () => {
      mockQueryBuilder.limit.mockResolvedValueOnce([{ id: 'ws-existing' }])

      await expect(
        service.createWorkspace('user-1', { name: 'Test', slug: 'test' }),
      ).rejects.toThrow(ForbiddenException)
    })

    it('should generate unique slug if initial slug is taken', async () => {
      mockQueryBuilder.limit.mockResolvedValueOnce([])
      mockQueryBuilder.limit.mockResolvedValueOnce([{ id: 'ws-1' }])
      mockQueryBuilder.limit.mockResolvedValueOnce([])

      mockQueryBuilder.returning.mockResolvedValueOnce([{ id: 'new-ws-2' }])

      await service.createWorkspace('user-1', {
        name: 'Test',
        slug: 'test',
      })

      expect(mockQueryBuilder.transaction).toHaveBeenCalled()
    })
  })

  describe('updateWorkspaceDetails', () => {
    it('should successfully update workspace details', async () => {
      mockQueryBuilder.returning.mockResolvedValueOnce([{ id: 'ws-1', name: 'Updated Name' }])

      const result = await service.updateWorkspaceDetails('ws-1', { name: 'Updated Name' })

      expect(result).toEqual({ id: 'ws-1', name: 'Updated Name' })
      expect(mockQueryBuilder.update).toHaveBeenCalled()
    })

    it('should throw NotFoundException if workspace does not exist', async () => {
      mockQueryBuilder.returning.mockResolvedValueOnce([])
      mockQueryBuilder.limit.mockResolvedValueOnce([])

      await expect(service.updateWorkspaceDetails('invalid-id', { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw ForbiddenException if workspace exists but is not ACTIVE', async () => {
      mockQueryBuilder.returning.mockResolvedValueOnce([])
      mockQueryBuilder.limit.mockResolvedValueOnce([{ id: 'ws-1', status: 'ARCHIVED' }])

      await expect(service.updateWorkspaceDetails('ws-1', { name: 'Test' })).rejects.toThrow(
        ForbiddenException,
      )
    })
  })

  describe('deleteWorkspace', () => {
    it('should successfully delete a workspace', async () => {
      mockQueryBuilder.returning.mockResolvedValueOnce([{ id: 'ws-1' }])

      await service.deleteWorkspace('ws-1')

      expect(mockQueryBuilder.delete).toHaveBeenCalled()
    })

    it('should throw NotFoundException if workspace does not exist', async () => {
      mockQueryBuilder.returning.mockResolvedValueOnce([])
      mockQueryBuilder.limit.mockResolvedValueOnce([])

      await expect(service.deleteWorkspace('invalid-id')).rejects.toThrow(NotFoundException)
    })

    it('should throw ForbiddenException if workspace exists but is not ACTIVE', async () => {
      mockQueryBuilder.returning.mockResolvedValueOnce([])
      mockQueryBuilder.limit.mockResolvedValueOnce([{ id: 'ws-1', status: 'ARCHIVED' }])

      await expect(service.deleteWorkspace('ws-1')).rejects.toThrow(ForbiddenException)
    })
  })

  describe('getActiveWorkspacesForUser', () => {
    it('should return a list of active workspaces for a user', async () => {
      const mockWorkspaces = [{ id: 'ws-1' }, { id: 'ws-2' }]
      mockQueryBuilder.orderBy.mockResolvedValueOnce(mockWorkspaces)

      const result = await service.getActiveWorkspacesForUser('user-1')

      expect(result).toEqual(mockWorkspaces)
      expect(mockQueryBuilder.select).toHaveBeenCalled()
    })
  })

  describe('getWorkspaceById', () => {
    it('should return a workspace by id', async () => {
      mockQueryBuilder.limit.mockResolvedValueOnce([{ id: 'ws-1' }])

      const result = await service.getWorkspaceById('ws-1')

      expect(result).toEqual({ id: 'ws-1' })
    })
  })

  describe('getWorkspaceBySlug', () => {
    it('should return a workspace by slug', async () => {
      mockQueryBuilder.limit.mockResolvedValueOnce([{ id: 'ws-1', slug: 'test-slug' }])

      const result = await service.getWorkspaceBySlug('test-slug')

      expect(result).toEqual({ id: 'ws-1', slug: 'test-slug' })
    })
  })

  describe('getAllWorkspacesOfCurrentUser', () => {
    it('should return the first active workspace owned by the user (matching current destructuring behavior)', async () => {
      const mockWorkspace = { id: 'ws-1' }
      mockQueryBuilder.orderBy.mockResolvedValueOnce([mockWorkspace])

      const result = await service.getAllWorkspacesOfCurrentUser('user-1')

      expect(result).toEqual(mockWorkspace)
    })
  })

  describe('verifyWorkspaceOwnership', () => {
    it('should return true if user is owner', async () => {
      mockQueryBuilder.limit.mockResolvedValueOnce([{ id: 'ws-1' }])

      const result = await service.verifyWorkspaceOwnership('user-1', 'ws-1')

      expect(result).toBe(true)
    })

    it('should return false if user is not owner', async () => {
      mockQueryBuilder.limit.mockResolvedValueOnce([])

      const result = await service.verifyWorkspaceOwnership('user-2', 'ws-1')

      expect(result).toBe(false)
    })
  })
})
