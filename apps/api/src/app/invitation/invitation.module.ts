import { Module } from '@nestjs/common'

import { DbModule } from '@pikzee/shared-db'

import { InvitationController } from './invitation.controller'
import { InvitationService } from './invitation.service'

@Module({
  imports: [DbModule],
  controllers: [InvitationController],
  providers: [InvitationService],
})
export class InvitationModule {}
