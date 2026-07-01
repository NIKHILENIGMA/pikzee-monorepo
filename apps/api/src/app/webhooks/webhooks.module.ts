import { Module } from '@nestjs/common'

import { UsersModule } from '../users/users.module'

import { ClerkWebhookController } from './clerk/clerk-webhook.controller'
import { ClerkWebhookService } from './clerk/clerk-webhook.service'

@Module({
  imports: [UsersModule],
  controllers: [ClerkWebhookController],
  providers: [ClerkWebhookService],
})
export class WebhooksModule {}
