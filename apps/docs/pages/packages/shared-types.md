---
title: shared-types
description: Cross-app TypeScript DTOs, enums, and contracts.
---

# @pikzee/shared-types

Path: `libs/shared/types`

## Purpose

Provides the **single source of truth** for all TypeScript types shared between `apps/web`, `apps/api`, and `apps/worker`. No app should define its own DTOs for data that crosses boundaries.

## What lives here

- Request/response DTOs (e.g., `CreateWorkspaceDto`, `WorkspaceResponse`)
- Shared enums (e.g., `WorkspaceRole`, `PublishingStatus`, `AssetType`)
- TypeScript interfaces for domain entities

## Conventions

- DTOs are plain TypeScript interfaces (no class decorators — those belong in `apps/api`)
- Zod schemas for runtime validation belong in `libs/shared/config` or inline in the app
- Re-export everything from the root `index.ts`

## Example

```ts
// libs/shared/types/src/workspace.ts
export interface WorkspaceResponse {
  id: string
  name: string
  slug: string
  plan: WorkspacePlan
  ownerId: string
  createdAt: string
}

export enum WorkspacePlan {
  Free = 'free',
  Plus = 'plus',
  Pro = 'pro',
}
```
