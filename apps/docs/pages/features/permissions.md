---
title: Roles & Permissions
description: Role-Based Access Control (RBAC) rules and NestJS authorization guards.
---

# 🛡️ Roles & Permissions (RBAC)

Pikzee enforces Role-Based Access Control (RBAC) to ensure that users only perform actions allowed by their workspace role.

---

## 1. Role Permission Matrix

We define four distinct roles inside a workspace:

| Action                        | OWNER | EDITOR | COMMENTOR | GUEST |
| :---------------------------- | :---: | :----: | :-------: | :---: |
| **Manage Billing / Settings** |  ✅   |   ❌   |    ❌     |  ❌   |
| **Invite & Edit Members**     |  ✅   |   ❌   |    ❌     |  ❌   |
| **Delete Workspace**          |  ✅   |   ❌   |    ❌     |  ❌   |
| **Create/Edit Projects**      |  ✅   |   ✅   |    ❌     |  ❌   |
| **Create/Edit Assets & Docs** |  ✅   |   ✅   |    ❌     |  ❌   |
| **Comment on Documents**      |  ✅   |   ✅   |    ✅     |  ❌   |
| **View Projects/Assets/Docs** |  ✅   |   ✅   |    ✅     |  ✅   |

---

## 2. Technical Implementation (NestJS Guard)

We protect backend endpoints using a custom `@RequireRole` decorator paired with an `AuthorizationGuard`:

```typescript
@Patch(':id')
@RequireRole(WorkspaceRole.OWNER)
async updateSettings(
  @Param('id') id: string,
  @Body() dto: UpdateSettingsDto
) {
  return this.workspaceService.update(id, dto);
}
```

- **Token Scoping:** The `ClerkAuthGuard` extracts the user ID. The request interceptor then queries the `workspace_members` table to fetch the user's role for the requested `workspaceId`.
- **Role Assertion:** If the role matches or exceeds the required permission level, the request proceeds; otherwise, a `403 Forbidden` error is returned.

## Implementation Details

### F-03 · RBAC `[DISCUSSED]`

#### Decisions Made

| #                | Decision                    | Choice                                              |
| ---------------- | --------------------------- | --------------------------------------------------- |
| Roles            | 4 custom roles              | ✅ OWNER / EDITOR / COMMENTOR / GUEST               |
| Guard mechanism  | Header vs URL param         | ✅ `X-Workspace-Id` header                          |
| ADMIN promotion  | Can ADMIN promote to ADMIN? | ✅ N/A — no ADMIN role. Only OWNER manages members. |
| OWNER protection | Can OWNER be removed?       | ✅ NO — only via explicit ownership transfer        |

---

#### 1. Setup

**No new packages needed** — roles implemented using NestJS guards + decorators (built-in patterns).

**Complete folder structure — `apps/api` (NestJS):**

```
apps/api/src/
│
└── rbac/
    ├── rbac.module.ts                  ← exports RolesGuard globally
    ├── roles.enum.ts                   ← WorkspaceRole enum: OWNER|EDITOR|COMMENTOR|GUEST
    ├── roles.decorator.ts              ← @Roles('OWNER','EDITOR') metadata decorator
    ├── roles.guard.ts                  ← reads X-Workspace-Id header + workspace_members lookup
    └── workspace-members/
        ├── workspace-members.module.ts
        ├── workspace-members.service.ts ← getMemberRole(), listMembers(), changeRole(), remove()
        └── workspace-members.controller.ts
            ├── GET    /members           ← list all workspace members + roles
            ├── PATCH  /members/:userId/role ← change role (OWNER only)
            └── DELETE /members/:userId   ← remove member (OWNER only)
```

**Complete folder structure — `apps/web` (Next.js):**

```
apps/web/src/
│
├── hooks/
│   ├── useWorkspaceRole.ts             ← returns current user's role in active workspace
│   └── useHasRole.ts                   ← useHasRole('OWNER','EDITOR') → boolean
│
└── components/workspace/
    └── MembersTable.tsx                ← list members, role badges, remove button (OWNER only)
```

**Complete folder structure — `libs/` (shared):**

```
libs/shared/types/src/
└── rbac.types.ts                       ← WorkspaceRole enum (shared between web + api)

libs/database/src/schema/
└── workspace-members.schema.ts         ← NEW Drizzle table
```

---

#### 2. Schema

```sql
-- libs/database/src/schema/workspace-members.schema.ts
workspace_members (
  id            UUID   PRIMARY KEY  DEFAULT gen_random_uuid()
  workspace_id  UUID   NOT NULL  REFERENCES workspaces(id) ON DELETE CASCADE
  user_id       UUID   NOT NULL  REFERENCES users(id)      ON DELETE CASCADE
  role          ENUM   'OWNER'|'EDITOR'|'COMMENTOR'|'GUEST'  DEFAULT 'GUEST'
  invited_by    UUID   NULLABLE  REFERENCES users(id)
  joined_at     TIMESTAMP  NOT NULL  DEFAULT now()

  UNIQUE(workspace_id, user_id)         -- one role per user per workspace
)

CREATE INDEX idx_wm_workspace_user ON workspace_members(workspace_id, user_id);
CREATE INDEX idx_wm_user           ON workspace_members(user_id);
```

**Design decisions:**

- `ON DELETE CASCADE` on both FKs — if workspace or user is deleted, membership rows clean up automatically
- `invited_by` nullable — OWNER's own membership row has no inviter (created on workspace creation)
- `role` defaults to `GUEST` — safest default for invite flow
- Composite unique constraint ensures a user can only hold one role per workspace at a time

---

#### 3. Business Logic

**Roles & What They Can Do:**
| Action | OWNER | EDITOR | COMMENTOR | GUEST |
|---|---|---|---|---|
| View workspace + all content | ✅ | ✅ | ✅ | ✅ |
| Comment on docs / assets | ✅ | ✅ | ✅ | ❌ |
| Create / edit / delete documents | ✅ | ✅ | ❌ | ❌ |
| Upload / edit assets | ✅ | ✅ | ❌ | ❌ |
| Create / delete projects | ✅ | ✅ | ❌ | ❌ |
| Publish content | ✅ | ✅ | ❌ | ❌ |
| Invite members | ✅ | ❌ | ❌ | ❌ |
| Remove members | ✅ | ❌ | ❌ | ❌ |
| Change member roles | ✅ | ❌ | ❌ | ❌ |
| Workspace settings | ✅ | ❌ | ❌ | ❌ |
| Billing / plan | ✅ | ❌ | ❌ | ❌ |
| Delete / archive workspace | ✅ | ❌ | ❌ | ❌ |
| Transfer ownership | ✅ | ❌ | ❌ | ❌ |

**A. Guard Flow (every protected API request):**

```
Request arrives
  → ClerkGuard: validate JWT → attach currentUser to req
  → RolesGuard (if @Roles decorator present):
      read X-Workspace-Id header
      → missing header → 400 Bad Request
      SELECT role FROM workspace_members
        WHERE workspace_id = :wid AND user_id = :currentUserId
      → no row → 403 (not a workspace member)
      → role not in @Roles(...) list → 403 (insufficient role)
      → ok → attach { workspaceId, role } to req → controller runs

  Decorator usage on controllers:
  @Roles('OWNER')                          → member mgmt, billing, workspace ops
  @Roles('OWNER', 'EDITOR')               → write ops: docs, assets, projects, publish
  @Roles('OWNER', 'EDITOR', 'COMMENTOR') → comment ops
  No decorator (just ClerkGuard)           → read ops: any workspace member can view
```

**B. Role Change Flow:**

```
PATCH /members/:userId/role  { role: 'EDITOR' }
  → @Roles('OWNER') only
  → Cannot change OWNER's own role (protected check in service)
  → Cannot assign OWNER role via this endpoint (use transfer ownership)
  → UPDATE workspace_members SET role = :newRole
```

**C. Remove Member Flow:**

```
DELETE /members/:userId
  → @Roles('OWNER') only
  → Cannot remove self if OWNER (would lock workspace)
  → DELETE FROM workspace_members WHERE workspace_id=:wid AND user_id=:uid
  → Novu: notify removed member
```

**D. OWNER Protection Rules:**

```
OWNER cannot be removed by anyone — enforced in service layer:
  if (targetMember.role === 'OWNER') throw new ForbiddenException()

OWNER row is created atomically with workspace (in F-02 workspace creation).
OWNER can only be changed via ownership transfer (future scope for MVP).
```

**E. Plan Invite Limit Enforcement:**

```
Plan invite limit = total non-OWNER members (EDITOR + COMMENTOR + GUEST combined)
Free:  ≤ 1   total member
Plus:  ≤ 5   total members
Pro:   ≤ 20  total members

Checked in invite flow (F-04):
  SELECT COUNT(*) FROM workspace_members
    WHERE workspace_id = :wid AND role != 'OWNER'
  → count >= plan_limit → 402 Payment Required
```

**F. Frontend Role-Gating Pattern:**

```typescript
// hooks/useHasRole.ts
const canEdit    = useHasRole('OWNER', 'EDITOR')
const canComment = useHasRole('OWNER', 'EDITOR', 'COMMENTOR')
const isOwner    = useHasRole('OWNER')

// Usage — hides UI elements based on role
{isOwner    && <InviteMemberButton />}
{canEdit    && <EditDocumentButton />}
{canComment && <CommentInput />}
```

---

#### 4. Future Scope

- **Ownership transfer UI** — OWNER selects a member → confirms → OWNER role moves to them, previous OWNER becomes EDITOR
- **Custom roles** — enterprise tier: define custom role names with granular permission toggles
- **Project-level roles** — override workspace role for a specific project (e.g. GUEST in workspace, but EDITOR in one project)
- **Role audit log** — track every role change with timestamp + who changed it (compliance)
- **Bulk role assignment** — change multiple members' roles in one action
- **Bulk role assignment** — change multiple members' roles in one action

---
