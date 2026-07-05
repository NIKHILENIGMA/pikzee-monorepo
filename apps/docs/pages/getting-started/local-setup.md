---
title: Local Setup
description: How to run the Pikzee monorepo locally.
---

# Local Setup

## Prerequisites

| Tool                    | Version | Install                          |
| ----------------------- | ------- | -------------------------------- |
| Node.js                 | ≥ 20.x  | [nodejs.org](https://nodejs.org) |
| pnpm                    | ≥ 9.x   | `npm install -g pnpm`            |
| Docker + Docker Compose | latest  | [docker.com](https://docker.com) |

## 1. Clone and install

```bash
git clone <repo-url> pikzee-monorepo
cd pikzee-monorepo
pnpm install
```

## 2. Set up environment variables

Copy the example env file and fill in the values:

```bash
cp .env.example .env
```

Key variables you'll need:

| Variable                            | Description                    |
| ----------------------------------- | ------------------------------ |
| `DATABASE_URL`                      | PostgreSQL connection string   |
| `REDIS_URL`                         | Redis connection string        |
| `CLERK_SECRET_KEY`                  | Clerk backend secret           |
| `CLERK_PUBLISHABLE_KEY`             | Clerk frontend publishable key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Same key for Next.js           |

## 3. Start infrastructure services

```bash
docker compose -f docker-compose.dev.yml up -d
```

This starts:

- **PostgreSQL** on port `5432`
- **Redis** on port `6379`

## 4. Run database migrations

```bash
pnpm db:migrate
```

## 5. Start the apps

In separate terminals (or use a process manager):

```bash
# Frontend
nx run web:dev

# Backend API
nx run api:serve

# Worker
nx run worker:serve

# This docs site
nx run docs:dev
```

Or run everything together:

```bash
nx run-many -t dev,serve --parallel
```
