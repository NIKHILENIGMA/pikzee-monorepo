import { Test, type TestingModule } from '@nestjs/testing'

import { ClerkGuard } from '../auth/guards/clerk-guard.guard'
import { WorkspacePermissionGuard } from '../authorization/guard/workspace-permission.guard'

import { MembersController } from './members.controller'
import { MembersService } from './members.service'

import type { UpdateMemberDto } from './dto/update-member.dto'

describe('MembersController', () => {
  let controller: MembersController
  let membersService: jest.Mocked<MembersService>

  beforeEach(async () => {
    membersService = {
      findMembersByWorkspaceId: jest.fn(),
      updateMemberRole: jest.fn(),
      removeMember: jest.fn(),
    } as unknown as jest.Mocked<MembersService>

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [{ provide: MembersService, useValue: membersService }],
    })
      .overrideGuard(ClerkGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspacePermissionGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<MembersController>(MembersController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getMembers', () => {
    it('should return a list of members for a workspace', async () => {
      membersService.findMembersByWorkspaceId.mockResolvedValue([])
      const result = await controller.getMembers('ws-1')
      expect(result).toEqual([])
      expect(membersService.findMembersByWorkspaceId).toHaveBeenCalledWith('ws-1')
    })
  })

  describe('updateMember', () => {
    it('should call updateMemberRole on the service', async () => {
      membersService.updateMemberRole.mockResolvedValue(undefined)
      const updateDto: UpdateMemberDto = { role: 'EDITOR' }

      await controller.updateMember('ws-1', 'member-1', updateDto)

      expect(membersService.updateMemberRole).toHaveBeenCalledWith('member-1', 'ws-1', updateDto)
    })
  })

  describe('removeMember', () => {
    it('should call removeMember on the service with the requestUserId', async () => {
      membersService.removeMember.mockResolvedValue(undefined)

      await controller.removeMember('user-1', 'ws-1', 'member-1')

      expect(membersService.removeMember).toHaveBeenCalledWith('member-1', 'ws-1', 'user-1')
    })
  })
})
