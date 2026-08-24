import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'

import { DbModule } from '@pikzee/shared-db'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { ClerkGuard } from './auth/guards/clerk-guard.guard'
import { AuthorizationModule } from './authorization/authorization.module'
import { validateApiEnv } from './config/env.validator'
import { InvitationModule } from './invitation/invitation.module'
import { MembersModule } from './members/members.module'
import { NotificationModule } from './notification/notification.module'
import { UsersModule } from './users/users.module'
import { WebhooksModule } from './webhooks/webhooks.module'
import { WorkspaceModule } from './workspace/workspace.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/api/.env',
      validate: validateApiEnv,
      isGlobal: true,
    }),
    DbModule,
    AuthModule,
    UsersModule,
    WebhooksModule,
    WorkspaceModule,
    AuthorizationModule,
    MembersModule,
    InvitationModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ClerkGuard,
    },
  ],
})
export class AppModule {}
