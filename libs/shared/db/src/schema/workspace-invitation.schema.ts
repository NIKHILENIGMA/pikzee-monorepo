import { pgTable, varchar, timestamp, uuid, pgEnum } from 'drizzle-orm/pg-core'

import { InvitationStatus } from '@pikzee/shared-types'

import { workspaces, memberRoleEnum } from './workspace.schema'

export const invitationStatusEnum = pgEnum(
  'invitation_status',
  Object.values(InvitationStatus) as [string, ...string[]],
)

export const workspaceInvitations = pgTable('workspace_invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .references(() => workspaces.id)
    .notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  inviterId: uuid('inviter_id')
    .references(() => workspaces.id)
    .notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  role: memberRoleEnum('role').notNull(),
  status: invitationStatusEnum('status').notNull().default('PENDING'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
