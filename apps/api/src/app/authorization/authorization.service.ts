import { Injectable } from '@nestjs/common'

export enum WorkspacePermission {
  WORKSPACE_READ = 'workspace:read',
  WORKSPACE_WRITE = 'workspace:write',
  WORKSPACE_DELETE = 'workspace:delete',
  WORKSPACE_INVITE = 'workspace:invite',
  ASSET_READ = 'asset:read',
  ASSET_WRITE = 'asset:write',
  ASSET_DELETE = 'asset:delete',
  ASSET_SHARE = 'asset:share',
  DOCUMENT_CREATE = 'document:create',
  DOCUMENT_READ = 'document:read',
  DOCUMENT_WRITE = 'document:write',
  DOCUMENT_DELETE = 'document:delete',
  DOCUMENT_SHARE = 'document:share',
  DOCUMENT_COMMENT = 'document:comment',
  PROJECT_CREATE = 'project:create',
  PROJECT_READ = 'project:read',
  PROJECT_WRITE = 'project:write',
  PROJECT_DELETE = 'project:delete',
  PROJECT_SHARE = 'project:share',
  PUBLISH_ASSET = 'publish:asset',
  ADD_PLATFORM = 'add:platform',
}

export enum WorkspaceRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  COMMENTER = 'COMMENTER',
  VIEWER = 'VIEWER',
}

export const ROLE_PERMISSIONS: Record<WorkspaceRole, WorkspacePermission[]> = {
  [WorkspaceRole.ADMIN]: [
    WorkspacePermission.WORKSPACE_READ,
    WorkspacePermission.WORKSPACE_WRITE,
    WorkspacePermission.WORKSPACE_DELETE,
    WorkspacePermission.WORKSPACE_INVITE,
    WorkspacePermission.ASSET_READ,
    WorkspacePermission.ASSET_WRITE,
    WorkspacePermission.ASSET_DELETE,
    WorkspacePermission.ASSET_SHARE,
    WorkspacePermission.DOCUMENT_CREATE,
    WorkspacePermission.DOCUMENT_READ,
    WorkspacePermission.DOCUMENT_WRITE,
    WorkspacePermission.DOCUMENT_DELETE,
    WorkspacePermission.DOCUMENT_SHARE,
    WorkspacePermission.DOCUMENT_COMMENT,
    WorkspacePermission.PROJECT_CREATE,
    WorkspacePermission.PROJECT_READ,
    WorkspacePermission.PROJECT_WRITE,
    WorkspacePermission.PROJECT_DELETE,
    WorkspacePermission.PROJECT_SHARE,
    WorkspacePermission.PUBLISH_ASSET,
    WorkspacePermission.ADD_PLATFORM,
  ],
  [WorkspaceRole.EDITOR]: [
    WorkspacePermission.WORKSPACE_READ,
    WorkspacePermission.ASSET_READ,
    WorkspacePermission.ASSET_WRITE,
    WorkspacePermission.DOCUMENT_CREATE,
    WorkspacePermission.DOCUMENT_READ,
    WorkspacePermission.DOCUMENT_WRITE,
    WorkspacePermission.DOCUMENT_COMMENT,
    WorkspacePermission.PROJECT_CREATE,
    WorkspacePermission.PROJECT_READ,
    WorkspacePermission.PROJECT_WRITE,
    WorkspacePermission.PUBLISH_ASSET,
    WorkspacePermission.ADD_PLATFORM,
  ],
  [WorkspaceRole.COMMENTER]: [
    WorkspacePermission.WORKSPACE_READ,
    WorkspacePermission.ASSET_READ,
    WorkspacePermission.DOCUMENT_READ,
    WorkspacePermission.DOCUMENT_COMMENT,
  ],
  [WorkspaceRole.VIEWER]: [
    WorkspacePermission.WORKSPACE_READ,
    WorkspacePermission.ASSET_READ,
    WorkspacePermission.DOCUMENT_READ,
  ],
}

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
