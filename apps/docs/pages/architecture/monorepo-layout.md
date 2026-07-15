---
title: Monorepo Layout
description: Folder structure, libraries, and application boundaries in the Pikzee monorepo.
---

# 🏗️ Monorepo Layout & Boundaries

Pikzee is structured as a monorepo powered by **Nx** and **pnpm**. This allows code reuse while maintaining strong boundaries between backend APIs, background workers, and frontends.

---

## 1. Directory Structure

```
pikzee-monorepo/
├── apps/                        # Application Entry Points
│   ├── api/                     # NestJS REST HTTP API (Port 3001)
│   ├── docs/                    # Zudoku Documentation Portal (Port 4200)
│   ├── web/                     # Next.js 15 App Router Frontend (Port 3000)
│   └── worker/                  # NestJS Worker: BullMQ Consumers + Hocuspocus Collab (Port 3002/3003)
├── libs/                        # Shared Libraries
│   ├── shared/
│   │   ├── db/                  # Drizzle ORM client, schemas, migrations
│   │   └── types/               # Cross-app DTOs and TypeScript models
│   ├── ui/                      # Shared Tailwind v4 React components (shadcn/ui)
│   ├── documents/               # TipTap Editor & Rich Text logic
│   ├── collab/                  # Yjs & presence synchronization utilities
│   ├── assets/                  # S3 direct upload presigned URL logic
│   └── publishing/              # Social media publishing strategies
└── package.json                 # Monorepo configuration and workspace scripts
```

---

## 2. Shared Packages Registry

Libraries are imported by apps via Nx path aliases (e.g. `@pikzee/shared-ui`). They enforce clean architectural boundaries.

| Package                | Path                | Consumed By            | Purpose                                                                    |
| :--------------------- | :------------------ | :--------------------- | :------------------------------------------------------------------------- |
| `@pikzee/shared-types` | `libs/shared/types` | `web`, `api`, `worker` | Request/Response contracts, database model TS types, validation schemas.   |
| `@pikzee/shared-ui`    | `libs/ui`           | `web`, `docs`          | Atomic UI primitives (Buttons, Dialogs, Inputs) utilizing Tailwind CSS v4. |
| `@pikzee/db`           | `libs/shared/db`    | `api`, `worker`        | Single global database client, Drizzle schemas, and raw migrations.        |
| `@pikzee/documents`    | `libs/documents`    | `web`, `docs`          | Encapsulated custom TipTap rich text React components.                     |
| `@pikzee/collab`       | `libs/collab`       | `web`, `worker`        | Shared Yjs models, Cursor awareness types, and WebSocket gateways.         |
| `@pikzee/assets`       | `libs/assets`       | `api`, `worker`        | S3 client wrapper, path helpers, and image resizing utilities.             |
| `@pikzee/publishing`   | `libs/publishing`   | `api`, `worker`        | Social media posting strategy files and OAuth verifiers.                   |

---

## 3. Dependency Direction Rules

To avoid circular dependencies, the following strict dependency graph is enforced:

- **Rule A:** Applications (`apps/*`) can import shared libraries (`libs/*`). Applications can **never** import other applications (e.g. `apps/api` cannot import `apps/web`).
- **Rule B:** Domain libraries (like `@pikzee/documents` or `@pikzee/publishing`) can import low-level libraries (like `@pikzee/shared-types` or `@pikzee/shared-ui`). They can **never** import applications.
- **Rule C:** Low-level libraries (`@pikzee/shared-types`) are standalone and cannot import other monorepo libraries.
