---
title: Frontend Overview
description: apps/web — Next.js 15 App Router frontend.
---

# Frontend — apps/web

The Pikzee frontend is a **Next.js 15** application using the **App Router**.

## Tech Stack

| Layer         | Technology                                                    |
| ------------- | ------------------------------------------------------------- |
| Framework     | Next.js 15 (App Router)                                       |
| Language      | TypeScript                                                    |
| Styling       | Tailwind CSS v4                                               |
| UI Components | shadcn/ui (via `libs/shared/ui`)                              |
| Auth          | Clerk (fully custom UI — no Clerk-branded components visible) |
| Forms         | React Hook Form + Zod                                         |
| HTTP Client   | Axios                                                         |

## Directory Structure

```
apps/web/src/
├── app/                    # App Router pages and layouts
│   ├── (auth)/             # Auth group — sign-in, sign-up
│   ├── (dashboard)/        # Protected workspace routes
│   └── layout.tsx          # Root layout
├── components/             # App-specific components
├── lib/                    # Client-side utilities
└── styles/                 # Global CSS
```

## Key Sections

- [Authentication](/frontend/authentication) — Implementation details, custom routing, and component architecture for authentication.
