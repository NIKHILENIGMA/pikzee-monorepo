---
title: shared-db
description: Shared Drizzle database client, schemas, and migrations for Pikzee.
---

# @pikzee/shared-db

Path: `libs/shared/db`

## Purpose

Provides the **database access layer** shared between the API gateway (`apps/api`) and the background queue worker (`apps/worker`).

---

## What Lives Here

- **Database Client (`drizzle.ts`):** Global pool connections, client configuration, and providers.
- **Database Schema (`src/schema/*`):** Table definitions using Drizzle ORM (Users, Workspaces, Members, Projects, Assets, Documents).
- **Migrations (`migrations/*`):** Generated SQL files representing database changes over time.

---

## Conventions

- All schemas are defined using typescript Drizzle ORM constructs.
- Relations must be explicitly mapped using the `relations` API of Drizzle.
- Always generate migration scripts using `pnpm db:generate` rather than editing raw migration files.
