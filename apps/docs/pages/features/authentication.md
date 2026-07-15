---
title: Authentication & Webhook Sync
description: Complete authentication architecture including Clerk custom UI flows, JWT guards, and database user synchronization.
---

# 🔐 Authentication & User Synchronization

Pikzee uses **Clerk** to handle secure user authentication, password resets, and session sessions. To keep our local relational database in sync, we use a webhook-based synchronization model.

---

## 1. Complete Authentication Architecture

```
User (Browser) ───────> Clerk Authentication Portal
                          │
                  [Success Callback]
                          ▼
User (Browser) ───────> Next.js App (apps/web)
                          │
            [HTTP Call with Clerk JWT Header]
                          ▼
NestJS API ───────────> ClerkAuthGuard (Validates JWT signature)
                          │
             [Injects verified CurrentUser]
                          ▼
                  Controller Handler
```

1.  **Identity Provider:** Clerk manages user registrations, login validations, MFA, and OAuth.
2.  **Stateless JWT Verification:** When the client calls our backend NestJS API (`apps/api`), it passes a JWT token in the `Authorization` header. The NestJS `ClerkAuthGuard` validates the token signature offline using Clerk's public JSON Web Key Sets (JWKS).
3.  **Local User Resolution:** A custom `@CurrentUser()` decorator resolves the validated user ID from the JWT token and queries our local PostgreSQL database to return the user's workspace membership and profile records.

---

## 2. Real-Time Webhook User Synchronization

Because Clerk is external, changes to user records (such as registration, profile updates, or account deletions) must sync with our local PostgreSQL database. We use **Svix** and secure webhooks:

```
Clerk Identity Portal ──[ user.created webhook ]──> NestJS Endpoint (apps/api)
                                                      │
                                           [Verifies Svix signature]
                                                      ▼
                                           Inserts user row into DB
```

### **The Webhook Flow:**

1.  **Register Endpoint:** The backend exposes a public endpoint `POST /webhooks/clerk`.
2.  **Signature Verification:** To prevent attackers from calling this endpoint, the request header signatures are verified using `svix` and `CLERK_WEBHOOK_SECRET`.
3.  **Event Handlers:**
    - `user.created`: Inserts a new row containing the Clerk user ID, email address, profile photo, and name into the `users` table.
    - `user.updated`: Updates profile name or avatar URL details.
    - `user.deleted`: Sets the user's status to `archived` or deletes their records (GDPR compliance).
