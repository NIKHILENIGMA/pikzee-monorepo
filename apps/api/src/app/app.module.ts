import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'

import { DbModule } from '@pikzee/shared-db'

import { AuthModule } from './auth/auth.module'
import { ClerkGuard } from './auth/guards/clerk-guard.guard'
import { AuthorizationModule } from './authorization/authorization.module'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
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
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ClerkGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
