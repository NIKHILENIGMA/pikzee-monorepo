---
title: Real-Time Collaboration
description: How real-time collaborative editing works in Pikzee.
---

# Real-Time Collaboration

Pikzee supports live collaborative document editing and real-time presence awareness. The architecture is powered by **Yjs** and **Hocuspocus**.

## Architecture

```
Browser (Editor)
    └─ TipTap + @tiptap/extension-collaboration (Yjs provider)
           └─ WebSocket → Hocuspocus (apps/worker)
                               └─ Yjs CRDT sync between clients
                               └─ Redis pub/sub (fan-out across worker pods)
                               └─ Presence engine (cursors, avatars)
```

## Decision

Hocuspocus runs inside **apps/worker** (NestJS), not as a standalone process. See [D-03](/decisions/d-03-collab) for the rationale.

## Key Sections

- [Yjs + Hocuspocus](/collaboration/yjs-hocuspocus) — Core sync engine
- [Presence Engine](/collaboration/presence) — Cursors and awareness
- [Asset Feed](/collaboration/asset-feed) — Real-time upload events
