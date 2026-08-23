import { ConflictException, ForbiddenException } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'

import { WorkspaceRole } from '@pikzee/shared-types'

import { ClerkGuard } from '../auth/guards/clerk-guard.guard'
import { WorkspacePermissionGuard } from '../authorization/guard/workspace-permission.guard'

import { InvitationController } from './invitation.controller'
import { InvitationService } from './invitation.service'

describe('InvitationController', () => {
  let controller: InvitationController
  let invitationService: jest.Mocked<Partial<InvitationService>>

  beforeEach(async () => {
    invitationService = {
      createInvitation: jest.fn(),
      getPendingInvitations: jest.fn(),
      getPublicInviteDetails: jest.fn(),
      acceptInvitation: jest.fn(),
      revokeInvitation: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitationController],
      providers: [{ provide: InvitationService, useValue: invitationService }],
    })
      .overrideGuard(ClerkGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspacePermissionGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<InvitationController>(InvitationController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('createInvitation', () => {
    it('should create an invitation successfully', async () => {
      invitationService.createInvitation.mockResolvedValue({
        token: 'mock-token',
        expiresAt: new Date(),
      })

      await controller.createInvitation(
        'ws-1',
        'test@example.com',
        WorkspaceRole.EDITOR,
        'inviter-1',
      )

      expect(invitationService.createInvitation).toHaveBeenCalledWith(
        'ws-1',
        'test@example.com',
        WorkspaceRole.EDITOR,
        'inviter-1',
      )
    })

    it('should pass through ConflictException if user is already a member', async () => {
      invitationService.createInvitation.mockRejectedValue(
        new ConflictException('User is already a member'),
      )

      await expect(
        controller.createInvitation('ws-1', 'test@example.com', WorkspaceRole.EDITOR, 'inviter-1'),
      ).rejects.toThrow(ConflictException)
    })
  })

  describe('getPendingInvitations', () => {
    it('should return pending invitations', async () => {
      const mockInvites = [{ id: '1', email: 'test@example.com' }] as never[]
      invitationService.getPendingInvitations.mockResolvedValue(mockInvites)

      const result = await controller.getPendingInvitations('ws-1')

      expect(invitationService.getPendingInvitations).toHaveBeenCalledWith('ws-1')
      expect(result).toEqual(mockInvites)
    })
  })

  describe('getPublicInviteDetails', () => {
    it('should return masked invite details', async () => {
      const mockDetails = { email: 'test@example.com', role: WorkspaceRole.EDITOR } as never
      invitationService.getPublicInviteDetails.mockResolvedValue(mockDetails)

      const result = await controller.getPublicInviteDetails('valid-token')

      expect(invitationService.getPublicInviteDetails).toHaveBeenCalledWith('valid-token')
      expect(result).toEqual(mockDetails)
    })
  })

  describe('acceptInvitation', () => {
    it('should accept an invitation successfully', async () => {
      invitationService.acceptInvitation.mockResolvedValue(undefined)

      await controller.acceptInvitation('valid-token', 'user-1', 'test@example.com')

      expect(invitationService.acceptInvitation).toHaveBeenCalledWith(
        'valid-token',
        'user-1',
        'test@example.com',
      )
    })

    it('should pass through ForbiddenException if email mismatch', async () => {
      invitationService.acceptInvitation.mockRejectedValue(
        new ForbiddenException('Email does not match'),
      )

      await expect(
        controller.acceptInvitation('valid-token', 'user-1', 'wrong@example.com'),
      ).rejects.toThrow(ForbiddenException)
    })
  })

  describe('revokeInvitation', () => {
    it('should revoke an invitation successfully', async () => {
      invitationService.revokeInvitation.mockResolvedValue({ message: 'Success' })

      await controller.revokeInvitation('ws-1', 'invite-1')

      expect(invitationService.revokeInvitation).toHaveBeenCalledWith('ws-1', 'invite-1')
    })
  })
})
