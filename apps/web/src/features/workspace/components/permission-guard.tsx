import type { WorkspacePermission } from '@pikzee/shared-types'

import { useWorkspaceAuth } from '../hooks/use-workspace-auth'

import type { ReactNode } from 'react'

interface PermissionGuardProps {
  permissions: WorkspacePermission[]
  requireAll?: boolean
  children: ReactNode
  fallback?: ReactNode
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permissions,
  requireAll = true,
  children,
  fallback = null,
}) => {
  const { hasAnyPermission, hasAllPermissions } = useWorkspaceAuth()

  const isAuthorized = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions)

  if (!isAuthorized) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
