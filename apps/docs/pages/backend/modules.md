---
title: Module Map
description: NestJS module organization in apps/api.
---

# Module Map

## Module Overview

| Module             | Responsibility                                |
| ------------------ | --------------------------------------------- |
| `AuthModule`       | Clerk guard, decorators, webhook handler      |
| `WorkspaceModule`  | Workspace CRUD, membership, RBAC              |
| `ProjectModule`    | Projects scoped per workspace                 |
| `DocumentModule`   | Document creation, versioning, editor state   |
| `AssetModule`      | Upload coordination, presigned URLs, metadata |
| `PublishingModule` | Dispatch publishing jobs to worker queue      |
| `DatabaseModule`   | Drizzle client, global provider               |
| `ConfigModule`     | NestJS config from `libs/shared/config`       |

## Dependency Flow

```
AppModule
├── ConfigModule (global)
├── DatabaseModule (global)
├── AuthModule
├── WorkspaceModule → AuthModule
├── ProjectModule → WorkspaceModule
├── DocumentModule → ProjectModule
├── AssetModule → WorkspaceModule
└── PublishingModule → ProjectModule
```
