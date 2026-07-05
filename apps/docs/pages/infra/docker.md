---
title: Docker
description: Docker Compose setup for local development and production.
---

# Docker

## Files

| File                      | Purpose                       |
| ------------------------- | ----------------------------- |
| `docker-compose.yml`      | Full production stack         |
| `docker-compose.dev.yml`  | Local infra only (PG + Redis) |
| `docker-compose.prod.yml` | Production overrides          |

## Local Development

Only start the infrastructure services — run apps directly with Node:

```bash
docker compose -f docker-compose.dev.yml up -d
```

## Production

All apps are containerized with individual Dockerfiles:

```
apps/web/Dockerfile
apps/api/Dockerfile
apps/worker/Dockerfile
```

Three images are built: `web`, `api`, `worker`. Nginx routes between them.

## Building Images

```bash
docker build -f apps/web/Dockerfile -t pikzee-web .
docker build -f apps/api/Dockerfile -t pikzee-api .
```
