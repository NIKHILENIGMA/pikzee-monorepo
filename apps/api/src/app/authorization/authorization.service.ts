import { Injectable } from '@nestjs/common'

import { WorkspaceRole, WorkspacePermission, ROLE_PERMISSIONS } from '@pikzee/shared-types'

@Injectable()
export class AuthorizationService {
  async resolvePermissions(context: {
    workspaceId: string
    userId: string
    role: WorkspaceRole
  }): Promise<WorkspacePermission[]> {
    const { role } = context

    return ROLE_PERMISSIONS[role] || []
  }
}
