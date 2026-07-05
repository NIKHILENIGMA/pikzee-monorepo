---
title: Pikzee Developer Portal
description: Welcome to the Pikzee internal developer portal.
---

# 📓 Pikzee Developer Portal

Welcome to the internal engineering documentation and API reference hub for the Pikzee monorepo. This portal contains all architecture logs, package details, system configurations, and daily logs.

---

## 🧭 Navigation

Select a section below to get started:

### 🚀 [Getting Started](/getting-started)

Monorepo prerequisite checklist, local setup guides, pnpm/Nx commands, and directory layouts.

### 🖥️ [Frontend Application](/frontend)

Documentation for `apps/web` including App Router structure, custom Clerk authentication flows, and component conventions.

### ⚙️ [Backend API](/backend)

Documentation for `apps/api` including NestJS module structures, Clerk authentication guards, and Drizzle database patterns.

### 🏗️ [Infrastructure](/infra)

Docker configurations, local services, Redis usage (for cache, queues, and pub/sub), and CI/CD workflows.

### 📦 [Shared Packages](/packages)

Overview of shared monorepo packages (`libs/*`) for types, components, validation schemas, and utilities.

### 🤝 [Collaboration](/collaboration)

Real-time sync mechanics using Yjs, Hocuspocus gateway inside the NestJS worker, and user presence/cursor awareness.

### 📋 [Decisions Log](/decisions)

Architecture Decision Records (ADRs) tracking design options considered, chosen solutions, and reasons.

### 📓 [Daily Dev Log](/devlog)

Historical entries tracking daily updates, progress, issues, and next steps.

---

## 🛠️ Quick Commands

```bash
# Start all developer services
docker compose -f docker-compose.dev.yml up -d

# Start the full workspace concurrently
nx run-many -t dev,serve --parallel
```
