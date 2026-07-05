---
title: Commands Cheat Sheet
description: All pnpm and Nx commands you'll need day-to-day.
---

# Commands Cheat Sheet

## Development

| Command                               | Description                        |
| ------------------------------------- | ---------------------------------- |
| `nx run web:dev`                      | Start Next.js frontend (port 3000) |
| `nx run api:serve`                    | Start NestJS API (port 3001)       |
| `nx run worker:serve`                 | Start BullMQ worker                |
| `nx run docs:dev`                     | Start this docs site (port 4200)   |
| `nx run-many -t dev,serve --parallel` | Start all apps concurrently        |

## Build

| Command                | Description                 |
| ---------------------- | --------------------------- |
| `pnpm build`           | Build all apps              |
| `nx run web:build`     | Build frontend only         |
| `nx run api:build`     | Build API only              |
| `nx affected -t build` | Build only changed projects |

## Database (Drizzle)

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `pnpm db:generate` | Generate migration files from schema |
| `pnpm db:migrate`  | Apply pending migrations             |
| `pnpm db:push`     | Push schema directly (dev only)      |
| `pnpm db:studio`   | Open Drizzle Studio UI               |

## Code Quality

| Command             | Description                      |
| ------------------- | -------------------------------- |
| `pnpm lint`         | Lint all projects                |
| `pnpm lint:fix`     | Lint and auto-fix                |
| `pnpm format`       | Format all files with Prettier   |
| `pnpm format:check` | Check formatting without writing |

## Nx Utilities

| Command                     | Description                          |
| --------------------------- | ------------------------------------ |
| `nx graph`                  | Open the Nx project dependency graph |
| `nx show project web --web` | See all targets for the `web` app    |
| `nx show project api --web` | See all targets for the `api` app    |
| `nx affected --base=main`   | Show what changed vs main branch     |
| `nx reset`                  | Clear the Nx computation cache       |

## Docker

| Command                                           | Description                    |
| ------------------------------------------------- | ------------------------------ |
| `docker compose -f docker-compose.dev.yml up -d`  | Start local infra (PG + Redis) |
| `docker compose -f docker-compose.dev.yml down`   | Stop local infra               |
| `docker compose -f docker-compose.prod.yml up -d` | Start production stack         |
