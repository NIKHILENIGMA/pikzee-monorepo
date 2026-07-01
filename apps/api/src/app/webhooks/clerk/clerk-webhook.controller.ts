import {
  Controller,
  Post,
  Req,
  Headers,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { Request } from 'express'
import { Webhook } from 'svix'

import { ClerkWebhookEvent } from '@pikzee/shared-types'

import { Public } from '../../auth/decorators/public.decorator'

import { ClerkWebhookService } from './clerk-webhook.service'

@Controller('webhooks')
export class ClerkWebhookController {
  constructor(private readonly webhookService: ClerkWebhookService) {}

  @Public()
  @Post('clerk')
  @HttpCode(HttpStatus.OK)
  async handleClerkWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ) {
    // Validate the webhook signature using the svix library
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
    if (!webhookSecret) {
      throw new BadRequestException('CLERK_WEBHOOK_SECRET is not configured')
    }

    // Validate the presence of required headers and raw body
    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new BadRequestException('Missing svix headers')
    }

    // Validate the presence of raw body
    if (!req.rawBody) {
      throw new BadRequestException('Missing raw request body')
    }

    const payload: string = req.rawBody.toString('utf8')
    const headers = {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }

    const wh = new Webhook(webhookSecret)
    let event: ClerkWebhookEvent

    try {
      event = wh.verify(payload, headers) as ClerkWebhookEvent
    } catch (_err) {
      throw new BadRequestException('Invalid signature verification')
    }

    await this.webhookService.processEvent(event)
    return { success: true }
  }
}
