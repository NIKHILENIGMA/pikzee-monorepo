---
title: Workspace Management
description: Managing workspace creation, read, update, delete, and enforcing subscription limits.
---

# 🏢 Workspace Management

The workspace is the core billing and organizational unit in Pikzee. All data (documents, assets, members) belongs to a workspace, and subscriptions/plan limits are enforced at the workspace level.

---

## 1. Database Schema

The `workspaces` table handles the core data, linked to `users` as the owner.

```typescript
export const workspaces = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(), // Immutable after creation
  logoUrl: text('logo_url'), // S3 URL or null
  plan: text('plan').default('free').notNull(), // 'free', 'plus', 'pro'
  status: text('status').default('active').notNull(), // 'active', 'suspended', 'archived'
  ownerId: uuid('owner_id').notNull(), // References user ID from auth
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
```

### Key Design Decisions

- `slug` is unique at the database level and immutable to prevent breaking URLs.
- `logoUrl` being null means the frontend will fallback to an auto-colored initials avatar.
- `status` drives global access control. Suspended or archived workspaces block all actions.
- `ownerId` provides a fast ownership check without joining the `workspace_members` table.

---

## 2. API Endpoints

### 1. Create Workspace (`createWorkspace`)

- **URL:** `/api/workspace`
- **Method:** `POST`
- **Authorization:** `CurrentUser` (Authenticated User)
- **Flow:**
  1. **Quota Check:** Verify `owned_workspaces_count < ownership_limit_for_user`. If limit reached, return `403 Forbidden`.
  2. **Slug Generation:** Generate a URL-friendly slug from the workspace name. If it exists, append integers until unique.
  3. **Atomic Transaction:**
     - Insert into `workspaces` table with `ownerId` set to `userId`.
     - Insert into `workspace_members` with `role = 'OWNER'` (or `ADMIN`).
  4. **Response:** Returns the created workspace object.

### 2. Get My Workspaces (`getCurrentUserWorkspaces`)

- **URL:** `/api/workspace/mine`
- **Method:** `GET`
- **Authorization:** `CurrentUser`
- **Flow:**
  1. Queries the database with an `INNER JOIN` on `workspace_members` where `userId` matches the current user.
  2. Returns an array of workspaces the user owns or is a member of.

### 3. Update Workspace (`updateWorkspaceDetails`)

- **URL:** `/api/workspace/:workspaceId`
- **Method:** `PATCH`
- **Authorization:** `WorkspacePermissionGuard` (`WORKSPACE_UPDATE` permission)
- **Flow:**
  1. Validates the request payload (name, logo). Note: `slug` is never updated.
  2. Checks if the workspace exists.
  3. Updates the `workspaces` table and returns the modified object.

### 4. Delete (Archive) Workspace (`deleteWorkspace`)

- **URL:** `/api/workspace/:workspaceId`
- **Method:** `DELETE`
- **Authorization:** `WorkspacePermissionGuard` (`WORKSPACE_DELETE` permission / Owner only)
- **Flow:**
  1. Verifies the user is the owner of the workspace.
  2. Perform a "Soft Delete" by setting `status = 'archived'`. (Data is preserved for recovery or background cleanup, never hard deleted instantly unless explicitly requested).
  3. Returns a `200 OK` confirmation.

### 5. Get Workspace by ID or Slug (`getWorkspaceById` / `getWorkspaceBySlug`)

- **URL:** `/api/workspace/:workspaceId` OR `/api/workspace/slug/:slug`
- **Method:** `GET`
- **Authorization:** `WorkspacePermissionGuard` (or Member check)
- **Flow:**
  1. Looks up the workspace by ID or Slug.
  2. Validates that the current user is a member of this workspace (unless it is a public-facing page).
  3. Returns the workspace data.

### 6. Switch Workspace (Set Active)

- **URL:** `/api/workspace/:workspaceId/switch`
- **Method:** `POST`
- **Authorization:** `WorkspacePermissionGuard` (Member check)
- **Flow:**
  1. Verifies the user is an active member of the target workspace.
  2. Updates the user's profile or preferences (e.g., saving `last_active_workspace_id` to the database or Clerk metadata) so the application remembers their active context on the next login.
  3. Returns a `200 OK` confirmation.

---

## 3. Business Logic & Security Safeguards

- **Abuse Prevention (Limits):** Workspace creation is heavily guarded. A user can only create a specific number of workspaces based on their highest active paid plan across the platform.
- **Role-Based Access Control (RBAC):** Updates and deletions require specific permissions evaluated by the `WorkspacePermissionGuard` against the `X-Workspace-Id` header.
- **Global Data Leak Prevention:** A generic `GET /workspace` (finding all workspaces in the system) is strictly prohibited for standard users.

---

## 4. Packages & Environment Setup

**Required Packages:**

```bash
# apps/api
pnpm add slugify                # For URL-friendly slug generation
```
