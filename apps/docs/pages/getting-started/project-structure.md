---
title: Project Structure
description: How the Pikzee Nx monorepo is organized.
---

# Project Structure

## Directory Layout

```
pikzee-monorepo/
├── apps/                        # Deployable applications
│   ├── web/                     # Next.js 15 (App Router) — customer frontend
│   ├── api/                     # NestJS — HTTP + WebSocket backend
│   ├── worker/                  # NestJS — BullMQ background job consumer
│   └── docs/                    # Zudoku — this internal dev portal
│
├── libs/                        # Shared libraries (consumed by apps)
│   ├── shared/
│   │   ├── types/               # DTOs, enums, TypeScript contracts
│   │   ├── ui/                  # shadcn/ui components + Tailwind
│   │   ├── utils/               # Helpers, validators, utilities
│   │   └── config/              # Zod env schemas per app
│   ├── assets/                  # Upload flows, asset metadata
│   ├── documents/               # Editor, drafts, document models
│   ├── collab/                  # Yjs, Hocuspocus, presence engine
│   ├── publishing/              # Social publishing jobs and state
│   └── workspace/               # RBAC, membership, permissions
│
├── nginx/                       # Nginx reverse proxy config
├── docker-compose.yml           # Full production stack
├── docker-compose.dev.yml       # Local infra only (PG + Redis)
├── nx.json                      # Nx workspace configuration
├── pnpm-workspace.yaml          # pnpm workspace definition
└── tsconfig.base.json           # Root TypeScript path aliases
```

## Module Boundary Rules

Enforced by Nx's `@nx/enforce-module-boundaries` ESLint rule:

| From → To                  | Allowed?                             |
| -------------------------- | ------------------------------------ |
| `apps/*` → `libs/*`        | ✅ Yes                               |
| `libs/*` → `libs/shared/*` | ✅ Yes                               |
| `apps/web` → `apps/api`    | ❌ No — apps don't import each other |
| `libs/*` → `apps/*`        | ❌ No — libs can't depend on apps    |

## Tags

Each project is tagged for boundary enforcement:

| Tag               | Meaning                        |
| ----------------- | ------------------------------ |
| `type:app`        | Deployable application         |
| `type:lib`        | Shared library                 |
| `scope:customer`  | Customer-facing (web)          |
| `scope:server`    | Server-side only (api, worker) |
| `scope:shared`    | Usable across scopes           |
| `scope:internal`  | Internal tooling (docs)        |
| `runtime:browser` | Runs in browser                |
| `runtime:node`    | Runs in Node.js                |
