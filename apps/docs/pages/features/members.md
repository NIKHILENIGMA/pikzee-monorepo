---
title: Workspace Members
description: Managing existing workspace members, retrieving member lists, and updating roles.
---

# 👥 Workspace Member Management

This feature handles the management of users who have joined a workspace, including retrieving member lists, updating user roles, and removing members.

---

## 1. Member Table

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

### Table Columns Explanation

- `id`: A unique identifier (UUID) generated automatically for each membership record.
- `workspaceId`: The UUID of the workspace this membership belongs to. Links the member to a specific workspace.
- `userId`: The ID of the user (from Clerk auth) who is a member of the workspace.
- `role`: The permissions level the user has within the workspace. Valid roles: `OWNER`, `EDITOR`, `COMMENTOR`, `GUEST`.
- `createdAt`: The timestamp when the user joined the workspace.
- `updatedAt`: The timestamp of the last time this membership record was updated (e.g., when their role changed).

---

## 2. API Endpoints

### 1. List Workspace Members

- **URL:** `/api/workspaces/:workspaceId/members`
- **Method:** `GET`
- **Success Status Code:** `200 OK`
- **Error Status Codes:**
  - `401 Unauthorized` (Not authenticated)
  - `403 Forbidden` (User does not have `MEMBER_READ` permissions)
- **Flow:**
  1. **Client Request:** The client sends a `GET` request to the endpoint, including the user's authentication token.
  2. **Authentication:** The API verifies the token globally, extracting the requesting `userId`. If missing/invalid, returns `401 Unauthorized`.
  3. **Authorization:** The `WorkspacePermissionGuard` verifies the `userId` is a member of `workspaceId` with `MEMBER_READ` permission. Returns `403 Forbidden` if denied.
  4. **Business Logic & Database Query:**
     - **Business Logic:**
       - Retrieve all active members that belong to the requested workspace.
       - Ensure that each member's role is attached to their profile so the frontend can render permissions correctly.
       - Rely entirely on our local database to avoid rate limits or latency from external Clerk API calls.
     - **Database Query:**
       - The `MembersService` queries the `workspace_members` table for all records where `workspaceId` matches.
       - A SQL `JOIN` is performed against the local `users` table using the `userId` column.
       - This single query efficiently fetches both the membership data (role, joined date) and user profile details (name, email, avatar).
  5. **Response:** The combined array of member objects is returned to the client with a `200 OK` status.

### 2. Update Member Role

- **URL:** `/api/workspaces/:workspaceId/members/:memberId`
- **Method:** `PATCH`
- **Success Status Code:** `200 OK`
- **Error Status Codes:**
  - `400 Bad Request` (Invalid payload, e.g., role validation failed)
  - `401 Unauthorized` (Not authenticated)
  - `403 Forbidden` (Requester lacks `MEMBER_UPDATE` permissions, target is OWNER, or trying to update to the same role)
  - `404 Not Found` (Target member does not exist or does not belong to the workspace)
- **Flow:**
  1. **Client Request:** The client sends a `PATCH` request to the endpoint containing the new role payload (e.g., `{ "role": "EDITOR" }`).
  2. **Authentication:** The API verifies the token globally, extracting the requesting `userId`. If missing/invalid, returns `401 Unauthorized`.
  3. **Authorization:** The `WorkspacePermissionGuard` verifies the requesting `userId` is a member of `workspaceId` with `MEMBER_UPDATE` permissions (typically Admins/Owners). Returns `403 Forbidden` if denied.
  4. **Payload Validation:** The DTO/Zod schema validates that the new `role` string is a recognized value.
  5. **Business Logic & Database Update:**
     - **Business Logic:**
       - **Target Check:** Verify the target member exists and actually belongs to the specified workspace. (If not, `404 Not Found`).
       - **Redundancy Check:** Verify that the new role being requested is different from their current role. (If it's the same, return `403 Forbidden`).
       - **Owner Protection Check:** Ensure the target member is **not** the Workspace Owner. You cannot update the Owner's role directly (an Owner must transfer ownership first). If they are the Owner, return `403 Forbidden`.
     - **Database Query:**
       - First, a `SELECT` query (with a `JOIN` to the `workspaces` table to get the `ownerId`) is executed to fetch the target member and validate the business checks above.
       - If all checks pass, an `UPDATE` query modifies the `workspace_members` table, setting the `role` to the new value and updating the `updatedAt` timestamp.
  6. **Response:** The newly updated member record is returned to the client with a `200 OK` status.

### 3. Remove Member (or Leave Workspace)

- **URL:** `/api/workspaces/:workspaceId/members/:memberId`
- **Method:** `DELETE`
- **Success Status Code:** `200 OK`
- **Error Status Codes:**
  - `401 Unauthorized` (Not authenticated)
  - `403 Forbidden` (User does not have `MEMBER_REMOVE` permissions, trying to remove OWNER, or trying to kick an ADMIN without being OWNER)
  - `404 Not Found` (Member does not exist or does not belong to workspace)
- **Flow:**
  1. **Client Request:** The client sends a `DELETE` request for a specific `memberId` in a `workspaceId`.
  2. **Authentication:** The API verifies the token globally, extracting the requesting `userId`. If missing/invalid, returns `401 Unauthorized`.
  3. **Authorization:**
     - The `WorkspacePermissionGuard` verifies the requesting `userId` has the `MEMBER_REMOVE` permission (Admins/Owners).
     - Alternatively, the `@AllowSelf()` decorator bypasses this guard **if** the requester is removing their own `memberId` (leaving the workspace voluntarily).
     - Returns `403 Forbidden` if neither condition is met.
  4. **Business Logic & Database Update:**
     - **Business Logic:**
       - **Target Check:** Verify the target member actually exists and belongs to the specified workspace (`404 Not Found`).
       - **Owner Protection Check:** You cannot remove the Workspace Owner. The Owner cannot be kicked, nor can they leave without transferring ownership first (`403 Forbidden`).
       - **Admin Hierarchy Check:** Ensure an Admin is not trying to kick another Admin (only the Owner has the right to remove Admins) (`403 Forbidden`).
     - **Database Query:**
       - A `SELECT` query (with a `JOIN` to `workspaces` to fetch the `ownerId` and `role`) is executed to validate the business checks above.
       - If all checks pass, a `DELETE` query permanently removes the row from the `workspace_members` table.
  5. **Response:** A `200 OK` status is returned confirming the successful removal.
