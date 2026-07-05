---
title: Auth (Backend)
description: How Clerk authentication is enforced in NestJS.
---

# Backend Auth

## How it works

The API validates requests using **Clerk session tokens** passed as `Authorization: Bearer <token>` headers.

```
Request → ClerkGuard (validates JWT with Clerk) → Controller → Service
```

## Guards

```ts
@UseGuards(ClerkAuthGuard)
@Get('me')
async getMe(@CurrentUser() user: ClerkUser) {
  return user
}
```

## Decorators

| Decorator            | Purpose                                    |
| -------------------- | ------------------------------------------ |
| `@CurrentUser()`     | Injects the verified Clerk user            |
| `@WorkspaceMember()` | Verifies membership in requested workspace |
| `@Public()`          | Marks endpoint as publicly accessible      |

## Webhook Verification

Clerk webhooks (user created, updated) are verified using `svix` before processing:

```ts
import { verifyWebhook } from '@clerk/backend/webhooks'
```

See the [Clerk Webhooks skill](/decisions/d-01-auth) for full implementation details.
