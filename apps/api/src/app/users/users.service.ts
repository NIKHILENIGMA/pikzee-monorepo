import { Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'

import { DbService, users } from '@pikzee/shared-db'
import { CreateUserDto, UpdateUserDto } from '@pikzee/shared-types'

@Injectable()
export class UsersService {
  constructor(private readonly db: DbService) {}

  async createFromClerk(data: CreateUserDto) {
    const [user] = await this.db.conn.insert(users).values(data).returning()
    return user
  }

  async updateFromClerk(id: string, data: UpdateUserDto) {
    const [user] = await this.db.conn
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning()
    return user
  }

  async deleteFromClerk(id: string) {
    const [user] = await this.db.conn.delete(users).where(eq(users.id, id)).returning()
    return user
  }

  async findUserById(id: string) {
    return this.db.conn.query.users.findFirst({
      where: eq(users.id, id),
    })
  }

  async findAllUsers() {
    return this.db.conn.select().from(users)
  }
}
