/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ZodValidationPipe } from 'nestjs-zod'

import { AppModule } from './app/app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true })
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Adjust this to your frontend's origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true, // Set to true if you are handling cookies/sessions
  })
  const globalPrefix = 'api'
  app.setGlobalPrefix(globalPrefix)
  app.useGlobalPipes(new ZodValidationPipe()) // Add ZodValidationPipe globally to validate incoming requests using Zod schemas
  const port = process.env.API_PORT || 3000
  await app.listen(port)
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`)
}

bootstrap()
