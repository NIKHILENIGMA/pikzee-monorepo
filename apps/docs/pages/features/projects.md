---
title: Project Management
description: Managing projects, folder structures, and scoping within workspaces.
---

# 📁 Project Management

Projects act as sub-containers inside a workspace, organizing documents, assets, and folders for specific campaigns or teams.

---

## 1. Project Operations

- **Create Project (`POST /projects`):** Provision a new project. Automatically initializes a default root folder structure in the assets database.
- **Project Scoping:** All operations, files, and documents are strictly scoped to a `projectId`.
- **Access Control:** Users must have membership roles (`OWNER` or `EDITOR`) in the parent workspace to modify project contents.

---

## 2. Drizzle Database Schema

Projects are defined in PostgreSQL via Drizzle ORM:

```typescript
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').notNull().default('active'), // 'active', 'archived'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
```
