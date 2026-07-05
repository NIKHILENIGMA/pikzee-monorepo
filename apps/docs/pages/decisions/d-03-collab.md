---
title: D-03 · Collab Architecture
description: Hocuspocus inside apps/worker (NestJS) — decision record.
---

# D-03 · Real-Time Collab: Hocuspocus inside apps/worker

**Status:** ✅ Decided

## Options Considered

### Option A — Standalone Hocuspocus process

❌ **Rejected.** Third process to deploy separately. No NestJS DI. Separate Dockerfile. Operational overhead.

### Option B — NestJS WS Gateway inside apps/api

❌ **Rejected.** Pollutes stateless HTTP API with stateful WebSocket connections. Forces sticky sessions on the load balancer.

### Option C — Hocuspocus inside apps/worker ✅ Chosen

✅ **Chosen.**

- Hocuspocus runs as a NestJS WebSocket gateway inside `apps/worker`
- Workers are already stateful (BullMQ consumers) — WS fits naturally
- Gets full NestJS DI (database, redis services, etc.)
- Single Dockerfile for the worker
- Keeps `apps/api` stateless and horizontally scalable

## Conclusion

Hocuspocus lives inside `apps/worker` as a NestJS WebSocket gateway. This keeps `apps/api` stateless, avoids a third deployment unit, and benefits from NestJS DI and the existing worker infrastructure.
