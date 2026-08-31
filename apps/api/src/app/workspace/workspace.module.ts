import { Module } from '@nestjs/common'

import { AuthorizationModule } from '../authorization/authorization.module'
import { MembersModule } from '../members/members.module'

import { WorkspaceController } from './workspace.controller'
import { WorkspaceService } from './workspace.service'

@Module({
  imports: [AuthorizationModule, MembersModule],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
