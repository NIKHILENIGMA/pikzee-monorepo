---
title: Testing & Commits Standards
description: Commit message conventions (Conventional Commits) and testing strategies for Pikzee.
---

# 📜 Testing & Commit Standards

We maintain a strict quality control pipeline utilizing conventional commits, pre-commit hooks (Husky), and testing rules.

---

## 1. Commit Message Conventions (Conventional Commits)

Commit messages must strictly follow the **Conventional Commits** specification. Our repository enforces this via `@commitlint` pre-commit hooks.

### **Commit Format:**

```
<type>(<scope>): <description>

[optional body]
```

### **Allowed Types:**

- `feat`: A new feature implementation (e.g., `feat(auth): add email verification modal`).
- `fix`: A bug fix (e.g., `fix(api): fix expired invite signature check`).
- `docs`: Documentation changes only (e.g., `docs(architecture): update data flow diagrams`).
- `style`: Code style changes (whitespace, formatting, missing semi-colons—no production logic changes).
- `refactor`: Code changes that neither fix a bug nor add a feature.
- `perf`: Performance improvement updates.
- `test`: Adding missing tests or correcting existing tests.
- `chore`: Maintenance updates, dependencies upgrade, build configuration tweaks.

---

## 2. Testing Standards

- **Unit Tests:** Every library (under `libs/*`) and service (under `apps/api` and `apps/worker`) should have matching unit tests (e.g. `workspace.service.spec.ts`) utilizing Jest or Vitest.
- **API Tests (e.g., `apps/api-e2e`):** Write End-to-End integration tests for all major endpoints to ensure route matching and database writes work together in mock environments.
- **Frontend Tests:** UI components must be tested for accessibility and rendering correctness. Use Storybook for visual checks and Vitest/Testing Library for interaction tests.
