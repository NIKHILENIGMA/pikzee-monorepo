import { ConflictException, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'

import { users, DbService, type CreateUserDto } from '@pikzee/shared-db'

@Injectable()
export class AppService {
  constructor(private readonly db: DbService) {}

  async createUser(createUserDto: CreateUserDto) {
    const [userExist] = await this.db.conn
      .select()
      .from(users)
      .where(eq(users.email, createUserDto.email))

    if (userExist) {
      throw new ConflictException(`User with email ${createUserDto.email} already exists`)
    }

    await this.db.conn.insert(users).values(createUserDto)
  }

  async getUsers() {
    const listUsers = await this.db.conn.select().from(users)

    return listUsers
  }
}
