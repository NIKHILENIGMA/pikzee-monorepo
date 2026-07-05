---
title: Shared Packages
description: Overview of the shared libraries in libs/*.
---

# Shared Packages

Shared libraries live in `libs/` and are consumed by the apps via Nx path aliases. They enforce clean boundaries so no app directly depends on another.

## Library Map

| Package                 | Path                 | Purpose                                     |
| ----------------------- | -------------------- | ------------------------------------------- |
| `@pikzee/shared-types`  | `libs/shared/types`  | DTOs, enums, cross-app TypeScript contracts |
| `@pikzee/shared-ui`     | `libs/shared/ui`     | shadcn/ui components, design system         |
| `@pikzee/shared-utils`  | `libs/shared/utils`  | Helpers, validators, utilities              |
| `@pikzee/shared-config` | `libs/shared/config` | Zod env schemas per app                     |
| `@pikzee/db`            | `libs/shared/db`     | Drizzle schema, client, migrations          |
| `@pikzee/assets`        | `libs/assets`        | Upload and transformation flows             |
| `@pikzee/documents`     | `libs/documents`     | Editor and draft workflows                  |
| `@pikzee/collab`        | `libs/collab`        | Presence, cursors, collaborative editing    |
| `@pikzee/publishing`    | `libs/publishing`    | Social platform publishing                  |
| `@pikzee/workspace`     | `libs/workspace`     | Membership, roles, permissions              |

## Key Sections

- [shared-types](/packages/shared-types)
- [shared-ui](/packages/shared-ui)
- [shared-config](/packages/shared-config)
- [shared-utils](/packages/shared-utils)
