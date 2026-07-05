---
title: shared-utils
description: Shared helper functions and validators.
---

# @pikzee/shared-utils

Path: `libs/shared/utils`

## Purpose

Reusable utilities that don't belong in any specific feature library.

## Key Utilities

### `cn()` — Class name merging

```ts
import { cn } from '@pikzee/shared-utils'

// Merges Tailwind classes, resolving conflicts
cn('px-4 py-2', isActive && 'bg-primary', className)
```

### `slugify()` — URL slug generation

```ts
import { slugify } from '@pikzee/shared-utils'

slugify('My Workspace Name') // → 'my-workspace-name'
```

### `formatDate()` — Date formatting

```ts
import { formatDate } from '@pikzee/shared-utils'

formatDate(new Date()) // → 'Jul 4, 2026'
```

## Conventions

- Pure functions only — no side effects
- Fully typed with TypeScript generics
- Unit tested
