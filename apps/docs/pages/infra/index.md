---
title: Infrastructure Overview
description: Infrastructure components powering the Pikzee platform.
---

# Infrastructure

## Components

| Component     | Technology    | Purpose                                  |
| ------------- | ------------- | ---------------------------------------- |
| Database      | PostgreSQL 16 | Primary relational data store            |
| Cache & Queue | Redis 7       | Cache, BullMQ backing store, pub/sub     |
| Storage       | S3 / ImageKit | Asset storage and CDN delivery           |
| Auth          | Clerk         | Authentication, RBAC, session management |
| Reverse Proxy | Nginx         | Routes traffic to web, api, worker       |

## Docker Services

```yaml
# docker-compose.dev.yml — local development
services:
  postgres:
    image: postgres:16-alpine
    ports: ['5432:5432']

  redis:
    image: redis:7-alpine
    ports: ['6379:6379']
```

## Network Architecture

```
Internet
  └─ Nginx (reverse proxy)
        ├─ /           → apps/web  (Next.js)
        ├─ /api        → apps/api  (NestJS HTTP)
        ├─ /ws         → apps/worker (Hocuspocus WebSocket)
        └─ /docs       → apps/docs (Zudoku)
```

## Key Sections

- [Docker Setup](/infra/docker)
- [Redis Usage](/infra/redis)
- [Database](/infra/database)
- [CI/CD](/infra/ci)
