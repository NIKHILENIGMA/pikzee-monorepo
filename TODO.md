# Pikzee MVP1 — Discussion & Decision Log

> This file is a **living document**. Every architectural decision made during our brainstorming is logged here for future reference. Both humans and agents should read this before making changes.

---

## 📦 Build Order (Agreed)

```
1. Auth
2. Workspace
3. RBAC
4. Member Invites
5. Projects
6. Documents
7. Yjs Collaboration
8. Comments
9. AI Writing
10. YouTube OAuth
11. Scheduled Publishing
12. Worker System
```

---

## ✅ Decisions Log

> Each decision is recorded here as we discuss it. Status: `[DECIDED]` or `[PENDING]`

### [DECIDED] D-01 · Auth: Custom UI with Clerk Backend
- **Option A — Hosted:** ❌ Rejected. Exposes Clerk branding in production.
- **Option B — Embedded `<SignIn/>`:** ❌ Rejected. Still Clerk-controlled markup.
- **Option C — Fully Custom UI:** ✅ **Chosen.**
  - Build sign-in / sign-up pages from scratch using **shadcn/ui + TailwindCSS**
  - Use Clerk's **`@clerk/nextjs`** SDK for: `auth()`, `currentUser()`, `clerkMiddleware()`, `useSignIn()`, `useSignUp()` hooks
  - OAuth buttons (Google, GitHub) hand-coded but wired to Clerk's OAuth strategy
  - **Reason:** No Clerk branding visible in production. Full control over app layer and UX flow.
- **Conclusion:** ✅ Custom components wired to Clerk's SDK hooks — zero Clerk UI in the browser.

---

### [DECIDED] D-02 · Workspace: Multi-workspace, Plan per Workspace
- **Option A — Single workspace per user:** ❌ Rejected. Doesn't scale to teams/agencies, painful migration later.
- **Option B — Multi-workspace, plan per user:** ❌ Rejected. Can't control per-workspace limits cleanly.
- **Option C — Multi-workspace, plan per workspace:** ✅ **Chosen.**
  - The **workspace is the billing unit** (plan lives on the workspace, owner pays)
  - Abuse prevention: workspace ownership count is gated by owner's account tier
    - Free account → can **OWN** max **1 workspace**
    - Plus account → can **OWN** max **3 workspaces**
    - Pro account → can **OWN** unlimited workspaces
  - Any user can be a **member** of unlimited workspaces regardless of plan
  - All limits (storage, AI, members) are **scoped per workspace**
  - URL structure: `/:workspaceSlug/...` (future-proof from day 1)
- **Conclusion:** ✅ Multi-workspace + per-workspace billing with ownership gating.

---

### [DECIDED] D-03 · Real-Time Collab: Hocuspocus inside `apps/worker` (NestJS)
- **Option A — Standalone Hocuspocus process:** ❌ Rejected. 3rd process to deploy, no NestJS DI, separate Dockerfile.
- **Option B — NestJS WS Gateway inside `apps/api`:** ❌ Rejected. Pollutes stateless HTTP API with stateful WS connections. Forces sticky sessions on load balancer.
- **Option C — Hocuspocus as NestJS service inside `apps/worker`:** ✅ **Chosen.**
  - `apps/worker` is a **NestJS application** (like `apps/api`) that owns all long-running processes
  - Responsibilities of `apps/worker`:
    - Hocuspocus WebSocket server (real-time doc collaboration)
    - BullMQ queue consumers (publishing, media processing, emails)
    - Cron jobs (monthly usage reset, OAuth token refresh)
  - **Why it fits:** Redis is already shared between BullMQ and Hocuspocus. NestJS `onModuleInit()` handles clean startup/shutdown. Full DI for Clerk, config, Redis.
  - **`apps/api` stays purely stateless HTTP** — scales horizontally without sticky sessions
  - Future split path: if WS load grows, extract into `apps/collab` later — trivial with NestJS modules
- **Architecture:**
  ```
  apps/api     → NestJS HTTP REST (stateless, port 3001)
  apps/web     → Next.js frontend (port 3000)
  apps/worker  → NestJS long-running (port 3002)
                  ├── Hocuspocus WS server (collab, port 3003)
                  ├── BullMQ consumers (publishing, media, email)
                  └── Cron jobs (usage reset, token refresh)
  ```
- **Conclusion:** ✅ `apps/worker` is a full NestJS app handling WebSocket collab + async jobs + crons.

---

### [DECIDED] D-04 · Email + Notifications: Resend + Novu (split by purpose)
- **Option A — SendGrid only:** ❌ Rejected. Email-only, no in-app notifications, build bell icon from scratch.
- **Option B — Novu only:** ❌ Rejected. Novu email templates less ergonomic than React Email.
- **Option C — Resend + Novu (split by channel):** ✅ **Chosen.**
  - **Resend** → all transactional **emails**
    - Built with **`react-email`** + `@react-email/components` — templates are React components
    - Fully on-brand, no Resend watermark, Next.js-native
    - Use cases: workspace invite link, payment receipt, welcome email, publish failure alert
    - Email templates live in `libs/shared/emails/` as `.tsx` files
    - API renders + sends via Resend SDK inside `apps/api`
  - **Novu** → all **in-app notifications** (bell icon / notification center)
    - Drop-in `<NotificationCenter />` component in `apps/web` sidebar
    - Use cases: new comment, doc shared, member joined, post published/failed
    - Novu handles delivery, read state, notification feed — zero custom UI
  - **No overlap:** Resend = email channel. Novu = in-app channel. Both triggered from `apps/api`.
- **Conclusion:** ✅ Resend (react-email templates) for email + Novu for in-app notifications.

---

### [DECIDED] D-05 · DB + Infra: Docker Compose on Hostinger VPS (dev AND prod)
- **Option A — Managed cloud (Neon + Upstash):** ❌ Rejected. Free tier limits hit during dev, extra cost, not aligned with VPS-first prod strategy.
- **Option B — Docker Compose local + managed cloud prod:** ❌ Rejected. Environment parity issues, extra cost.
- **Option C — Docker Compose everywhere (dev + prod):** ✅ **Chosen.**
  - Same `docker-compose.yml` base for local dev and VPS production
  - **Local dev:** `docker-compose.dev.yml` override (hot reload, dev ports, no restart policies)
  - **Production:** `docker-compose.prod.yml` override (restart policies, no volume code mounts, resource limits)
  - Services in compose: `web`, `api`, `worker`, `postgres`, `redis`, `nginx`
  - SSL via **Certbot + Let's Encrypt** (nginx handles HTTPS termination)
  - **Reason:** Cost-efficient, environment parity, single-server simplicity for first 1000 users

### Infrastructure Scaling Roadmap
| Phase | Infrastructure | Target Users | Cost |
|---|---|---|---|
| Phase 1 | Hostinger **KVM 2** — Docker Compose | 0 – 1,000 | Low |
| Phase 2 | Hostinger **KVM 4** — Docker Compose (more CPU/RAM) | 1,000 – 5,000 | Medium |
| Phase 3 | **AWS** — ECS/EKS, RDS, ElastiCache, CloudFront | 5,000+ | Scale |

### Docker Compose Service Map (Production)
```
nginx         → Reverse proxy + SSL termination (ports 80, 443)
web           → Next.js (port 3000, internal)
api           → NestJS HTTP REST (port 3001, internal)
worker        → NestJS WS + BullMQ + Crons (port 3002/3003, internal)
postgres      → PostgreSQL 16 (port 5432, internal only)
redis         → Redis 7 (port 6379, internal only)
```

### File Structure
```
pikzee-monorepo/
  docker-compose.yml          ← base (shared service definitions)
  docker-compose.dev.yml      ← dev overrides (hot reload, exposed ports)
  docker-compose.prod.yml     ← prod overrides (restart, resource limits)
  nginx/
    nginx.conf
    ssl/                      ← Certbot managed certs
  apps/
    web/Dockerfile
    api/Dockerfile
    worker/Dockerfile
```

- **Conclusion:** ✅ Docker Compose on Hostinger VPS KVM 2 for both dev and prod. Same tooling all the way to Phase 2. AWS migration is clean when the time comes since apps are already containerised.

---

## 🛠️ Tech Stack (Confirmed)

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) |
| Backend | NestJS 11 |
| Monorepo | Nx 22 + pnpm |
| Styling | TailwindCSS 4 + shadcn/ui |
| Database | PostgreSQL + Drizzle ORM |
| Cache / Queue | Redis + BullMQ |
| Auth | Clerk |
| Editor | TipTap |
| Collab | Yjs + Hocuspocus |
| AI | OpenAI (GPT-4o-mini) |
| Storage | S3 / ImageKit |

---

## 💳 Subscription Plans (Razorpay)

> Payment provider: **Razorpay Subscriptions API** (recurring monthly/annual)

| Feature | FREE | PLUS | PRO |
|---|---|---|---|
| Price (per workspace/mo) | ₹0 | ₹TBD | ₹TBD |
| Workspaces user can OWN | 1 max | 3 max | Unlimited |
| AI doc edits / month | 10 | 500 | Unlimited |
| AI image transforms / month | 0 | 20 | 200 |
| Asset storage (per workspace) | 500 MB | 10 GB | 50 GB |
| Publish → YouTube | ✅ | ✅ | ✅ |
| Publish → Twitter/X | ❌ | ✅ | ✅ |
| Publish → LinkedIn | ❌ | ❌ | ✅ |
| Max member invitations | 1 | 5 | 20 |

### How Paying for a Plan Works
- Payment happens **inside a specific workspace's billing settings**
- That workspace becomes Plus/Pro — other workspaces the user owns stay on Free
- Paying for Plus on Workspace A unlocks **two things**:
  1. Workspace A gets Plus features (10GB, 500 AI, 5 members, Twitter)
  2. User's ownership capacity increases (can now create up to 3 workspaces)
- Extra workspaces (B, C) default to **Free** — they are useful for data/team isolation,
  not for extra limits (separate clients, side projects, staging environments)

### Abuse Prevention Rules
1. Workspace ownership count gated by whether user has any paid workspace
2. All limits enforced server-side — never trust client
3. Storage checked on every upload via quota guard middleware
4. AI requests tracked in `workspace_usage` table, reset monthly via cron
5. Members can JOIN unlimited workspaces (membership ≠ ownership)
6. Workspace status field controls access: `active | suspended | archived`

### Plan Expiry / Downgrade Rules

**When Plus expires on Workspace A** (payment.failed or cancelled):

| Resource | What happens |
|---|---|
| Storage > 500MB | Read-only mode — can view, cannot upload new files |
| Members > 1 | Existing members stay active, new invites blocked |
| AI requests | Resets to 10/month cap on next cycle |
| Scheduled Twitter/LinkedIn posts | Cancelled → moved to Draft, owner notified |

**When ownership capacity drops** (Plus=3 → Free=1, but user has 3 workspaces):

- Extra workspaces (B, C) → status set to `suspended`
- Members of B and C lose access immediately
- Data is **preserved** — nothing deleted
- Owner sees: *"Renew Plus to reactivate your other workspaces"*
- On upgrade → B and C reactivate instantly

**Downgrade timeline:**
```
Day 0   payment.failed received → Razorpay retries payment
Day 3   Grace period ends → plan marked EXPIRING
          → Novu in-app alert + Resend warning email to owner
Day 7   Full downgrade to Free
          → Workspace A limits enforced (read-only storage, invite block)
          → Workspaces B, C suspended
Day 21  Final warning: "Upgrade or excess data will be archived"
Day 30  Excess assets archived (compressed, still recoverable on upgrade)
Never   Data permanently deleted without explicit user request
```

### Razorpay Webhook Events
- `subscription.activated` → set workspace `plan = plus/pro`, reactivate suspended workspaces
- `subscription.charged` → renew period dates
- `subscription.cancelled` → schedule downgrade job at period end (worker cron)
- `subscription.completed` → downgrade to free, suspend extra workspaces
- `payment.failed` → start grace period counter, notify owner

### Billing DB Schema
```sql
workspaces
  plan            ENUM('free','plus','pro')  DEFAULT 'free'
  status          ENUM('active','suspended','archived')  DEFAULT 'active'
  plan_expires_at TIMESTAMP NULL
  owner_id        → users

workspace_subscriptions
  workspace_id              → workspaces
  razorpay_subscription_id  VARCHAR
  razorpay_plan_id          VARCHAR
  status                    ENUM('active','paused','cancelled','expired')
  current_period_start      TIMESTAMP
  current_period_end        TIMESTAMP
  grace_period_ends_at      TIMESTAMP NULL   ← set on payment.failed

workspace_usage  -- reset monthly via worker cron
  workspace_id      → workspaces
  ai_doc_requests   INT DEFAULT 0
  ai_image_requests INT DEFAULT 0
  storage_bytes     BIGINT DEFAULT 0
  period_start      TIMESTAMP
  period_end        TIMESTAMP
```

### Enforcement Checkpoints in Code
| Endpoint | Limit Checked |
|---|---|
| `POST /uploads` | `storage_bytes + file_size ≤ plan_storage_limit` |
| `POST /ai/complete` | `ai_doc_requests < plan_ai_doc_limit` |
| `POST /ai/transform-image` | `ai_image_requests < plan_ai_image_limit` |
| `POST /invites` | `member_count < plan_member_limit` |
| `POST /publish` | `platform ∈ plan_allowed_platforms` |
| `POST /workspaces` | `owned_workspaces_count < ownership_limit_for_user` |
| **All (app) routes** | `workspace.status === 'active'` else show suspended screen |

---

## 📐 Features

> Each feature is broken down into: **Setup → Schema → Business Logic → Future Scope**
> Status tags: `[DISCUSSED]` · `[IN PROGRESS]` · `[DONE]`

---

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

### F-02 · Workspace `[DISCUSSED]`

#### Decisions Made
| # | Decision | Choice |
|---|---|---|
| Slug | Immutable after creation | ✅ Immutable — changing breaks all URLs/bookmarks |
| Onboarding | 1-step or wizard | ✅ Multi-step wizard (professional feel) |
| Deletion | Hard or soft | ✅ Soft delete — status=`archived`, data preserved |
| Logo | Skip or collect | ✅ Collect during onboarding — `logo_url` stored as string in DB |

> **Logo upload note:** Full asset system (F-07) isn't built during F-02.
> Onboarding uses a lightweight `POST /workspaces/upload-logo` endpoint (multipart)
> that uploads directly to S3/ImageKit and returns a URL. Unified with asset system later.

---

#### 1. Setup

**Packages to install:**
```bash
# apps/api
pnpm add slugify
pnpm add @aws-sdk/client-s3    ← logo upload only, no full asset system yet
```

**Environment variables (additions):**
```env
# apps/api/.env
S3_BUCKET_NAME=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_PUBLIC_URL=                 ← CDN/public base URL for uploaded files
```

**Complete folder structure — `apps/web` (Next.js):**
```
apps/web/src/
│
├── app/(app)/
│   ├── onboarding/
│   │   └── page.tsx                     ← multi-step wizard host page
│   │
│   └── [workspaceSlug]/
│       ├── layout.tsx                   ← fetches workspace, validates membership + status
│       ├── dashboard/
│       │   └── page.tsx                 ← workspace overview (stats, recent docs, activity)
│       └── settings/
│           └── general/
│               └── page.tsx             ← rename workspace, replace logo
│
└── components/
    ├── workspace/
    │   ├── WorkspaceContext.tsx          ← React context — current workspace data
    │   ├── WorkspaceProvider.tsx         ← wraps [workspaceSlug]/layout, fetches + provides
    │   ├── WorkspaceSwitcher.tsx         ← sidebar dropdown: owned + joined workspaces
    │   ├── WorkspaceAvatar.tsx           ← logo img OR initials fallback (auto color)
    │   └── WorkspaceSuspendedScreen.tsx  ← full-page block when status=suspended
    │
    └── onboarding/
        ├── OnboardingWizard.tsx          ← step controller (tracks current step + collected data)
        ├── OnboardingProgress.tsx        ← step indicator dots / progress bar
        └── steps/
            ├── StepWorkspaceName.tsx     ← Step 1: name input + live slug preview
            ├── StepWorkspaceLogo.tsx     ← Step 2: drag-drop logo upload or skip
            └── StepComplete.tsx          ← Step 3: success screen + "Go to Dashboard" CTA
```

**Complete folder structure — `apps/api` (NestJS):**
```
apps/api/src/
│
└── workspaces/
    ├── workspaces.module.ts
    ├── workspaces.controller.ts
    │   ├── POST   /workspaces                  ← create workspace
    │   ├── POST   /workspaces/upload-logo       ← multipart logo → S3 → returns URL
    │   ├── GET    /workspaces/mine              ← all workspaces for current user
    │   ├── GET    /workspaces/by-slug/:slug     ← load by slug (context fetch on every page)
    │   ├── PATCH  /workspaces/:id               ← update name / logo_url (slug immutable)
    │   └── DELETE /workspaces/:id               ← soft delete → status=archived
    ├── workspaces.service.ts
    │   ├── create()           ← slugify + uniqueness check + ownership limit + atomic insert
    │   ├── uploadLogo()       ← multipart → S3 → return CDN URL
    │   ├── findAllForUser()   ← owned + member workspaces ordered (owned first)
    │   ├── findBySlug()       ← slug lookup + membership validation
    │   ├── update()           ← update name/logo only (slug field never touched)
    │   └── archive()          ← status=archived + notify members via Novu (worker job)
    └── dto/
        ├── create-workspace.dto.ts    ← { name: string; logo_url?: string }
        └── update-workspace.dto.ts    ← { name?: string; logo_url?: string }
```

**`libs/database/src/schema/` (additions):**
```
libs/database/src/schema/
├── index.ts                  ← add workspaces export here
├── users.schema.ts            ← (existing)
└── workspaces.schema.ts       ← NEW
```

**`libs/shared/types/src/` (additions):**
```
libs/shared/types/src/
├── index.ts
├── user.types.ts              ← (existing)
└── workspace.types.ts         ← NEW — WorkspaceDto, WorkspacePlan, WorkspaceStatus enums
```

---

#### 2. Schema

```sql
-- libs/database/src/schema/workspaces.schema.ts (Drizzle)
workspaces (
  id          UUID         PRIMARY KEY  DEFAULT gen_random_uuid()
  name        VARCHAR(100) NOT NULL
  slug        VARCHAR(100) NOT NULL UNIQUE          -- immutable after creation, DB-level enforced
  logo_url    TEXT         NULLABLE                 -- S3/CDN URL or null → show initials avatar
  plan        ENUM         'free'|'plus'|'pro'      DEFAULT 'free'
  status      ENUM         'active'|'suspended'|'archived'  DEFAULT 'active'
  owner_id    UUID         NOT NULL REFERENCES users(id)
  created_at  TIMESTAMP    NOT NULL  DEFAULT now()
  updated_at  TIMESTAMP    NOT NULL  DEFAULT now()
)

CREATE UNIQUE INDEX idx_workspaces_slug  ON workspaces(slug);    -- fast slug lookup
CREATE INDEX        idx_workspaces_owner ON workspaces(owner_id); -- ownership queries
```

**Design decisions:**
- `slug` unique constraint at DB level — collision-safe even under concurrent requests
- `owner_id` denormalized — fast ownership check without joining `workspace_members`
- `logo_url = null` → render `<WorkspaceAvatar />` with initials + auto-generated color (never broken img)
- `status` drives ALL access control — `[workspaceSlug]/layout.tsx` checks it on every load

---

#### 3. Business Logic

**A. Onboarding Wizard (3 steps):**
```
Step 1 — Workspace Name
  ├── Text input for workspace name
  ├── Live slug preview below: "app.pikzee.com/acme-agency" (debounced 300ms)
  └── Validation: 3–100 chars, alphanumeric + spaces only

Step 2 — Workspace Logo
  ├── Drag-drop or click-to-upload image (PNG, JPG, SVG — max 2MB)
  ├── Client-side preview via FileReader (instant, before upload)
  ├── On "Next" → POST /workspaces/upload-logo (multipart)
  │            → API uploads to S3 → returns { logo_url }
  └── "Skip for now" → logo_url stays null → initials shown everywhere

Step 3 — Complete
  ├── Summary card: workspace avatar + name + slug
  ├── "Go to Dashboard" → POST /workspaces { name, logo_url }
  │   → API: slugify(name) → check uniqueness → check ownership limit
  │   → Atomic: INSERT workspaces + INSERT workspace_members { role: 'OWNER' }
  │   → Returns { workspace }
  └── router.push('/:workspaceSlug/dashboard')
```

**B. Workspace Context Load (every protected page):**
```
[workspaceSlug]/layout.tsx (server component — runs on every navigation)
  → GET /workspaces/by-slug/:slug
  → 404 → redirect to /
  → 403 → redirect to /   (user not a member)
  → status = 'suspended'  → render <WorkspaceSuspendedScreen />  (with upgrade CTA)
  → status = 'archived'   → redirect to /
  → ok → pass workspace as prop to <WorkspaceProvider />
  → <WorkspaceProvider /> puts workspace in React Context
  → All child pages read via useWorkspace() hook (zero refetch)
```

**C. Slug Generation:**
```
slugify("Acme Agency!") → "acme-agency"
SELECT id FROM workspaces WHERE slug = 'acme-agency'
  → not found → ✅ use "acme-agency"
  → found     → try "acme-agency-1" → ... until unique
```

**D. Workspace Switcher:**
```
GET /workspaces/mine
  SELECT w.* FROM workspaces w
  INNER JOIN workspace_members wm ON wm.workspace_id = w.id
  WHERE wm.user_id = :userId AND w.status = 'active'
  ORDER BY (wm.role = 'OWNER') DESC, w.created_at ASC
  → owned workspaces appear first, then joined workspaces
```

**E. Soft Delete (archive):**
```
DELETE /workspaces/:id  (OWNER only)
  → UPDATE workspaces SET status='archived', updated_at=now()
  → Enqueue worker job: notify all members via Novu in-app
  → Members hit 404-equivalent on next access → redirect to /
  → Data preserved for 30 days → then permanent cleanup job
```

---

#### 4. Future Scope

- **Slug redirect** — if slug change ever allowed, old slug 301-redirects to new (post-MVP)
- **Workspace transfer** — transfer ownership to another ADMIN member
- **Workspace templates** — pre-populate with example projects/docs on creation wizard
- **Workspace analytics** — aggregated storage, AI usage, publish stats dashboard for owner
- **GDPR data export** — download all workspace data as ZIP (regulatory requirement)
- **Sub-workspaces** — nested hierarchy for large enterprise clients (far future)

---

### F-03 · RBAC `[DISCUSSED]`

#### Decisions Made
| # | Decision | Choice |
|---|---|---|
| Roles | 4 custom roles | ✅ OWNER / EDITOR / COMMENTOR / GUEST |
| Guard mechanism | Header vs URL param | ✅ `X-Workspace-Id` header |
| ADMIN promotion | Can ADMIN promote to ADMIN? | ✅ N/A — no ADMIN role. Only OWNER manages members. |
| OWNER protection | Can OWNER be removed? | ✅ NO — only via explicit ownership transfer |

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

### F-04 · Member Invites `[DISCUSSED]`

#### Decisions Made
| # | Decision | Choice |
|---|---|---|
| Invite expiry | Duration | ✅ 7 days — standard protocol |
| Email security | Must accepter's email match invite email? | ✅ YES — prevents token hijacking |
| Decline invite | Track declined invites in DB? | ✅ NO — let it expire silently |
| Re-invite | Reuse token or generate new one? | ✅ New token — old link invalidated immediately |

---

#### 1. Setup

**Packages to install:**
```bash
# apps/api
pnpm add nanoid               ← token generation (21-char URL-safe random string)
pnpm add resend               ← email sending

# libs/shared/emails (new lib)
pnpm add @react-email/components react-email
```

**Environment variables (additions):**
```env
# apps/api/.env
RESEND_API_KEY=
RESEND_FROM_EMAIL=invite@pikzee.com
APP_BASE_URL=https://app.pikzee.com  ← used to build /invite/:token links in emails
```

**Complete folder structure — `apps/web` (Next.js):**
```
apps/web/src/
│
├── app/
│   ├── invite/
│   │   └── [token]/
│   │       └── page.tsx               ← PUBLIC — no auth required to land here
│   │                                     fetches invite details, shows AcceptInviteCard
│   └── (app)/[workspaceSlug]/
│       └── settings/
│           └── members/
│               └── page.tsx           ← member list + invite form + pending invites table
│
└── components/
    └── invites/
        ├── InviteForm.tsx             ← email input + role selector dropdown (OWNER only)
        ├── PendingInvitesList.tsx     ← table: email, role, sent at, expires at, revoke btn
        └── AcceptInviteCard.tsx       ← shown on /invite/:token — workspace info + CTA
```

**Complete folder structure — `apps/api` (NestJS):**
```
apps/api/src/
│
└── invites/
    ├── invites.module.ts
    ├── invites.controller.ts
    │   ├── POST   /invites                        ← send invite (OWNER only)
    │   ├── GET    /invites                        ← list pending invites for workspace
    │   ├── DELETE /invites/:id                    ← revoke invite (OWNER only)
    │   ├── GET    /invites/by-token/:token         ← PUBLIC — no auth, get invite details
    │   └── POST   /invites/by-token/:token/accept  ← accept invite (Clerk JWT required)
    ├── invites.service.ts
    │   ├── sendInvite()        ← plan limit check + dupe check + nanoid + INSERT + Resend email
    │   ├── listPending()       ← SELECT WHERE status=PENDING
    │   ├── revokeInvite()      ← UPDATE status=REVOKED
    │   ├── getByToken()        ← public token lookup (for accept page)
    │   └── acceptInvite()      ← validate + email match + atomic INSERT member + UPDATE invite
    └── dto/
        └── create-invite.dto.ts   ← { email: string; role: 'EDITOR' | 'COMMENTOR' | 'GUEST' }
```

**`libs/shared/emails` (new shared lib):**
```
libs/shared/emails/
├── src/
│   ├── index.ts                       ← barrel export
│   └── WorkspaceInviteEmail.tsx       ← react-email template (used by invites.service.ts)
├── project.json
├── tsconfig.json
└── tsconfig.lib.json
```

**`libs/database/src/schema/` (additions):**
```
libs/database/src/schema/
└── workspace-invites.schema.ts        ← NEW Drizzle table
```

**`libs/shared/types/src/` (additions):**
```
libs/shared/types/src/
└── invite.types.ts                    ← InviteDto, InviteStatus enum
```

---

#### 2. Schema

```sql
-- libs/database/src/schema/workspace-invites.schema.ts
workspace_invites (
  id            UUID         PRIMARY KEY  DEFAULT gen_random_uuid()
  workspace_id  UUID         NOT NULL  REFERENCES workspaces(id)  ON DELETE CASCADE
  invited_by    UUID         NOT NULL  REFERENCES users(id)        ← must be OWNER
  email         VARCHAR(255) NOT NULL                              ← who is being invited
  role          ENUM         'EDITOR'|'COMMENTOR'|'GUEST'          ← OWNER role cannot be invited
  token         VARCHAR(255) NOT NULL UNIQUE                       ← nanoid() 21 chars
  status        ENUM         'PENDING'|'ACCEPTED'|'EXPIRED'|'REVOKED'  DEFAULT 'PENDING'
  expires_at    TIMESTAMP    NOT NULL                              ← created_at + 7 days
  accepted_at   TIMESTAMP    NULLABLE
  accepted_by   UUID         NULLABLE  REFERENCES users(id)        ← user who accepted
  created_at    TIMESTAMP    NOT NULL  DEFAULT now()
)

CREATE UNIQUE INDEX idx_invite_token         ON workspace_invites(token);
CREATE INDEX        idx_invite_workspace_email ON workspace_invites(workspace_id, email);
```

**Invite state machine:**
```
PENDING → ACCEPTED  (accepted within 7 days)
PENDING → EXPIRED   (7 days passed, cron job marks it)
PENDING → REVOKED   (OWNER cancelled before acceptance)
```

**Design decisions:**
- `token` unique at DB level — collision-safe
- `email` stored explicitly — security check on accept (must match logged-in user's email)
- `OWNER` role is not in the role enum — cannot be assigned via invite flow
- On re-invite: new `nanoid()` token replaces old one in the same row, `expires_at` reset → old link dies

---

#### 3. Business Logic

**A. Send Invite:**
```
POST /invites { email, role: 'EDITOR' }
  → @Roles('OWNER') — enforced by RolesGuard
  → Plan limit check:
      SELECT COUNT(*) FROM workspace_members WHERE workspace_id=:wid AND role != 'OWNER'
      count >= plan_limit → 402 Payment Required
  → Already a member? → 409 Conflict
  → PENDING invite exists for this email?
      YES → UPDATE token=nanoid(), expires_at=now()+7d (old link dead, new email sent)
      NO  → INSERT workspace_invites row
  → Send email via Resend:
      react: <WorkspaceInviteEmail workspace inviter role token />
      to: invite.email
      subject: "You're invited to join {workspace.name} on Pikzee"
  → Return: { invite }
```

**B. View Invite Page (public):**
```
GET /invites/by-token/:token  (no ClerkGuard — fully public)
  → token not found            → 404
  → status = REVOKED           → 410 Gone ("Invite was cancelled")
  → status = ACCEPTED          → 409 ("Already accepted")
  → status = PENDING + expires_at < now()
      → UPDATE status=EXPIRED  → 410 Gone ("Invite expired")
  → status = PENDING + valid   → 200 { workspace, inviter, role, expiresAt }

Frontend /invite/[token]/page.tsx renders:
  → <AcceptInviteCard />: workspace logo, name, inviter, role badge, "Accept" CTA
  → If not logged in: shows sign-in/sign-up options below the card
```

**C. Accept Invite (logged-in user):**
```
POST /invites/by-token/:token/accept
  → ClerkGuard (Clerk JWT required)
  → Validate token: PENDING + not expired (same checks as GET)
  → Email security check:
      currentUser.email === invite.email
      Mismatch → 403 "This invite was sent to a different email address"
  → Atomic transaction:
      INSERT workspace_members { workspace_id, user_id=currentUser.id, role, invited_by }
      UPDATE workspace_invites SET status='ACCEPTED', accepted_at=now(), accepted_by=userId
  → Novu in-app: notify OWNER "User X has joined as EDITOR"
  → Return: { workspace }
  → Frontend: router.push('/:workspaceSlug/dashboard')
```

**D. Accept Invite (new user / not signed in):**
```
User opens /invite/:token without a Clerk session
  → Page shows invite card + "Sign up to join {workspace}"
  → token saved in sessionStorage before opening AuthDialog
  → AuthDialog opens in SIGN UP mode
  → Email field: pre-filled from invite.email, field is locked (readonly)
  → User signs up → Clerk webhook → users row created in DB
  → After session established → page reads token from sessionStorage
  → Auto-triggers POST /invites/by-token/:token/accept
  → Same flow as (C) above
```

**E. Revoke Invite (OWNER):**
```
DELETE /invites/:id
  → @Roles('OWNER')
  → UPDATE workspace_invites SET status='REVOKED'
  → No email sent — link silently stops working
  → Removed from PendingInvitesList in UI immediately
```

**F. Expired Invite Cleanup (worker cron):**
```
Cron: runs daily at midnight
  UPDATE workspace_invites
    SET status='EXPIRED'
    WHERE status='PENDING' AND expires_at < now()
```

**Email template content (`WorkspaceInviteEmail.tsx`):**
```
Header:    Pikzee logo
Body:      Workspace avatar + name
           "{InviterName} has invited you to join {WorkspaceName} as {Role}"
           Role pill: EDITOR | COMMENTOR | GUEST
           Role description: one line explaining what the role can do
CTA:       "Accept Invitation" button → APP_BASE_URL/invite/:token
Footer:    "Link expires in 7 days · If you didn't expect this, ignore this email."
```

---

#### 4. Future Scope

- **Bulk invite** — invite multiple emails at once (comma-separated or CSV upload)
- **Invite link (public)** — shareable link anyone can use to join (no email required)
- **Invite approval** — OWNER must approve before member joins (request-to-join flow)
- **Invite via Novu** — in-app invite notification for existing Pikzee users (no email needed)
- **Declined invite tracking** — optional DECLINED status for analytics

---
