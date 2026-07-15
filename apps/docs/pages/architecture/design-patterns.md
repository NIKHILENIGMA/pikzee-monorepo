---
title: Design Patterns & Architectural Rules
description: Core software engineering design patterns used in the Pikzee monorepo.
---

# 🎨 Design Patterns & Architectural Rules

To ensure code maintainability and scalability, the Pikzee codebase strictly adheres to specific architectural patterns.

---

## 1. The Strategy Pattern (Social Platform Publishing)

In the social platform integrations (YouTube, LinkedIn, Twitter/X), we use the **Strategy Pattern**. Instead of writing complex conditional blocks inside controllers (e.g., `if (platform === 'youtube')`), we abstract publishing behaviors.

### **Structure:**

- **Context:** `PublishingService` handles database tracking, loading credentials, and queue scheduling.
- **Strategy Interface:** `SocialPlatformStrategy` defines standard operations: `getAuthUrl`, `exchangeCode`, `refreshTokens`, and `publish`.
- **Concrete Strategies:** `YoutubeStrategy`, `LinkedinStrategy`, and `TwitterStrategy` implement the API calls specific to each platform.

This makes adding a new platform (e.g., Instagram or Pinterest) as simple as writing a new strategy file and registering it in the NestJS module provider.

---

## 2. NestJS Architecture (Service-Repository-Controller)

Backend modules inside `apps/api` and `apps/worker` follow the clean separation of concerns:

```
Controller (HTTP Route / WS Gateway)
    ↓
Service (Business Logic / Orchestration)
    ↓
Drizzle Database Client (Data Access / Repository)
```

- **Controllers:** Responsible only for routing, request validation, and HTTP responses.
- **Services:** Holds core business rules, validation logic, external service calls, and transaction boundaries.
- **Drizzle Models/Queries:** We avoid writing queries directly inside controllers. Database access is centralized inside specific services.

---

## 3. Frontend Architecture (Features-Based Structure)

The Next.js client (`apps/web`) is structured around **features** rather than a flat `/components` directory. This keeps domain code isolated.

### **Folder Anatomy of a Feature:**

```
src/features/workspace/
├── components/          # UI elements specific only to workspace
│   ├── workspace-switcher.tsx
│   └── workspace-settings.tsx
├── hooks/               # Custom React hooks (state/mutations)
│   └── use-workspace.ts
├── services/            # API call definitions
│   ├── workspace-client.ts   # For client-side requests
│   └── workspace-server.ts   # For server-side Next.js fetches
└── index.ts             # Clean public interface export
```

- **Rule:** Components from one feature cannot deep-import files from another feature's internal directories. They must import via the feature's public API `index.ts`.
