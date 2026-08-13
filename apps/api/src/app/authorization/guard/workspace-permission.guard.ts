import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { WorkspacePermission, WorkspaceRole } from '@pikzee/shared-types'

import { MembersService } from '../../members/members.service'
import { AuthorizationService } from '../authorization.service'

@Injectable()
export class WorkspacePermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private membersService: MembersService,
    private resolver: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<WorkspacePermission[]>(
      'permissions',
      context.getHandler(),
    )

    const request = context.switchToHttp().getRequest()

    const userId = request.user?.id
    const workspaceId = request.params?.workspaceId

    if (!userId || !workspaceId) {
      return false
    }

    const membership = await this.membersService.findMemberByUserIdAndWorkspaceId(
      userId,
      workspaceId,
    )

    if (!membership) {
      return false
    }

    request.membership = membership

    const allowSelf = this.reflector.get<boolean>('allow_self', context.getHandler())
    if (allowSelf && request.params?.memberId === membership.id) {
      return true
    }

    const userPermissions = await this.resolver.resolvePermissions({
      workspaceId,
      userId,
      role: membership.role as WorkspaceRole,
    })

    return requiredPermissions.every((permission) => userPermissions.includes(permission))
  }
}
