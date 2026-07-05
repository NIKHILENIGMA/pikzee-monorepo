---
title: shared-config
description: Zod environment schemas and config validation.
---

# @pikzee/shared-config

Path: `libs/shared/config`

## Purpose

Centralised **Zod-based environment validation** for each app. Catches misconfiguration at startup rather than at runtime.

## Pattern

```ts
// libs/shared/config/src/api.env.ts
import { z } from 'zod'

export const apiEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  CLERK_SECRET_KEY: z.string().min(1),
  PORT: z.coerce.number().default(3001),
})

export type ApiEnv = z.infer<typeof apiEnvSchema>
```

## Usage in NestJS

```ts
// apps/api/src/app.module.ts
ConfigModule.forRoot({
  validate: (config) => apiEnvSchema.parse(config),
  isGlobal: true,
})
```
