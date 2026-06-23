import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { DbModule } from '@pikzee/shared-db'

import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DbModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
