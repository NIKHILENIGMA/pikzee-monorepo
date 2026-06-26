import { Body, Controller, Get, Post } from '@nestjs/common'

import type { CreateUserDto } from '@pikzee/shared-db'

import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('users')
  getUsers() {
    return this.appService.getUsers()
  }

  @Post('users')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.appService.createUser(createUserDto)
  }
}
