import { SetMetadata } from '@nestjs/common'

import { type WorkspacePermission } from '@pikzee/shared-types'

export const RequirePermissions = (...permissions: WorkspacePermission[]) =>
  SetMetadata('permissions', permissions)
