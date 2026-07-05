---
title: Database
description: PostgreSQL with Drizzle ORM patterns and migration workflow.
---

# Database

## Stack

- **PostgreSQL** — primary relational database
- **Drizzle ORM** — type-safe query builder and schema management
- **Drizzle Kit** — migration CLI

## Schema Location

All schema definitions live in `libs/shared/db/src/schema/` and are shared between `apps/api` and `apps/worker`.

## Migration Workflow

```bash
# 1. Edit schema in libs/shared/db/src/schema/
# 2. Generate migration SQL
pnpm db:generate

# 3. Apply migration
pnpm db:migrate

# 4. (Dev only) Push schema without migration files
pnpm db:push
```

## Patterns

```ts
// Querying with Drizzle
const workspaces = await db
  .select()
  .from(workspacesTable)
  .where(eq(workspacesTable.ownerId, userId))

// Insert
await db.insert(workspacesTable).values({ name, slug, ownerId })

// With relations
const result = await db.query.workspaces.findMany({
  where: eq(workspaces.ownerId, userId),
  with: { members: true },
})
```
