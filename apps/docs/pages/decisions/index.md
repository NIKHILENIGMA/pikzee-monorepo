---
title: Architecture Decisions
description: Log of all major architectural decisions made during Pikzee development.
---

# Architecture Decisions

This section logs all major architectural decisions — what options were considered, what was chosen, and why. Think of these as Architecture Decision Records (ADRs).

> The full decision log with all discussion is also maintained in `TODO.md` at the project root.

## Decision Log

| ID                                | Title                                          | Status     |
| --------------------------------- | ---------------------------------------------- | ---------- |
| [D-01](/decisions/d-01-auth)      | Auth: Custom UI with Clerk Backend             | ✅ Decided |
| [D-02](/decisions/d-02-workspace) | Workspace: Multi-workspace, Plan per Workspace | ✅ Decided |
| [D-03](/decisions/d-03-collab)    | Collab: Hocuspocus inside apps/worker (NestJS) | ✅ Decided |

## Build Order

The agreed implementation sequence:

```
1. Auth
2. Workspace
3. RBAC
4. Member Invites
5. Projects
6. Documents
7. Yjs Collaboration
8. Comments
9. AI Writing
10. YouTube OAuth
11. Scheduled Publishing
12. Worker System
```
