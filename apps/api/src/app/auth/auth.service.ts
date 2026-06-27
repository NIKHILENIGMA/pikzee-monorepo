import { ConflictException, Injectable } from '@nestjs/common'

import { CreateAuthDto } from './dto/create-auth.dto'
import { UpdateAuthDto } from './dto/update-auth.dto'

@Injectable()
export class AuthService {
  create(createAuthDto: CreateAuthDto) {
    if (!createAuthDto) {
      throw new ConflictException('Email and password are required')
    }
    return `This action adds a new auth with email`
  }

  findAll() {
    return `This action returns all auth`
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${updateAuthDto} auth`
  }

  remove(id: number) {
    return `This action removes a #${id} auth`
  }
}
