---
title: Backend Overview
description: apps/api — NestJS HTTP and WebSocket backend.
---

# Backend — apps/api

The Pikzee backend is a **NestJS** application exposing REST HTTP endpoints and WebSocket connections.

## Tech Stack

| Layer      | Technology                                        |
| ---------- | ------------------------------------------------- |
| Framework  | NestJS                                            |
| Language   | TypeScript                                        |
| Auth       | Clerk (via `@clerk/backend`)                      |
| ORM        | Drizzle ORM                                       |
| Database   | PostgreSQL                                        |
| Validation | Zod (via `nestjs-zod`)                            |
| Queue      | BullMQ (jobs dispatched here, consumed in worker) |

## Module Structure

```
apps/api/src/
├── app.module.ts              # Root module
├── auth/                      # Clerk auth guards and decorators
├── workspace/                 # Workspace CRUD and membership
├── projects/                  # Project management
├── documents/                 # Document operations
├── assets/                    # Asset upload coordination
└── publishing/                # Publishing job dispatch
```

## API Base URL

In development: `http://localhost:3001`

OpenAPI/Swagger docs: `http://localhost:3001/api` (when running)

## Key Sections

- [Auth](/backend/auth) — Clerk integration, guards
- [Modules](/backend/modules) — NestJS module map
- [Database](/backend/database) — Drizzle ORM patterns
