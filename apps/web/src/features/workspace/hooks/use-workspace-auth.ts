import { useMemo } from 'react'

import {
  type WorkspacePermission,
  type WorkspaceRole,
  ROLE_PERMISSIONS,
} from '@pikzee/shared-types'

export const useWorkspaceAuth = () => {
  // TODO: Human to implement fetching actual role from workspace context
  // const { currentMembership } = useWorkspaceContext()
  const role = 'VIEWER' as WorkspaceRole // STUB

  const permissions = useMemo(() => {
    return ROLE_PERMISSIONS[role] || []
  }, [role])

  const hasPermission = (permission: WorkspacePermission) => {
    return permissions.includes(permission)
  }

  const hasAnyPermission = (requiredPermissions: WorkspacePermission[]) => {
    return requiredPermissions.some((p) => permissions.includes(p))
  }

  const hasAllPermissions = (requiredPermissions: WorkspacePermission[]) => {
    return requiredPermissions.every((p) => permissions.includes(p))
  }

  return {
    role,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  }
}
