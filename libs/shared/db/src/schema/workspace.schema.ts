import { pgTable, varchar, timestamp, text, uuid, pgEnum } from 'drizzle-orm/pg-core'

import { users } from './user.schema'

export const roles = ['ADMIN', 'EDITOR', 'COMMENTER', 'VIEWER'] as const
export const memberRoleEnum = pgEnum('member_role', roles)

export const status = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const
export const workspaceStatusEnum = pgEnum('workspace_status', status)

export const workspaces = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 150 }).notNull(),
  slug: varchar('slug', { length: 150 }).notNull().unique(),
  logoUrl: text('logo_url'),
  ownerId: uuid('owner_id')
    .references(() => users.id)
    .notNull(),
  status: workspaceStatusEnum('status').notNull().default('ACTIVE'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

/**
 * Links users to workspaces and stores each member's access role.
 * Use this table to check who belongs to a workspace and what they can do.
 */
export const workspaceMembers = pgTable('workspace_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .references(() => workspaces.id)
    .notNull(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  role: memberRoleEnum('role').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
