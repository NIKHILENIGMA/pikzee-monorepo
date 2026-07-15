---
title: Workspace Members
description: Managing existing workspace members, retrieving member lists, and updating roles.
---

# 👥 Workspace Member Management

This feature handles the management of users who have joined a workspace, including retrieving member lists, updating user roles, and removing members.

---

## 1. Member Operations

- **List Members (`GET /workspaces/:id/members`):** Returns a list of all active users in the workspace, including their profile details (Clerk user data) and workspace-specific roles.
- **Update Role (`PATCH /workspaces/:id/members/:memberId`):** Allows workspace Owners to update another member's role (e.g., promoting an `EDITOR` to an `OWNER` or demoting to `GUEST`).
- **Remove Member (`DELETE /workspaces/:id/members/:memberId`):** Revokes a user's membership. This instantly blocks their access token from querying any resources scoped to the workspace.

---

## 2. Drizzle Database Schema

Membership is managed via the `workspace_members` join table:

```typescript
export const workspaceMembers = pgTable('workspace_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull(),
  userId: uuid('user_id').notNull(),
  role: text('role').notNull(), // 'OWNER', 'EDITOR', 'COMMENTOR', 'GUEST'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
```
