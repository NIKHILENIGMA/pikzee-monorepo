import { Module, forwardRef } from '@nestjs/common'

import { MembersModule } from '../members/members.module'

import { AuthorizationService } from './authorization.service'
import { WorkspacePermissionGuard } from './guard/workspace-permission.guard'

@Module({
  imports: [forwardRef(() => MembersModule)],
  providers: [AuthorizationService, WorkspacePermissionGuard],
  exports: [AuthorizationService, WorkspacePermissionGuard],
})
export class AuthorizationModule {}
