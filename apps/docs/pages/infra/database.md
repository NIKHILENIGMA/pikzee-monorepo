---
title: Database (Infra)
description: PostgreSQL setup and connection configuration.
---

# Database (Infrastructure)

## PostgreSQL

- Version: **16** (Alpine)
- ORM: **Drizzle ORM** (see [Backend Database docs](/backend/database) for query patterns)
- Migration tool: **Drizzle Kit**

## Connection

```bash
# Local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pikzee

# Production
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/pikzee?sslmode=require
```

## Schema

All table definitions live in `libs/shared/db/src/schema/`:

```
libs/shared/db/src/schema/
├── users.ts          # Synced from Clerk via webhook
├── workspaces.ts
├── workspace-members.ts
├── projects.ts
├── documents.ts
├── assets.ts
└── publishing-jobs.ts
```
