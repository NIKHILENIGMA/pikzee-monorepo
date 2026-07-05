---
title: Asset Feed
description: Real-time asset upload events broadcast to workspace members.
---

# Asset Feed

## Purpose

When a workspace member uploads an asset, all other members currently in the workspace should see it appear in real-time — without refreshing.

## Architecture

```
User uploads asset
    └─ apps/api receives upload → saves to DB → publishes event to Redis
             └─ Redis pub/sub → apps/worker receives event
                      └─ Broadcasts to all workspace WebSocket clients
                               └─ Browser updates asset panel
```

## Event Shape

```ts
interface AssetUploadedEvent {
  type: 'asset.uploaded'
  workspaceId: string
  asset: {
    id: string
    url: string
    name: string
    mimeType: string
    size: number
    uploadedBy: string
    uploadedAt: string
  }
}
```
