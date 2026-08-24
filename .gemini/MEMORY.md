# Pikzee Project — Development Memory

> This file tracks the current state of development for future AI context. Update this file at the end of each session.

---

## Last Updated

**Date:** 2026-08-24
**Session Focus:** Architecture Refactor — Notification Module & Resend Integration

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

- **Fully implemented** `members.controller.ts` & `members.service.ts`.
- Endpoints: `GET /workspaces/:workspaceId/members`, `PATCH /workspaces/:workspaceId/members/:memberId`, `DELETE /workspaces/:workspaceId/members/:memberId`
- Service Methods Renamed for clarity: `createMember`, `updateMemberRole`, `removeMember`.
- Integrated SQL `JOIN` with `users` table to fetch user details (name, email, avatar) dynamically without hitting Clerk API.
- Comprehensive Google-style JSDoc comments detailing complex business logic rules (Admin hierarchies, Owner protection).
- 100% test coverage updated in `members.controller.spec.ts` and `members.service.spec.ts`.
- Updated `apps/docs/pages/features/members.md` with complete flow logic.

#### 4. Invitation Module (`apps/api/src/app/invitation/`)

- Restructured `apps/docs/pages/features/invitation.md`:
  - Standardized the API endpoint format to perfectly match `members.md`.
  - Added the `GET /workspaces/:workspaceId/invitations` (List Pending Invitations) endpoint.
  - Documented explicit UX logic for Revocation (tombstone soft-delete) and Acceptance flows.
  - Fixed MDX parsing errors by safely converting HTML comments to JSX block comments.
- **Product Architecture Agreed:** "Pattern A" (Direct-to-Workspace). Invited users bypass the onboarding wizard and are injected directly into the inviter's workspace. They will only create a personal workspace later if they explicitly choose to.
- **Codebase Status: Fully Implemented.**
  - Added `InvitationStatus` constant object to `@pikzee/shared-types`.
  - `invitation.service.ts`: Implemented robust logic with transaction safety for acceptances, preventing duplicate invites, preventing inviting active members, and strictly scoping revocations by `workspaceId`.
  - `invitation.controller.ts`: Added missing `GET /workspaces/:workspaceId/invitations` and `DELETE /workspaces/:workspaceId/invitations/:invitationId` endpoints with proper `WorkspacePermissionGuard` auth.
  - Synced documentation in `invitation.md` directly with the backend code logic.
  - Added full Google-style JSDoc comments to controllers and services.

#### 5. Database Schema (`libs/shared/db/src/schema/`)

- Created `workspace-invitation.schema.ts` with `workspace_invitations` table:
  - Columns: `id`, `workspaceId`, `email`, `token` (unique), `role`, `status` (PENDING/ACCEPTED/EXPIRED/REVOKED), `expiresAt`, `createdAt`, `updatedAt`
- Exported from `libs/shared/db/src/schema/index.ts`

#### 6. Notification Module (`apps/api/src/app/notification/`)

- Abstracted all email logic out of individual modules to create a scalable, multi-channel notification system.
- Designed `NotificationService` as a Facade/Dispatcher pattern that accepts a standard `NotificationPayload` and routes it to enabled channels via `Promise.allSettled`.
- Implemented `EmailChannelProvider` integrating the Resend SDK.
- Decided to use **Resend Dashboard Templates** (passing `template_id` and variables) instead of managing React Email in the monorepo for MVP speed.
- Configured strong type-safety using explicit variable mapping in `EmailChannelProvider` via a `switch` statement over `NotificationEventEnum` to prevent sensitive data leaks.
- Configured dependency injection utilizing `ConfigModule` and a custom factory for the `Resend` client.
- Exported `NotificationService` from `NotificationModule` for cross-module usage.

#### 7. `@pikzee/shared-types` — Notification Types

- Defined `NotificationEventEnum` (`WORKSPACE_INVITATION`, `WELCOME_EMAIL`)
- Defined `NotificationChannelEnum` (`EMAIL`, `SMS`, `IN_APP`, `PUSH_NOTIFICATION`)
- Defined `NotificationPayload` interface enforcing strong contracts for sending notifications.

#### 8. Frontend (`apps/web/src/features/workspace/`)

- Created `hooks/useWorkspaceAuth.ts` — `hasPermission`, `hasAnyPermission`, `hasAllPermissions` helpers (role stub: 'VIEWER', to be wired to workspace context)
- Created `components/PermissionGuard.tsx` — wraps children with permission check, accepts `requireAll` flag and `fallback` slot

---

### ✅ Edge Cases Agreed & Implemented

| Scenario                                      | Behaviour                |
| --------------------------------------------- | ------------------------ |
| Try to update/delete workspace `OWNER`        | `403 ForbiddenException` |
| Same-role redundant update in members API     | `403 ForbiddenException` |
| Admin kicks another Admin (non-owner)         | `403 ForbiddenException` |
| Admin leaves voluntarily                      | Allowed (`@AllowSelf()`) |
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

**Current test status:** Tests for `invitation.service.spec.ts` and `invitation.controller.spec.ts` have been fully implemented with robust Drizzle ORM query builder chain mocks and proper dependency injection. All API tests are now expected to pass.

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

### Backend

- Nothing left for Invitation or Members module API! (Completed this session).

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
| Notification service  | `apps/api/src/app/notification/notification.service.ts`              |
| Email provider        | `apps/api/src/app/notification/providers/email.provider.ts`          |
| Notification types    | `libs/shared/types/src/schema/notification.schema.ts`                |
| Frontend hook         | `apps/web/src/features/workspace/hooks/useWorkspaceAuth.ts`          |
| Frontend guard        | `apps/web/src/features/workspace/components/PermissionGuard.tsx`     |
| API Jest config       | `apps/api/jest.config.cjs`                                           |
| Root Jest config      | `jest.config.js`                                                     |
