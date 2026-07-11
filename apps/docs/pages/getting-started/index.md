---
title: Getting Started
description: Welcome to the Pikzee internal developer portal.
---

# Welcome to the Pikzee Developer Portal

This is the **internal documentation hub** for the Pikzee monorepo. If you're a developer picking up this project for the first time — or returning after a break — start here.

## What is Pikzee?

Pikzee is an AI-powered content creation and scheduling platform. It allows creators and teams to write, collaborate on, and publish content across social platforms — with AI assistance throughout the workflow.

## Monorepo Overview

```
pikzee-monorepo/
├── apps/
│   ├── web/        # Next.js 15 frontend (App Router)
│   ├── api/        # NestJS HTTP + WebSocket backend
│   ├── worker/     # NestJS BullMQ background jobs
│   └── docs/       # This documentation site (Zudoku)
├── libs/
│   ├── shared/
│   │   ├── types/  # DTOs, enums, cross-app TypeScript contracts
│   │   ├── ui/     # Shared shadcn/ui components
│   │   ├── utils/  # Shared helpers and validators
│   │   └── config/ # Zod env validation schemas
│   ├── assets/     # Upload + transformation flows
│   ├── documents/  # Editor and draft workflows
│   ├── collab/     # Presence, cursors, collaborative editing
│   ├── publishing/ # Social platform publishing jobs
│   └── workspace/  # Workspace membership, roles, RBAC
```

## Where to go next

| I want to...                               | Go to                                                   |
| ------------------------------------------ | ------------------------------------------------------- |
| View features / implementation TODOs       | [Feature To-Do List](/getting-started/todolist)         |
| Understand the user signup/onboarding flow | [Flow](/getting-started/flow)                           |
| Set up the project locally                 | [Local Setup](/getting-started/local-setup)             |
| See all CLI commands                       | [Commands](/getting-started/commands)                   |
| Understand the app structure               | [Project Structure](/getting-started/project-structure) |
| Work on the frontend                       | [Frontend Docs](/frontend)                              |
| Work on the backend API                    | [Backend Docs](/backend)                                |
| Understand infra & deployment              | [Infrastructure](/infra)                                |
| Check past architectural decisions         | [Decisions](/decisions)                                 |
| See recent progress                        | [Dev Log](/devlog)                                      |
