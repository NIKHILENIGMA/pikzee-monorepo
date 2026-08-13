import { Module, forwardRef } from '@nestjs/common'

import { DbModule } from '@pikzee/shared-db'

import { AuthorizationModule } from '../authorization/authorization.module'

import { MembersController } from './members.controller'
import { MembersService } from './members.service'

@Module({
  imports: [DbModule, forwardRef(() => AuthorizationModule)],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
