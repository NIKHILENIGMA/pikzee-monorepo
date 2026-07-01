import { pgTable, varchar, timestamp, text, uuid } from 'drizzle-orm/pg-core'

import type { InferSelectModel, InferInsertModel } from 'drizzle-orm/table'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: uuid('clerk_id').notNull().unique(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  avatarImage: text('avatar_image_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type CreateUserDto = InferInsertModel<typeof users>
export type User = InferSelectModel<typeof users>
