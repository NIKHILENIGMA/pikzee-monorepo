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

## Implementation Details

### F-01 · Auth `[DISCUSSED]`

#### 1. Setup

**Clerk Dashboard (one-time):**

- Create a Clerk application
- Enable providers: Email/Password + Google + GitHub OAuth
- Set allowed redirect URLs: `http://localhost:3000`, `https://yourdomain.com`
- Create a Webhook endpoint pointing to `POST /webhooks/clerk` with events: `user.created`, `user.updated`, `user.deleted`
- Copy: `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`

**Packages to install:**

```bash
# apps/web
pnpm add @clerk/nextjs

# apps/api
pnpm add @clerk/backend svix

# libs/database  (shared — consumed by apps/api AND apps/worker)
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit
```

**Environment variables:**

```env
# apps/web/.env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
# No CLERK_SIGN_IN_URL vars needed — auth is dialog-based, not redirect-based

# apps/api/.env
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
DATABASE_URL=postgresql://pikzee:secret@postgres:5432/pikzee

# apps/worker/.env
CLERK_SECRET_KEY=
DATABASE_URL=postgresql://pikzee:secret@postgres:5432/pikzee
```

**UX Entry Flow (key architectural decision):**

```
Unauthenticated user hits any URL
  → middleware.ts checks Clerk session
  → if unauthed + hitting (app)/* → redirect to /  (marketing page)
  → Marketing page renders normally (hero, features, pricing)
  → User clicks "Get Started" or "Log In" CTA button
  → <AuthDialog /> opens as modal overlay (no page navigation)
  → User completes sign-in or sign-up inside dialog
  → Dialog closes → router.push('/onboarding') or '/:workspaceSlug/dashboard'
```

**Complete folder structure — `apps/web` (Next.js):**

```
apps/web/src/
│
├── middleware.ts                          ← clerkMiddleware() — unauthed (app)/* → redirect to /
│
├── app/
│   ├── layout.tsx                         ← Root layout: ClerkProvider, fonts, global providers
│   │
│   ├── (marketing)/                       ← PUBLIC group — marketing pages, no sidebar
│   │   ├── layout.tsx                     ← Marketing navbar (Login + Get Started CTAs)
│   │   ├── page.tsx                       ← Landing / Hero page
│   │   ├── pricing/
│   │   │   └── page.tsx
│   │   └── about/
│   │       └── page.tsx
│   │
│   └── (app)/                             ← PROTECTED group — full app with sidebar
│       ├── layout.tsx                     ← Auth guard: if no session → redirect to /
│       ├── onboarding/
│       │   └── page.tsx                   ← Workspace creation (first-time users only)
│       └── [workspaceSlug]/
│           └── dashboard/
│               └── page.tsx               ← Main app entry after auth
│
└── components/
    ├── marketing/
    │   ├── Navbar.tsx                     ← Top nav with Login + "Get Started" buttons
    │   ├── HeroSection.tsx                ← Hero with primary CTA → opens AuthDialog
    │   └── PricingSection.tsx
    │
    └── auth/
        ├── AuthDialog.tsx                 ← shadcn Dialog — wraps sign-in/sign-up forms
        │                                     opened by CTAs, closed after successful auth
        ├── SignInForm.tsx                  ← email + password form, calls useSignIn()
        ├── SignUpForm.tsx                  ← email + password + name, calls useSignUp()
        ├── VerifyEmailForm.tsx            ← 6-digit OTP, calls attemptEmailAddressVerification()
        └── OAuthButton.tsx                ← Google / GitHub, calls authenticateWithRedirect()
```

**Complete folder structure — `apps/api` (NestJS):**

```
apps/api/src/
│
├── main.ts                                ← bootstrap(), global pipes, CORS, Swagger
├── app.module.ts                          ← root module, imports DatabaseModule + feature modules
│
│   NOTE: No database/ folder here anymore.
│         DatabaseModule is imported from @pikzee/database (libs/database)
│
├── auth/
│   ├── auth.module.ts                     ← imports DatabaseModule from libs, exports ClerkGuard
│   ├── clerk.guard.ts                     ← verifyToken() → resolves user → attaches to req
│   └── decorators/
│       └── current-user.decorator.ts      ← @CurrentUser() param decorator for controllers
│
├── users/
│   ├── users.module.ts
│   ├── users.service.ts                   ← findByClerkId(), createFromClerk(), updateFromClerk()
│   ├── users.controller.ts                ← GET /users/me (returns current authed user)
│   └── dto/
│       ├── create-user.dto.ts
│       └── update-user.dto.ts
│
└── webhooks/
    ├── webhooks.module.ts
    ├── clerk-webhook.controller.ts        ← POST /webhooks/clerk (public — no ClerkGuard)
    └── clerk-webhook.service.ts           ← verifies Svix sig, dispatches to UsersService
```

**Complete folder structure — `libs/database` (shared DB layer — NEW):**

```
libs/database/
├── src/
│   ├── index.ts                           ← barrel export (DatabaseModule, schema, db instance)
│   ├── database.module.ts                 ← NestJS Global module — imported by api + worker
│   ├── database.provider.ts               ← creates postgres.js connection from DATABASE_URL
│   ├── drizzle.config.ts                  ← drizzle-kit config for migrations
│   └── schema/
│       ├── index.ts                       ← barrel — re-exports all table schemas
│       └── users.schema.ts                ← Drizzle users table (grows: workspaces, docs, etc.)
├── project.json
├── tsconfig.json
└── tsconfig.lib.json
```

> **Why `libs/database`?** Both `apps/api` and `apps/worker` need Drizzle + schema access.
> Keeping it in `libs/` means one schema definition, no duplication, and any future
> NestJS app gets DB access by importing `DatabaseModule` from `@pikzee/database`.

**Complete folder structure — `libs/shared/types` (cross-app contracts):**

```
libs/shared/types/src/
├── index.ts                               ← barrel export
└── user.types.ts                          ← UserDto (used by web, api, worker)
```

#### 2. Schema

```sql
-- Drizzle ORM definition (TypeScript)
users (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid()
  clerk_id        VARCHAR(255)  NOT NULL UNIQUE   -- Clerk's user ID (sub)
  email           VARCHAR(255)  NOT NULL UNIQUE
  first_name      VARCHAR(100)
  last_name       VARCHAR(100)
  avatar_url      TEXT
  created_at      TIMESTAMP     NOT NULL DEFAULT now()
  updated_at      TIMESTAMP     NOT NULL DEFAULT now()
)
```

**Design decisions:**

- We keep our own `users` table even though Clerk stores user data. Reason: foreign keys from all other tables (`workspaces.owner_id`, `workspace_members.user_id`, etc.) need a local DB reference. Clerk is the source of truth for auth; we are the source of truth for product data.
- `clerk_id` is the bridge. Every API request resolves `clerk_id` → internal `user.id`.
- No password stored — Clerk owns credentials entirely.

---

#### 3. Business Logic

**A. Sign-up flow:**

```
User fills custom sign-up form (email + password)
  → useSignUp().create({ emailAddress, password })
  → Clerk sends email verification OTP
  → useSignUp().attemptEmailAddressVerification({ code })
  → Clerk creates user, issues session
  → Clerk fires user.created webhook → POST /webhooks/clerk
  → API verifies Svix signature
  → API inserts row into users table
  → Frontend redirects to /onboarding
```

**B. Sign-in flow:**

```
User fills custom sign-in form (email + password)
  → useSignIn().create({ identifier, password })
  → Clerk validates, issues session JWT
  → Frontend redirects to /:workspaceSlug/dashboard
     (or /onboarding if no workspace yet)
```

**C. OAuth flow (Google / GitHub):**

```
User clicks "Continue with Google" button
  → signIn.authenticateWithRedirect({ strategy: 'oauth_google', ... })
  → Clerk redirects to Google consent screen
  → Google redirects back to Clerk callback URL
  → Clerk issues session + fires user.created (if new user)
  → Same webhook path as email signup
```

**D. API request authentication:**

```
Frontend sends: Authorization: Bearer <clerk_session_token>
  → ClerkGuard calls verifyToken(token, { secretKey })
  → Extracts clerk_id from JWT sub claim
  → Looks up users table WHERE clerk_id = sub
  → Attaches user to request object
  → @CurrentUser() decorator exposes it to controllers
```

**E. Next.js middleware (route protection):**

```typescript
// middleware.ts
export default clerkMiddleware((auth, req) => {
  const isAppRoute = req.nextUrl.pathname.startsWith('/(app)')
  if (isAppRoute) auth().protect()
})
// Public routes: /sign-in, /sign-up, /invite/[token], /webhooks/*
// Protected routes: everything under /(app)/*
```

**F. Webhook handler (NestJS):**

- Endpoint: `POST /webhooks/clerk` — public (no Clerk guard)
- Verifies Svix signature using `CLERK_WEBHOOK_SECRET`
- Handles:
  - `user.created` → INSERT into users
  - `user.updated` → UPDATE email, name, avatar in users
  - `user.deleted` → soft-delete or anonymise user record

---

#### 4. Future Scope

- **Magic link auth** — Clerk supports `email_link` strategy, zero extra work
- **Passkeys (WebAuthn)** — Clerk Pro supports it natively
- **Enterprise SSO (SAML)** — Clerk `saml` strategy for B2B customers
- **Multi-factor authentication (MFA/TOTP)** — Clerk handles TOTP/SMS automatically when enabled
- **Session management UI** — show active sessions per device, allow remote sign-out
- **Account deletion** — GDPR-compliant: delete Clerk user + anonymise our DB records + trigger data cleanup job in worker
- **Impersonation (admin)** — Clerk supports actor tokens for support/admin use cases

---
