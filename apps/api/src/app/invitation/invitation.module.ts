import { Module } from '@nestjs/common'

import { DbModule } from '@pikzee/shared-db'

import { AuthorizationModule } from '../authorization/authorization.module'
import { MembersModule } from '../members/members.module'
import { NotificationModule } from '../notification/notification.module'

import { InvitationController } from './invitation.controller'
import { InvitationService } from './invitation.service'

@Module({
  imports: [DbModule, AuthorizationModule, MembersModule, NotificationModule],
  controllers: [InvitationController],
  providers: [InvitationService],
})
export class InvitationModule {}
