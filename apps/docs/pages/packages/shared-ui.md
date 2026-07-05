---
title: shared-ui
description: Shared shadcn/ui component library.
---

# @pikzee/shared-ui

Path: `libs/shared/ui`

## Purpose

The shared component library built on **shadcn/ui** and **Tailwind CSS**. All visual components that need to be consistent across the frontend live here.

## Adding a Component

```bash
# Always add to libs/shared/ui, never directly to apps/web
pnpm dlx shadcn add <component-name> --path=libs/shared/ui/src/components
```

## Using a Component

```ts
import { Button } from '@pikzee/shared-ui'
import { Input } from '@pikzee/shared-ui'
import { Card, CardContent, CardHeader } from '@pikzee/shared-ui'
```

## Conventions

- One file per component: `Button.tsx`, `Input.tsx`
- All re-exported from `src/index.ts`
- Use `cn()` from `@pikzee/shared-utils` for conditional classes
- No app-specific logic — components are purely presentational
