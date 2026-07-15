---
title: AI Handoff Memory
description: Context memory for AI coding agents to resume work.
---

# 🤖 AI Assistant Context Handoff

This file acts as the project's memory bank for AI agents (like Antigravity). It summarizes current progress, active engineering discussions, and the immediate next steps to prevent context loss.

---

## 1. Project Context & Current State

- **Current Date:** July 15, 2026
- **Active Stage:** Restructuring documentation, preparing to build Workspace Invitations, S3 Assets Upload, and TipTap collaborative editing.
- **Documentation Refactoring:**
  - We have reorganized the documentation into clean categories: Product (PRD), Architecture & Decisions, Rules, Feature Guides, Roadmap (Phases), Design System, Developer Guides, and AI Handoff.
  - The project [todolist.md](file:///home/nikhilenigma/home/projects/pikzee-monorepo/apps/docs/pages/getting-started/todolist.md) has been fully updated to categorize Completed vs. Outstanding tasks across Features 1 through 9.

---

## 2. Active Technical Designs & Decisions

### **A. Real-Time Collaboration & Persistence (Feature 6)**

- **Sync Server:** Hocuspocus gateway runs as a NestJS WebSocket Gateway in `apps/worker` on port `3003` to keep `apps/api` stateless.
- **Database Schema:** Documents table needs three fields:
  - `yjs_state` (`BYTEA`): Holds Yjs CRDT binary updates for delta syncs.
  - `content_json` (`JSONB`): Holds debounced (3s idle) structured TipTap JSON trees for page load.
  - `content_text` (`TEXT`): Holds raw plain text for full-text search indexing.

### **B. S3 Pre-signed Uploads (Feature 5)**

- **Core Flow:** Frontend requests upload URLs from API. Large files use multipart S3 API and upload chunked parts directly to S3.
- **Finalization Hook:** After direct-to-S3 uploads, the frontend hits `POST /assets/upload/complete` to let NestJS merge multipart chunks and insert the asset record into PostgreSQL.

### **C. Social Platform Connections & Publishing (Feature 7)**

- **Strategy Pattern:** NestJS `PublishingModule` uses platform strategies (`YoutubeStrategy`, `LinkedinStrategy`, `TwitterStrategy`) to handle OAuth callbacks and token refreshes.
- **OAuth Quirks:**
  - YouTube/Google: Requires offline parameters (`access_type=offline`, `prompt=consent`) to get refresh tokens.
  - Twitter/X: Requires OAuth 2.0 PKCE with verification challenges stored temporarily in Redis.

---

## 3. Next Tasks (Where to pick up)

1.  **Update `zudoku.config.ts`:** Finalize the navigation sitemap mapping to support the new documentation paths.
2.  **Write the Architecture Guides:** Write base files for `architecture/monorepo-layout.md`, `architecture/data-flow.md`, and `architecture/design-patterns.md`.
3.  **Write Coding Standards (`rules/`):** Generate the conventions files to keep code quality high.
4.  **Implement `@pikzee/assets` and `@pikzee/documents` boilerplate:** Initialize the new monorepo libraries using Nx commands.
