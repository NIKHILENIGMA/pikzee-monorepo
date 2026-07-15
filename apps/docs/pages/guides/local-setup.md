---
title: Local Setup & Running
description: Detailed developer guide for cloning, installing, and running the Pikzee monorepo locally.
---

# 📖 Local Setup & Running Guide

This guide walks you through setting up your local environment, initializing the infrastructure, running migrations, and launching applications in the Pikzee monorepo.

---

## 1. Prerequisites

Ensure you have the following installed on your machine before starting:

| Tool                 | Required Version | Purpose                                       |
| :------------------- | :--------------- | :-------------------------------------------- |
| **Node.js**          | $\ge$ 20.x       | Javascript runtime environment                |
| **pnpm**             | $\ge$ 9.x        | Monorepo package management                   |
| **Docker & Compose** | latest           | Local database (PostgreSQL) and cache (Redis) |

---

## 2. Installation

Clone the repository and install all dependencies:

```bash
git clone <repo-url> pikzee-monorepo
cd pikzee-monorepo
pnpm install
```

---

## 3. Environment Variable Setup

Copy the example environment file from the root directory:

```bash
cp .env.example .env
```

Open `.env` and configure the following core credentials:

| Variable                | Description                       | Default Dev Value                                      |
| :---------------------- | :-------------------------------- | :----------------------------------------------------- |
| `DATABASE_URL`          | PostgreSQL connection string      | `postgresql://postgres:postgres@localhost:5432/pikzee` |
| `REDIS_URL`             | Redis connection URL              | `redis://localhost:6379`                               |
| `CLERK_SECRET_KEY`      | Clerk Authentication backend key  | _Get from Clerk dashboard_                             |
| `CLERK_PUBLISHABLE_KEY` | Clerk Authentication frontend key | _Get from Clerk dashboard_                             |

---

## 4. Run Local Infrastructure

Start the Dockerized services (PostgreSQL and Redis) in background mode:

```bash
docker compose -f docker-compose.dev.yml up -d
```

To shut down local services:

```bash
docker compose -f docker-compose.dev.yml down
```

---

## 5. Database Initialization (Migrations)

Apply database schemas and migrations to the running PostgreSQL database via Drizzle ORM:

```bash
pnpm db:migrate
```

To inspect your database records visually using Drizzle Studio:

```bash
pnpm db:studio
```

---

## 6. Project Running Commands

You can run individual applications using Nx targets:

| Application                       | Command               | Access Port                                    |
| :-------------------------------- | :-------------------- | :--------------------------------------------- |
| **Next.js Web (Frontend)**        | `nx run web:dev`      | [http://localhost:3000](http://localhost:3000) |
| **NestJS API (Backend)**          | `nx run api:serve`    | [http://localhost:3001](http://localhost:3001) |
| **NestJS Worker (BullMQ/Collab)** | `nx run worker:serve` | Internal port `3002`/`3003`                    |
| **Documentation Portal (Docs)**   | `nx run docs:dev`     | [http://localhost:4200](http://localhost:4200) |

To run **all applications concurrently** in parallel mode:

```bash
nx run-many -t dev,serve --parallel
```
