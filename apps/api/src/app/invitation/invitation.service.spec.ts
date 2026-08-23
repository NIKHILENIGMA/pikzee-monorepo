import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import { Resend } from 'resend'

import { DbService } from '@pikzee/shared-db'
import { InvitationStatus, WorkspaceRole } from '@pikzee/shared-types'

import { MembersService } from '../members/members.service'

import { InvitationService } from './invitation.service'

describe('InvitationService', () => {
  let service: InvitationService
  let mockQueryBuilder: Record<string, jest.Mock>

  beforeEach(async () => {
    // 1. Properly mocking the Drizzle Query Builder chain
    mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue([]), // Default: return empty array (no results found)
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockResolvedValue([{ id: 'new-id' }]),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      transaction: jest.fn().mockImplementation(async (cb) => {
        // Pass the mock query builder as the transaction (tx) object
        return cb(mockQueryBuilder)
      }),
    }

    const dbServiceMock = { conn: mockQueryBuilder }
    const membersServiceMock = {} // No methods currently called directly in InvitationService
    const resendMock = { emails: { send: jest.fn().mockResolvedValue(true) } }

    // 2. Injected the missing providers
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationService,
        { provide: DbService, useValue: dbServiceMock },
        { provide: MembersService, useValue: membersServiceMock },
        { provide: Resend, useValue: resendMock },
      ],
    }).compile()

    service = module.get<InvitationService>(InvitationService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('createInvitation', () => {
    it('should create an invitation successfully and send an email', async () => {
      // Both queries (member check, pending invite check) return empty arrays by default
      const result = await service.createInvitation(
        'ws-1',
        'test@example.com',
        WorkspaceRole.EDITOR,
        'inviter-1',
      )

      expect(result).toHaveProperty('token')
      expect(mockQueryBuilder.insert).toHaveBeenCalled()
    })

    it('should throw ConflictException if user is already an active member of the workspace', async () => {
      // Mock the first query to return a member
      mockQueryBuilder.where.mockResolvedValueOnce([{ id: 'existing-member' }])

      await expect(
        service.createInvitation('ws-1', 'existing@example.com', WorkspaceRole.EDITOR, 'inviter-1'),
      ).rejects.toThrow(ConflictException)
    })

    it('should throw ConflictException if a PENDING invitation already exists for this email', async () => {
      // 1st query (member check): no member found
      mockQueryBuilder.where.mockResolvedValueOnce([])
      // 2nd query (pending check): pending invite found
      mockQueryBuilder.where.mockResolvedValueOnce([{ id: 'pending-invite' }])

      await expect(
        service.createInvitation('ws-1', 'pending@example.com', WorkspaceRole.EDITOR, 'inviter-1'),
      ).rejects.toThrow(ConflictException)
    })
  })

  describe('acceptInvitation', () => {
    const validInvite = {
      workspaceId: 'ws-1',
      email: 'test@example.com',
      role: WorkspaceRole.EDITOR,
      status: InvitationStatus.PENDING,
      expiresAt: new Date(Date.now() + 100000),
    }

    it('should successfully accept an invitation inside a transaction', async () => {
      mockQueryBuilder.where.mockResolvedValueOnce([validInvite])

      await service.acceptInvitation('valid-token', 'user-1', 'test@example.com')

      expect(mockQueryBuilder.transaction).toHaveBeenCalled()
      expect(mockQueryBuilder.update).toHaveBeenCalled()
    })

    it('should throw ForbiddenException if authenticated email does not match invited email', async () => {
      mockQueryBuilder.where.mockResolvedValueOnce([validInvite])

      await expect(
        service.acceptInvitation('valid-token', 'user-1', 'different@example.com'),
      ).rejects.toThrow(ForbiddenException)
    })

    it('should throw NotFoundException if token is invalid or expired', async () => {
      // Returns empty array -> invite not found
      mockQueryBuilder.where.mockResolvedValueOnce([])

      await expect(
        service.acceptInvitation('invalid-token', 'user-1', 'test@example.com'),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('revokeInvitation', () => {
    it('should successfully revoke a pending invitation', async () => {
      mockQueryBuilder.where.mockResolvedValueOnce([{ status: InvitationStatus.PENDING }])

      await service.revokeInvitation('invite-1', 'ws-1')

      expect(mockQueryBuilder.update).toHaveBeenCalled()
    })

    it('should throw NotFoundException if invitation is not found', async () => {
      mockQueryBuilder.where.mockResolvedValueOnce([]) // Empty array

      await expect(service.revokeInvitation('invalid-invite', 'ws-1')).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw BadRequestException if invitation is not PENDING', async () => {
      mockQueryBuilder.where.mockResolvedValueOnce([{ status: InvitationStatus.ACCEPTED }])

      await expect(service.revokeInvitation('invite-1', 'ws-1')).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('getPendingInvitations', () => {
    it('should return a list of pending invitations', async () => {
      const mockInvites = [{ id: '1' }, { id: '2' }]
      mockQueryBuilder.where.mockResolvedValueOnce(mockInvites)

      const result = await service.getPendingInvitations('ws-1')
      expect(result).toEqual(mockInvites)
    })
  })

  describe('getPublicInviteDetails', () => {
    it('should return masked details for a valid token', async () => {
      mockQueryBuilder.where.mockResolvedValueOnce([
        {
          workspaceId: 'ws-1',
          email: 'test@example.com',
          role: WorkspaceRole.EDITOR,
          status: InvitationStatus.PENDING,
          expiresAt: new Date(Date.now() + 100000),
        },
      ])

      const result = await service.getPublicInviteDetails('valid-token')

      expect(result).toHaveProperty('workspaceId', 'ws-1')
      expect(result).toHaveProperty('email', 'test@example.com')
      expect(result).toHaveProperty('role', WorkspaceRole.EDITOR)
    })
  })
})
