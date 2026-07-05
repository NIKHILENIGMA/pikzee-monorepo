---
title: Yjs + Hocuspocus
description: The core real-time document sync engine.
---

# Yjs + Hocuspocus

## Yjs CRDT

**Yjs** is a Conflict-free Replicated Data Type (CRDT) library. It allows multiple clients to edit the same document simultaneously and automatically merge changes without conflicts — even if clients go offline.

## Hocuspocus

**Hocuspocus** is a WebSocket server for Yjs. It acts as the central sync point for document state:

- Clients connect via WebSocket
- Hocuspocus receives Yjs updates and broadcasts to all connected clients
- Document state is persisted to PostgreSQL on changes

## Integration in apps/worker

```ts
// apps/worker/src/collab/collab.gateway.ts
@WebSocketGateway({ path: '/collab' })
export class CollabGateway {
  private hocuspocus = new Hocuspocus({
    port: 1234,
    async onLoadDocument({ document, documentName }) {
      // Load from PostgreSQL
      const content = await documentsService.getYjsContent(documentName)
      if (content) Y.applyUpdate(document, content)
    },
    async onChange({ document, documentName }) {
      // Persist to PostgreSQL
      const update = Y.encodeStateAsUpdate(document)
      await documentsService.saveYjsContent(documentName, update)
    },
  })
}
```
