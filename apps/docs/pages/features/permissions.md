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
