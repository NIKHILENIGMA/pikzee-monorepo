# System Architecture

## Overview

This repository uses an Nx-based monorepo structure to house the Pikzee application—a collaborative workspace, document editing, and social publishing platform. The system consists of a web client, a centralized backend API, and a background worker service handling asynchronous jobs and real-time collaboration.

## Tech Stack

- **Monorepo Tooling:** Nx + pnpm
- **Frontend:** Next.js 16 (React, App Router)
- **Backend API:** NestJS 11 (Node.js)
- **Background Worker:** NestJS (BullMQ, Hocuspocus)
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Cache & Message Queue:** Redis
- **Authentication:** Clerk
- **Design/UI:** TailwindCSS 4, shadcn/ui

## Target Workspace Layout

```text
pikzee-monorepo/
  apps/
    web/                  # Next.js web application
    api/                  # NestJS HTTP API
    worker/               # NestJS worker for BullMQ and WebSocket (Hocuspocus)
  libs/
    database/             # Shared database module and schema
    shared/
      types/              # DTOs, enums, cross-app contracts
      ui/                 # Shared UI components (shadcn-based)
      utils/              # Helpers, validators
      config/             # Environment schemas and validation
    assets/               # Asset management, upload flows
    documents/            # Editor and draft workflows
    collab/               # Presence, cursors, collaborative editing
    publishing/           # Social platform publishing state
    workspace/            # Membership, roles, and project scoping
```

## System Components

### 1. Web Application (`apps/web`)

- Built with Next.js 15 using the App Router.
- Owns the frontend user experience.
- Handles user onboarding, workspace dashboard, document editing (TipTap), and social publishing UI.
- Authenticates via Clerk's Next.js SDK using fully custom UI components.
- Communicates with the NestJS API for business logic and the Worker for real-time collaboration.

### 2. Backend Service (`apps/api`)

- Built with NestJS 11.
- Acts as the central source of truth for the web client.
- Exposes a RESTful API.
- Validates Clerk authentication tokens.
- Handles all core business logic (workspaces, RBAC, projects, asset tracking, integrations).

### 3. Background Worker (`apps/worker`)

- Built with NestJS.
- Contains the Hocuspocus WebSocket server for real-time document collaboration (Yjs).
- Runs BullMQ queue consumers for background tasks (e.g., scheduled publishing, media processing, email notifications).
- Executes Cron jobs (monthly usage reset, token refresh).

### 4. Database Layer (`libs/database`)

- Shared database layer managed via Drizzle ORM.
- **Core Entities:**
  - `users` (mapped to Clerk IDs)
  - `workspaces` (billing unit, plan tracking)
  - `workspace_members` (RBAC)
  - `documents`
  - `assets`
  - `workspace_usage`

## State & Data Flow

1.  **Authentication:** Clients authenticate with Clerk via a custom UI. Clerk provides a JWT and fires webhooks to sync user creation.
2.  **API Requests:** Clients send the JWT in the `Authorization` header to the NestJS API (`apps/api`).
3.  **Authorization:** NestJS (`apps/api`) validates the JWT and resolves the user context. For workspace-specific routes, it verifies the user's role using the `X-Workspace-Id` header.
4.  **Real-time Collaboration:** The frontend uses Yjs to sync document states via WebSockets with the Hocuspocus server hosted in `apps/worker`.
5.  **Data Mutability:** All database writes must go through the NestJS services (either `api` or `worker`) and Drizzle ORM.

## Infrastructure

- **Development & Production:** Docker Compose is used for both local development and VPS production (Hostinger KVM).
- **Core Services in Compose:** `web`, `api`, `worker`, `postgres`, `redis`, `nginx`.
- **Integrations:** OpenAI, YouTube, Twitter/X, LinkedIn, SendGrid (Resend), Novu.

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

| Phase   | Infrastructure                                      | Target Users  | Cost   |
| ------- | --------------------------------------------------- | ------------- | ------ |
| Phase 1 | Hostinger **KVM 2** — Docker Compose                | 0 – 1,000     | Low    |
| Phase 2 | Hostinger **KVM 4** — Docker Compose (more CPU/RAM) | 1,000 – 5,000 | Medium |
| Phase 3 | **AWS** — ECS/EKS, RDS, ElastiCache, CloudFront     | 5,000+        | Scale  |

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
