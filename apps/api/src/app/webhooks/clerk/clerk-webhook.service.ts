import { Injectable, Logger } from '@nestjs/common'

import { ClerkWebhookData, ClerkWebhookEvent } from '@pikzee/shared-types'

import { UsersService } from '../../users/users.service'

@Injectable()
export class ClerkWebhookService {
  private readonly logger = new Logger(ClerkWebhookService.name)

  constructor(private readonly usersService: UsersService) {}

  async processEvent(event: ClerkWebhookEvent) {
    this.logger.log(`Processing Clerk webhook event: ${event.type}`)

    switch (event.type) {
      case 'user.created':
        await this.handleUserCreated(event.data)
        break
      case 'user.updated':
        await this.handleUserUpdated(event.data)
        break
      case 'user.deleted':
        await this.handleUserDeleted(event.data)
        break
      default:
        this.logger.warn(`Unhandled webhook event type: ${event.type}`)
    }
  }

  private async handleUserCreated(data: ClerkWebhookData) {
    const id = data.id
    const email = data.email_addresses?.[0]?.email_address
    const firstName = data.first_name
    const lastName = data.last_name
    const avatarImage = data.image_url

    if (!email) {
      this.logger.error(`No email found for created user: ${id}`)
      return
    }

    // Create the user in the local database
    await this.usersService.createFromClerk({
      clerkId: id,
      email,
      firstName,
      lastName,
      avatarImage,
    })
    this.logger.log(`Successfully synced created user: ${id}`)
  }

  private async handleUserUpdated(data: ClerkWebhookData) {
    const user = {
      clerkId: data.id,
      email: data.email_addresses?.[0]?.email_address,
      firstName: data.first_name,
      lastName: data.last_name,
      avatarImage: data.image_url,
    }

    const existingUser = await this.usersService.findUserByClerkId(user.clerkId)
    if (!existingUser) {
      this.logger.error(`User with Clerk ID ${user.clerkId} not found for update`)
      // throw new ForbiddenException(`User with Clerk ID ${user.clerkId} not found`)
      return
    }

    // Update the user in the local database
    await this.usersService.updateFromClerk(existingUser.id, user)
    this.logger.log(`Successfully synced updated user: ${user.clerkId}`)
  }

  private async handleUserDeleted(data: ClerkWebhookData) {
    const user = {
      clerkId: data.id,
      email: data.email_addresses?.[0]?.email_address,
      firstName: data.first_name,
      lastName: data.last_name,
      avatarImage: data.image_url,
    }

    const existingUser = await this.usersService.findUserByClerkId(user.clerkId)
    if (!existingUser) {
      this.logger.error(`User with Clerk ID ${user.clerkId} not found for deletion`)
      // throw new ForbiddenException(`User with Clerk ID ${user.clerkId} not found`)
      return
    }

    await this.usersService.deleteFromClerk(existingUser.id)
    this.logger.log(`Successfully synced deleted user: ${user.clerkId}`)
  }
}
