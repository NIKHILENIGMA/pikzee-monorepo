---
title: Workspace Invitations
description: Deep dive into the invitation lifecycle, token validation, and email invitations.
---

# ✉️ Workspace Invitations

To add new members to a workspace, the system uses a secure email-based invitation flow.

---

## 1. Database Schema

The `workspace_invitations` table handles the entire lifecycle of an invite.

```sql
-- libs/shared/db/src/schema/workspace-invitations.schema.ts
workspace_invitations (
  id            UUID         PRIMARY KEY  DEFAULT gen_random_uuid()
  workspace_id  UUID         NOT NULL  REFERENCES workspaces(id)  ON DELETE CASCADE
  invited_by    UUID         NOT NULL  REFERENCES users(id)        ← must be ADMIN/OWNER
  email         VARCHAR(255) NOT NULL                              ← who is being invited
  role          VARCHAR      NOT NULL                              ← 'EDITOR', 'COMMENTER', 'VIEWER', 'ADMIN'
  token         VARCHAR(255) NOT NULL UNIQUE                       ← nanoid() 21 chars
  status        VARCHAR      DEFAULT 'PENDING'                     ← 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED'
  expires_at    TIMESTAMP    NOT NULL                              ← created_at + 7 days
  accepted_at   TIMESTAMP    NULLABLE
  accepted_by   UUID         NULLABLE  REFERENCES users(id)        ← user who accepted
  created_at    TIMESTAMP    NOT NULL  DEFAULT now()
  updated_at    TIMESTAMP    NOT NULL  DEFAULT now()
)

CREATE UNIQUE INDEX idx_invite_token         ON workspace_invitations(token);
CREATE INDEX        idx_invite_workspace_email ON workspace_invitations(workspace_id, email);
```

**Invite state machine:**

- `PENDING` → `ACCEPTED` (accepted within 7 days)
- `PENDING` → `EXPIRED` (7 days passed, checked dynamically or by cron job)
- `PENDING` → `REVOKED` (Admin/Owner cancelled before acceptance)

---

## 2. API Endpoints

### 1. Create / Send Invitation

- **URL:** `/api/workspaces/:workspaceId/invitations`
- **Method:** `POST`
- **Success Status Code:** `201 Created`
- **Error Status Codes:**
  - `401 Unauthorized` (Not authenticated)
  - `403 Forbidden` (User does not have `WORKSPACE_INVITE` permissions or trying to invite an `OWNER`)
  - `409 Conflict` (User is already a member)
- **Flow:**
  1. **Client Request:** The client sends a `POST` request to the endpoint, including the `email` and `role` to invite.
  2. **Authentication:** The API verifies the token globally, extracting the requesting `userId`. If missing/invalid, returns `401 Unauthorized`.
  3. **Authorization:** The `WorkspacePermissionGuard` verifies the `userId` is a member of `workspaceId` with `WORKSPACE_INVITE` permission. Returns `403 Forbidden` if denied.
  4. **Business Logic & Database Query:**
     - **Business Logic:**
       - Ensure the requested role to invite is not `OWNER`.
       - Check if the target email is already an active member. If yes, throw `409 ConflictException`.
       - Check if there is already a `PENDING` invite for this email in this workspace. If yes, throw `409 ConflictException`.
       - Fire an asynchronous job (BullMQ/Resend) to deliver the email to the user.
     - **Database Query:**
       - **Query 1:** `SELECT` from `workspace_members` joined with `users` to check for existing active membership.
       - **Query 2:** `SELECT` from `workspace_invitations` to check for an existing `PENDING` invite.
       - **Query 3:** `INSERT` a brand new `workspace_invitations` record.
  5. **Response:** Returns the created/updated invitation record (with `status="PENDING"`) with a `201 Created` status.

### 2. List Pending Invitations

- **URL:** `/api/workspaces/:workspaceId/invitations`
- **Method:** `GET`
- **Success Status Code:** `200 OK`
- **Error Status Codes:**
  - `401 Unauthorized` (Not authenticated)
  - `403 Forbidden` (User does not have `WORKSPACE_INVITE` permissions)
- **Flow:**
  1. **Client Request:** The client sends a `GET` request to fetch all currently pending invitations for the workspace.
  2. **Authentication:** The API verifies the token globally, extracting the requesting `userId`. If missing/invalid, returns `401 Unauthorized`.
  3. **Authorization:** The `WorkspacePermissionGuard` verifies the `userId` is a member of `workspaceId` with `WORKSPACE_INVITE` permission. Returns `403 Forbidden` if denied.
  4. **Business Logic & Database Query:**
     - **Business Logic:** Fetch all active, unexpired invites that are still marked as `PENDING`.
     - **Database Query:** `SELECT` from `workspace_invitations` where `workspace_id = :workspaceId` AND `status = 'PENDING'`.
  5. **Response:** Returns an array of pending invitation objects so the frontend can render the "Pending Invitations" table.

### 3. View Invite Details (Public)

- **URL:** `/api/invitations/:token`
- **Method:** `GET`
- **Success Status Code:** `200 OK`
- **Error Status Codes:**
  - `404 Not Found` (Token doesn't exist, is expired, or is invalid)
- **Flow:**
  1. **Client Request:** The client visits the page and the frontend fetches invite details via a `GET` request.
  2. **Authentication:** None required (fully public endpoint).
  3. **Authorization:** None required.
  4. **Business Logic & Database Query:**
     - **Business Logic:**
       - Look up the token in the database.
       - Check the status and expiry. If not `PENDING` or if expired, throw `404 Not Found`.
     - **Database Query:**
       - `SELECT` from `workspace_invitations` filtering by `token`.
  5. **Response:** Returns masked details (workspace name/logo, inviter name, role, expiry) with a `200 OK` status to render the UI.

### 4. Accept Invitation

- **URL:** `/api/invitations/:token/accept`
- **Method:** `POST`
- **Success Status Code:** `200 OK`
- **Error Status Codes:**
  - `401 Unauthorized` (Not authenticated)
  - `403 Forbidden` (Authenticated email does not match invited email)
  - `404 Not Found` (Token doesn't exist, is expired, or is invalid)
- **Flow:**
  1. **Client Request:** The client sends a `POST` request with the token.
  2. **Authentication:** The API verifies the Clerk token globally, ensuring the user has a valid session and extracting their `userId` and `email`. If missing, returns `401 Unauthorized`.
  3. **Authorization:** No workspace guard needed yet (since they aren't a member), but a strict **Email Target Lock** is enforced: `currentUser.email === invitation.email`. If they differ, returns `403 Forbidden`.
  4. **Business Logic & Database Query:**
     - **Business Logic:**
       - Validate the token's existence, status, and expiry.
       - Ensure the email match for security.
       - Add the user to the workspace and mark the invite as consumed.
     - **Database Query (Atomic Transaction):**
       - **Query 1:** `SELECT` to validate the token.
       - **Query 2:** `INSERT` into `workspace_members` with the user's ID, workspace ID, and role.
       - **Query 3:** `UPDATE` the `workspace_invitations` table, setting `status = 'ACCEPTED'`.
  5. **Response:** Returns the workspace details so the frontend can redirect the user to their new dashboard.

### 5. Revoke Invitation

- **URL:** `/api/workspaces/:workspaceId/invitations/:invitationId`
- **Method:** `DELETE`
- **Success Status Code:** `200 OK`
- **Error Status Codes:**
  - `400 Bad Request` (Invitation is not in a PENDING state)
  - `401 Unauthorized` (Not authenticated)
  - `403 Forbidden` (User lacks `WORKSPACE_INVITE` permissions)
  - `404 Not Found` (Invitation doesn't exist or isn't part of this workspace)
- **Flow:**
  1. **Client Request:** The client sends a `DELETE` request for a specific invitation ID.
  2. **Authentication:** The API verifies the token globally, extracting the requesting `userId`. If missing/invalid, returns `401 Unauthorized`.
  3. **Authorization:** The `WorkspacePermissionGuard` verifies the requesting `userId` has `WORKSPACE_INVITE` permissions. Returns `403 Forbidden` if denied.
  4. **Business Logic & Database Query:**
     - **Business Logic:**
       - Ensure the invite actually belongs to the specified workspace.
       - Mark the invite as `REVOKED`. The link will silently stop working, no email notification is sent to the user.
     - **Database Query:**
       - `UPDATE` the `workspace_invitations` table, setting `status = 'REVOKED'` where the `id` and `workspaceId` match.
  5. **Response:** Returns a `200 OK` status confirming the revocation.

---

## 3. Packages & Environment Setup

**Required Packages:**

```bash
# apps/api
pnpm add nanoid               # For secure token generation (21-char URL-safe random string)
pnpm add resend               # For email delivery

# libs/shared/emails (if rendering templates)
pnpm add @react-email/components react-email
```

**Environment Variables (`apps/api/.env`):**

```env
RESEND_API_KEY=re_123456789
RESEND_FROM_EMAIL=invite@pikzee.com
APP_BASE_URL=https://app.pikzee.com  # Used to build the /invite/:token links inside emails
```

---

## 4. Key Security Safeguards

- **Email Target Locking:** Only the user holding the exact invited email address can accept the invitation, preventing unauthorized token sharing.
- **Immediate Invalidation:** Generating a new invite for the same email instantly invalidates any previous pending invite links.
- **Idempotent Expiry:** Clicking an expired link dynamically updates the database state to `EXPIRED` if not already handled by a background cron job.

{/\*

## Folder Structure Reference

apps/web (Next.js):
apps/web/src/
├── app/
│ ├── invite/
│ │ └── [token]/
│ │ └── page.tsx ← PUBLIC — shows AcceptInviteCard
│ └── (app)/[workspaceSlug]/settings/members/
│ └── page.tsx ← member list + pending invites table
└── components/invites/
├── InviteForm.tsx ← email input + role selector
├── PendingInvitesList.tsx ← table of pending invites
└── AcceptInviteCard.tsx ← public accept card

apps/api (NestJS):
apps/api/src/
└── invites/
├── invites.module.ts
├── invites.controller.ts
├── invites.service.ts
└── dto/create-invite.dto.ts
\*/}
