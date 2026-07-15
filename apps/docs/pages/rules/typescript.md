---
title: TypeScript Style Guide
description: TypeScript conventions, styling standards, and lint rules for Pikzee.
---

# 📜 TypeScript Style Guide

To maintain high code legibility, all developers (and AI agents) must strictly follow these coding conventions when contributing to the Pikzee codebase.

---

## 1. Naming Conventions

- **Files:** Use `kebab-case` for all filenames (e.g., `workspace-switcher.tsx`, `auth.module.ts`).
- **React Components:** Use `PascalCase` for component declarations and filenames where applicable (e.g., `Button.tsx`).
- **Variables, Functions & Fields:** Use `camelCase` (e.g., `const workspaceId = '...'`).
- **Classes & Types:** Use `PascalCase` (e.g., `class CustomException extends Error`, `type UserSession = { ... }`).
- **Enums:** Use `UPPERCASE_SNAKE_CASE` for both enum names and member fields.
- **Database Columns:** Use `snake_case` in DB schemas (e.g., `workspace_id`, `created_at`).

---

## 2. Type System Guidelines

- **Avoid `any`:** Always define explicit interfaces, types, or DTO types. The use of `any` is strictly prohibited and will fail static lint checks.
- **Prefer `unknown` over `any`:** If a type is truly dynamic, type it as `unknown` and use type guards or Zod parsing to validate at runtime.
- **Use `type` for Data Contracts, `interface` for Extensible Objects:**
  - Use `type` for simple data containers, objects, unions, and aliases.
  - Use `interface` for classes, extensible objects, and object-oriented contracts.
- **Strict Null Checks:** Always initialize variables and explicitly type nullable states as `type | null`.

---

## 3. NestJS Code Conventions

- **Explicit Return Types:** Always define the return types for services, handlers, and controllers:
  ```typescript
  @Get(':id')
  async getWorkspace(@Param('id') id: string): Promise<WorkspaceDto> {
    return this.workspaceService.findOne(id);
  }
  ```
- **Zod DTOs:** All request request payloads must be typed and validated using `nestjs-zod` derived classes, never raw typescript objects.
- **Dependency Injection:** Always use constructor parameter property shorthand for DI:
  ```typescript
  constructor(private readonly workspaceService: WorkspaceService) {}
  ```
