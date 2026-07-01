import { Controller, Get, Body, Patch, Param, Delete, Post } from '@nestjs/common'

import { CurrentUser } from '../auth/decorators/current-user.decorator'

import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserResponseDto } from './dto/user-response.dto'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser('userId') userId: string) {
    return this.usersService.findUserById(userId)
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.createFromClerk(createUserDto)
  }

  @Get()
  findAll() {
    return this.usersService.findAllUsers()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findUserById(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateFromClerk(id, updateUserDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.deleteFromClerk(id)
  }
}
