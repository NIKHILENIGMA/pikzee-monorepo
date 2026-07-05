---
title: Presence Engine
description: Live cursors, avatars, and user awareness.
---

# Presence Engine

## What is Presence?

Presence shows who is currently viewing or editing a document:

- **Live cursors** — other users' cursor positions in the editor
- **User avatars** — avatars in the toolbar showing active collaborators
- **Activity state** — typing indicators, idle status

## Implementation

Presence uses **Yjs Awareness** — a lightweight mechanism separate from document state:

```ts
// In the editor (apps/web)
import { WebsocketProvider } from 'y-websocket'

const provider = new WebsocketProvider(COLLAB_URL, documentId, ydoc)

// Set local user awareness
provider.awareness.setLocalStateField('user', {
  id: userId,
  name: userName,
  color: userColor,
  cursor: null, // Updated on cursor move
})

// Subscribe to other users' awareness
provider.awareness.on('change', () => {
  const states = Array.from(provider.awareness.getStates().values())
  // Render other users' cursors
})
```

## Scaling with Redis

When multiple `apps/worker` pods are running, awareness events are fanned out via **Redis pub/sub** so clients connected to different pods still see each other.
