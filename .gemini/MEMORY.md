# Pikzee Project — Development Memory

> This file tracks the current state of development for future AI context. Update this file at the end of each session.

---

## Last Updated

**Date:** 2026-07-28
**Session Focus:** Feature 2 — Workspace & Members Management (Phases 1–5)

---

## Current Development State

### ✅ What Was Built This Session

#### 1. `@pikzee/shared-types` — Permission System

- **File:** `libs/shared/types/src/schema/permission.schema.ts`
- Defined `WorkspacePermission` enum (all granular permissions: `workspace:read`, `workspace:invite`, `project:create`, etc.)
- Defined `WorkspaceRole` enum (`ADMIN`, `EDITOR`, `COMMENTER`, `VIEWER`)
- Defined `ROLE_PERMISSIONS` map (role → array of permissions)
- Exported from `libs/shared/types/src/index.ts`
- **Important:** The `authorization.service.ts` previously defined these inline; they are now removed from there and imported from `@pikzee/shared-types`

#### 2. Authorization Module (`apps/api/src/app/authorization/`)

- Refactored `authorization.service.ts` to import `WorkspacePermission`, `WorkspaceRole`, `ROLE_PERMISSIONS` from `@pikzee/shared-types`
- Updated `guard/workspace-permission.guard.ts`:
  - Imports types from `@pikzee/shared-types` (not from service)
  - Now attaches `request.membership` so `@CurrentMember()` works
- Created `decorators/require-permissions.decorator.ts` — `@RequirePermissions(...permissions)`
- Created `decorators/current-member.decorator.ts` — `@CurrentMember()` extracts `request.membership`
- Updated `authorization.module.ts` — exports `WorkspacePermissionGuard`, imports `MembersModule` via `forwardRef()`

#### 3. Members Module (`apps/api/src/app/members/`)

- Created `members.controller.ts` — routes: `GET /workspaces/:workspaceId/members`, `PATCH /workspaces/:workspaceId/members/:memberId`, `DELETE /workspaces/:workspaceId/members/:memberId`
- Guarded by `ClerkAuthGuard` + `WorkspacePermissionGuard` + `@RequirePermissions()`
- **Controller bodies are empty TODOs** — for Human-AI Pairing Protocol
- Updated `members.module.ts` — imports `AuthorizationModule` via `forwardRef()`, registers controller

#### 4. Invitation Module (`apps/api/src/app/invitation/`)

- Created `invitation.service.ts` — empty stubs for `createInvitation`, `verifyToken`, `acceptInvitation(token, userId, authenticatedEmail)`
- Created `invitation.controller.ts` — routes: `POST /workspaces/:workspaceId/invitations`, `GET /invitations/:token`, `POST /invitations/:token/accept`
- Updated `invitation.module.ts` — imports `DbModule`, registers controller and service

#### 5. Database Schema (`libs/shared/db/src/schema/`)

- Created `workspace-invitation.schema.ts` with `workspace_invitations` table:
  - Columns: `id`, `workspaceId`, `email`, `token` (unique), `role`, `status` (PENDING/ACCEPTED/EXPIRED/REVOKED), `expiresAt`, `createdAt`, `updatedAt`
- Exported from `libs/shared/db/src/schema/index.ts`

#### 6. Frontend (`apps/web/src/features/workspace/`)

- Created `hooks/useWorkspaceAuth.ts` — `hasPermission`, `hasAnyPermission`, `hasAllPermissions` helpers (role stub: 'VIEWER', to be wired to workspace context)
- Created `components/PermissionGuard.tsx` — wraps children with permission check, accepts `requireAll` flag and `fallback` slot

---

### ✅ Edge Cases Agreed (via `/grill-me`)

| Scenario                                      | Behaviour                |
| --------------------------------------------- | ------------------------ |
| Try to update/delete workspace `OWNER`        | `403 ForbiddenException` |
| Invite email with existing `PENDING` invite   | `409 ConflictException`  |
| Invite email that is already an active member | `409 ConflictException`  |
| Accept invite with wrong authenticated email  | `403 ForbiddenException` |
| Accept invite with invalid/expired token      | `404 NotFoundException`  |

---

### ✅ Test Files Created (Red — TDD Workflow)

| File                                                        | What it tests                                                                       |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `apps/api/src/app/members/members.controller.spec.ts`       | Member listing, role update, removal, and OWNER protection edge cases               |
| `apps/api/src/app/invitation/invitation.service.spec.ts`    | Invite creation (duplicate/existing member), accept (email mismatch, invalid token) |
| `apps/api/src/app/invitation/invitation.controller.spec.ts` | Controller wiring and error pass-through                                            |

**Current test status:** `3 passed, 7 failed` — failures are expected DI injection errors in pre-existing spec stubs (not in the new test files). The new test files scaffold is waiting on implementation.

---

### ✅ Jest Testing Framework Setup

**Root cause of issues:** Version mismatch between `jest@30` and `ts-jest@29`, plus unsupported `.cts` config extension.

**Final working configuration:**

- `jest@29.7.0` + `ts-jest@29.4.12` — pinned consistently
- `jest.config.ts` (root) → renamed to **`jest.config.js`** (CommonJS, no `ts-node` needed)
- `apps/api/jest.config.cts` → copied to **`apps/api/jest.config.cjs`** (Jest doesn't support `.cts` extension)
- `apps/api/project.json` — explicit `test` target using `@nx/jest:jest` executor pointing to `apps/api/jest.config.cjs`
- `apps/api/tsconfig.spec.json` — removed stale `jest.config.ts` include reference

**To run api tests:**

```bash
pnpm exec nx test api
```

---

## 🚧 What Is Still TODO (Feature 2)

### Backend (Human to implement — empty stubs exist)

- `MembersController.getMembers()` → call `membersService.findMembersByWorkspaceId(workspaceId)`
- `MembersController.updateMember()` → call `membersService.update(memberId, dto)` + **guard against updating OWNER**
- `MembersController.removeMember()` → call `membersService.delete(memberId)` + **guard against removing OWNER**
- `InvitationService.createInvitation()` → generate nanoid token, check for existing member/pending invite, insert DB record, trigger email stub
- `InvitationService.verifyToken()` → query DB, validate `expiresAt > now()` and `status === 'PENDING'`
- `InvitationService.acceptInvitation()` → verify token, check email match, insert `workspace_members`, update token to ACCEPTED

### Frontend (Human to implement)

- Wire `useWorkspaceAuth` hook to actual workspace context (replace 'VIEWER' stub with real membership role)
- Secure settings panels and dashboard using `<PermissionGuard>`

### Database

- Run `pnpm db:generate` and `pnpm db:migrate` to apply the `workspace_invitations` table migration

---

## Key File Locations

| What                  | Path                                                                 |
| --------------------- | -------------------------------------------------------------------- |
| Permission types      | `libs/shared/types/src/schema/permission.schema.ts`                  |
| DB invitation schema  | `libs/shared/db/src/schema/workspace-invitation.schema.ts`           |
| Auth decorators       | `apps/api/src/app/authorization/decorators/`                         |
| Permission guard      | `apps/api/src/app/authorization/guard/workspace-permission.guard.ts` |
| Members controller    | `apps/api/src/app/members/members.controller.ts`                     |
| Invitation service    | `apps/api/src/app/invitation/invitation.service.ts`                  |
| Invitation controller | `apps/api/src/app/invitation/invitation.controller.ts`               |
| Frontend hook         | `apps/web/src/features/workspace/hooks/useWorkspaceAuth.ts`          |
| Frontend guard        | `apps/web/src/features/workspace/components/PermissionGuard.tsx`     |
| API Jest config       | `apps/api/jest.config.cjs`                                           |
| Root Jest config      | `jest.config.js`                                                     |
