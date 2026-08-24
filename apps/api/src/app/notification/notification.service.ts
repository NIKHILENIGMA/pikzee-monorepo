import { Injectable } from '@nestjs/common'

import { NotificationPayload } from '@pikzee/shared-types'

import { EmailChannelProvider } from './providers/email.provider'

@Injectable()
export class NotificationService {
  constructor(private readonly emailProvider: EmailChannelProvider) {}

  async notify(payload: NotificationPayload): Promise<void> {
    const promises: Promise<void>[] = []

    if (payload.channel.includes('EMAIL')) {
      promises.push(this.emailProvider.send(payload))
    }

    // Add other channel providers here (SMS, IN_APP, PUSH_NOTIFICATION) as needed
    if (payload.channel.includes('IN_APP')) {
      // promises.push(this.inAppProvider.send(payload.event, payload.meta, payload.data))
    }

    // All notifications are sent in parallel, and we wait for all of them to settle (either fulfilled or rejected)
    await Promise.allSettled(promises)
  }
}
