import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'

import { DbService, workspaceMembers } from '@pikzee/shared-db'

import { WorkspaceService } from '../workspace/workspace.service'

import { MembersService } from './members.service'

import type { CreateMemberDto } from './dto/create-member.dto'
import type { UpdateMemberDto } from './dto/update-member.dto'

describe('MembersService', () => {
  let service: MembersService

  const mockValues = jest.fn()
  const mockInsert = jest.fn().mockReturnValue({ values: mockValues })

  const mockUpdateReturning = jest.fn()
  const mockUpdateWhere = jest.fn().mockReturnValue({ returning: mockUpdateReturning })
  const mockSet = jest.fn().mockReturnValue({ where: mockUpdateWhere })
  const mockUpdate = jest.fn().mockReturnValue({ set: mockSet })

  const mockDeleteReturning = jest.fn()
  const mockDeleteWhere = jest.fn().mockReturnValue({ returning: mockDeleteReturning })
  const mockDelete = jest.fn().mockReturnValue({ where: mockDeleteWhere })

  const mockSelectWhere = jest.fn()
  const mockSelectInnerJoin = jest.fn().mockReturnValue({ where: mockSelectWhere })
  const mockSelectFrom = jest
    .fn()
    .mockReturnValue({ innerJoin: mockSelectInnerJoin, where: mockSelectWhere })
  const mockSelect = jest.fn().mockReturnValue({ from: mockSelectFrom })

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: DbService,
          useValue: {
            conn: {
              insert: mockInsert,
              update: mockUpdate,
              delete: mockDelete,
              select: mockSelect,
            },
          } as unknown as jest.Mocked<DbService>,
        },
        {
          provide: WorkspaceService,
          useValue: {}, // WorkspaceService is no longer actively called in these methods
        },
      ],
    }).compile()

    service = module.get<MembersService>(MembersService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('createMember', () => {
    it('should create a new member', async () => {
      const data: CreateMemberDto = {
        userId: 'user-1',
        workspaceId: 'workspace-1',
        role: 'EDITOR',
      }
      mockValues.mockResolvedValueOnce(undefined)

      await service.createMember(data)

      expect(mockInsert).toHaveBeenCalledWith(workspaceMembers)
      expect(mockValues).toHaveBeenCalledWith(data)
    })
  })

  describe('updateMemberRole', () => {
    const updateData: UpdateMemberDto = { role: 'ADMIN' }

    it('should update an existing member if not owner and in correct workspace', async () => {
      mockSelectWhere.mockResolvedValueOnce([
        {
          id: 'member-1',
          workspaceId: 'workspace-1',
          userId: 'user-1',
          ownerId: 'owner-1',
          role: 'EDITOR',
        },
      ])
      mockUpdateReturning.mockResolvedValueOnce([{ id: 'member-1' }])

      await service.updateMemberRole('member-1', 'workspace-1', updateData)

      expect(mockUpdate).toHaveBeenCalledWith(workspaceMembers)
      expect(mockSet).toHaveBeenCalledWith(updateData)
      expect(mockUpdateReturning).toHaveBeenCalled()
    })

    it('should throw NotFoundException if member does not exist', async () => {
      mockSelectWhere.mockResolvedValueOnce([])
      await expect(service.updateMemberRole('member-1', 'workspace-1', updateData)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw ForbiddenException if member does not belong to the workspace', async () => {
      mockSelectWhere.mockResolvedValueOnce([
        {
          id: 'member-1',
          workspaceId: 'different-workspace',
          userId: 'user-1',
          ownerId: 'owner-1',
          role: 'EDITOR',
        },
      ])
      await expect(service.updateMemberRole('member-1', 'workspace-1', updateData)).rejects.toThrow(
        ForbiddenException,
      )
    })

    it('should throw ForbiddenException if attempting to change the role of the workspace OWNER', async () => {
      mockSelectWhere.mockResolvedValueOnce([
        {
          id: 'member-1',
          workspaceId: 'workspace-1',
          userId: 'owner-id',
          ownerId: 'owner-id',
          role: 'OWNER',
        },
      ])
      await expect(service.updateMemberRole('member-1', 'workspace-1', updateData)).rejects.toThrow(
        ForbiddenException,
      )
    })

    it('should throw ForbiddenException if new role is the same as the current role', async () => {
      mockSelectWhere.mockResolvedValueOnce([
        {
          id: 'member-1',
          workspaceId: 'workspace-1',
          userId: 'user-1',
          ownerId: 'owner-id',
          role: 'ADMIN',
        },
      ])
      await expect(service.updateMemberRole('member-1', 'workspace-1', updateData)).rejects.toThrow(
        ForbiddenException,
      )
    })
  })

  describe('removeMember', () => {
    it('should delete an existing member if not owner and not kicking admin', async () => {
      mockSelectWhere.mockResolvedValueOnce([
        {
          id: 'member-1',
          workspaceId: 'workspace-1',
          userId: 'user-1',
          ownerId: 'owner-1',
          role: 'EDITOR',
        },
      ])
      mockDeleteReturning.mockResolvedValueOnce([{ id: 'member-1' }])

      await service.removeMember('member-1', 'workspace-1', 'owner-1')

      expect(mockDelete).toHaveBeenCalledWith(workspaceMembers)
      expect(mockDeleteReturning).toHaveBeenCalled()
    })

    it('should throw NotFoundException if member does not exist', async () => {
      mockSelectWhere.mockResolvedValueOnce([])
      await expect(service.removeMember('member-1', 'workspace-1', 'owner-1')).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw ForbiddenException if member does not belong to the workspace', async () => {
      mockSelectWhere.mockResolvedValueOnce([
        {
          id: 'member-1',
          workspaceId: 'different-workspace',
          userId: 'user-1',
          ownerId: 'owner-1',
          role: 'EDITOR',
        },
      ])
      await expect(service.removeMember('member-1', 'workspace-1', 'owner-1')).rejects.toThrow(
        ForbiddenException,
      )
    })

    it('should throw ForbiddenException if attempting to remove the workspace OWNER', async () => {
      mockSelectWhere.mockResolvedValueOnce([
        {
          id: 'member-1',
          workspaceId: 'workspace-1',
          userId: 'owner-id',
          ownerId: 'owner-id',
          role: 'OWNER',
        },
      ])
      await expect(
        service.removeMember('member-1', 'workspace-1', 'some-other-user'),
      ).rejects.toThrow(ForbiddenException)
    })

    it('should throw ForbiddenException if attempting to kick an ADMIN by a non-owner', async () => {
      mockSelectWhere.mockResolvedValueOnce([
        {
          id: 'member-1',
          workspaceId: 'workspace-1',
          userId: 'admin-user',
          ownerId: 'owner-id',
          role: 'ADMIN',
        },
      ])
      await expect(
        service.removeMember('member-1', 'workspace-1', 'some-other-user'),
      ).rejects.toThrow(ForbiddenException)
    })

    it('should allow an ADMIN to leave voluntarily', async () => {
      mockSelectWhere.mockResolvedValueOnce([
        {
          id: 'member-1',
          workspaceId: 'workspace-1',
          userId: 'admin-user',
          ownerId: 'owner-id',
          role: 'ADMIN',
        },
      ])
      mockDeleteReturning.mockResolvedValueOnce([{ id: 'member-1' }])

      await service.removeMember('member-1', 'workspace-1', 'admin-user')

      expect(mockDelete).toHaveBeenCalledWith(workspaceMembers)
      expect(mockDeleteReturning).toHaveBeenCalled()
    })

    it('should allow the OWNER to remove an ADMIN', async () => {
      mockSelectWhere.mockResolvedValueOnce([
        {
          id: 'member-1',
          workspaceId: 'workspace-1',
          userId: 'admin-user',
          ownerId: 'owner-id',
          role: 'ADMIN',
        },
      ])
      mockDeleteReturning.mockResolvedValueOnce([{ id: 'member-1' }])

      await service.removeMember('member-1', 'workspace-1', 'owner-id')

      expect(mockDelete).toHaveBeenCalledWith(workspaceMembers)
      expect(mockDeleteReturning).toHaveBeenCalled()
    })
  })

  describe('findMemberById', () => {
    it('should return a member by id', async () => {
      const mockMember = { id: 'member-1' }
      mockSelectWhere.mockResolvedValueOnce([mockMember])

      const result = await service.findMemberById('member-1')

      expect(result).toEqual(mockMember)
    })

    it('should throw NotFoundException if member not found', async () => {
      mockSelectWhere.mockResolvedValueOnce([])
      await expect(service.findMemberById('member-1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('findMembersByWorkspaceId', () => {
    it('should return members for a workspace', async () => {
      const mockMembers = [
        { id: 'member-1', email: 'test@test.com' },
        { id: 'member-2', email: 'test2@test.com' },
      ]
      mockSelectWhere.mockResolvedValueOnce(mockMembers)

      const result = await service.findMembersByWorkspaceId('workspace-1')

      expect(result).toEqual(mockMembers)
    })
  })

  describe('findMemberByUserIdAndWorkspaceId', () => {
    it('should return a member', async () => {
      const mockMember = { id: 'member-1' }
      mockSelectWhere.mockResolvedValueOnce([mockMember])

      const result = await service.findMemberByUserIdAndWorkspaceId('user-1', 'workspace-1')

      expect(result).toEqual(mockMember)
    })

    it('should return null if not found', async () => {
      mockSelectWhere.mockResolvedValueOnce([])
      const result = await service.findMemberByUserIdAndWorkspaceId('user-1', 'workspace-1')
      expect(result).toBeNull()
    })
  })
})
