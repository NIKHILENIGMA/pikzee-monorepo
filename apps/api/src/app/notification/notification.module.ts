import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Resend } from 'resend'

import { NotificationService } from './notification.service'
import { EmailChannelProvider } from './providers/email.provider'

@Module({
  providers: [
    NotificationService,
    EmailChannelProvider,
    {
      provide: Resend,
      // Use a factory function to create the Resend instance with the API key from the configuration
      useFactory: (configService: ConfigService) => {
        const resendApiKey = configService.get<string>('RESEND_API_KEY')
        if (!resendApiKey) {
          throw new Error('Resend API key is not configured.')
        }
        return new Resend(resendApiKey)
      },
      inject: [ConfigService],
    },
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
