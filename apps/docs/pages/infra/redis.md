---
title: Redis
description: How Redis is used for caching, queuing, and pub/sub.
---

# Redis

Redis is used for **three distinct purposes** in Pikzee:

## 1. Application Cache

Frequently read data (workspace metadata, user profiles) is cached to reduce database load.

## 2. BullMQ — Job Queue

Background jobs are queued in `apps/api` and consumed in `apps/worker`:

```
apps/api  →  BullMQ Queue (Redis)  →  apps/worker
   ↑                                        ↓
  Dispatch jobs                      Process jobs
  (publishing, media processing)
```

Job types:

- `publish-to-youtube`
- `publish-to-twitter`
- `publish-to-linkedin`
- `process-media`

## 3. Pub/Sub — Real-Time Fan-out

For real-time collaboration, Redis pub/sub fans out workspace events across multiple API pod instances:

```
Hocuspocus (worker) → Redis pub/sub → All API pods → WebSocket clients
```

This ensures horizontal scalability without sticky sessions.
