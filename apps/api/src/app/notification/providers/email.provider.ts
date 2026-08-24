import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Resend } from 'resend'

import {
  NotificationChannelProvider,
  NotificationEventEnum,
  NotificationPayload,
} from '@pikzee/shared-types'

@Injectable()
export class EmailChannelProvider implements NotificationChannelProvider {
  private readonly logger = new Logger(EmailChannelProvider.name)
  constructor(
    private readonly resend: Resend,
    private readonly configService: ConfigService,
  ) {}

  async send(payload: NotificationPayload): Promise<void> {
    if (!payload.recipient) {
      throw new BadRequestException('Recipient email is required for sending notifications.')
    }

    let templateVariables: Record<string, string>

    const templateMapping: Record<NotificationEventEnum, string> = {
      [NotificationEventEnum.WORKSPACE_INVITATION]:
        this.configService.get<string>('RESEND_INVITE_TEMPLATE_ID') || 'default',
      [NotificationEventEnum.WELCOME_EMAIL]:
        this.configService.get<string>('RESEND_WELCOME_TEMPLATE_ID') || 'default',
    }

    const templateId = templateMapping[payload.event]

    if (!templateId || templateId.startsWith('default')) {
      // this.logger.warn(`No Resend template ID configured for event: ${payload.event}`)
      return
    }

    switch (payload.event) {
      case NotificationEventEnum.WORKSPACE_INVITATION:
        templateVariables = {
          workspaceName: payload.meta.workspaceName || '',
          inviterName: payload.meta.inviterName || '',
          invitationLink: payload.meta.invitationLink || '',
        }
        break
      case NotificationEventEnum.WELCOME_EMAIL:
        templateVariables = {
          userName: payload.meta.userName || '',
          welcomeMessage: payload.meta.welcomeMessage || '',
        }
        break
      default:
        throw new BadRequestException(`Unsupported notification event: ${payload.event}`)
    }

    try {
      // Here you would integrate with an actual email service provider (like SendGrid, SES, etc.)
      await this.resend.emails.send({
        to: payload.recipient,
        from: this.configService.get<string>('RESEND_FROM_EMAIL') || 'noreply@send.pikzee.com', // fallback to a default sender email if not configured
        template: {
          id: templateId,
          variables: templateVariables,
        },
      })
    } catch (error) {
      this.logger.error(`Failed to send email to ${payload.recipient}:`, error)
      throw new InternalServerErrorException('Failed to send email') // Re-throw as a more specific error
    }
  }
}
