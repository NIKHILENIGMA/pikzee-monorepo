# AI Agent Rules & Coding Standards

## 1. Agent Behavior & Communication

- **Conciseness:** Be direct. Avoid unnecessary pleasantries or overly verbose explanations unless explicitly asked.
- **Code Generation:** Only output the specific code blocks that need to be changed or created. Do not output entire files if only a few lines are modified, unless requested.
- **Clarification:** If a task is ambiguous or missing crucial details (e.g., a missing type definition or unclear business logic), STOP and ask for clarification before writing code.
- **Context Awareness:** Always check `ARCHITECTURE.md` and `REQUIREMENTS.md` before making architectural decisions.
- **No Unasked Logic Rewrites:** When tasked with refactoring or styling, do not change underlying business logic without explicit user permission.

## 2. General Coding Standards

- **Language:** Use TypeScript exclusively. Ensure `strict` mode is adhered to. Do not use `any`; use `unknown` if absolutely necessary, but prefer strict typing.
- **Formatting:** Follow the existing Prettier and ESLint configurations in the repository.
- **Naming Conventions:**
  - Variables/Functions: `camelCase`
  - React Components: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Files/Directories (Frontend): `kebab-case` (except for specific Next.js/NestJS conventions).
- **Imports:** Use absolute imports (e.g., `@/features/...` or `@workspace/...`) as defined in `tsconfig.json`.
- **No Secret Leaks:** Never hardcode API keys, JWT secrets, or DB credentials. Always reference `process.env`.

## 3. Tech-Stack Specific Rules

### 3.1 Nx Monorepo

- Respect dependency boundaries. Apps (`apps/`) can import from libraries (`libs/`), but libraries should not import from apps.
- When creating new modules, utilize Nx generators (e.g., `nx g @nx/react:component`) whenever possible to ensure correct configuration.

### 3.2 Next.js & React (Frontend)

- **App Router:** Default to the App Router (`app/` directory).
- **Server Components:** Default to React Server Components (RSC). Only add the `'use client'` directive when strictly necessary (e.g., using state, effects, or DOM event listeners).
- **Architecture:** Strictly adhere to the Feature-Sliced structure defined in `ARCHITECTURE.md`. Keep components small and pure where possible. All business logic, state management, and JS-related operations must be extracted and encapsulated inside the `hooks/` folder of the respective feature.
- **No Class Components:** Never write React Class components; use Functional Components with Hooks exclusively.
- **Strong Typing:** Always add proper TypeScript types/interfaces to component props and explicitly type return values for functions and hooks.

### 3.3 NestJS (Backend API)

- Follow standard NestJS modular architecture (`Module`, `Controller`, `Service`).
- Keep controllers thin (only handling HTTP routing and validation). Move all business logic to services.
- Use standard NestJS decorators and pipes for validation and serialization.
- Since we are using ZOD for body validation.
- Always send a standard api response e.g.
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Request processed successfully",
    "data": {
      "id": "usr_94821",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "role": "admin"
    },
    "timestamp": "2026-07-28T11:08:42.125Z"
  }
  ```
- Use a proper logging according to standard nestjs logging works.
- Security checks to be clear what server has to deal and what has to avoid.

### 3.4 Drizzle ORM & Database

- Always define schemas clearly in the central database library.
- Never write raw SQL unless Drizzle does not support the required query complexity (which is rare).
- Ensure all database mutations are wrapped in transactions if they modify multiple tables.

## 4. Git & Commits (If agent is managing version control)

- Use Conventional Commits format: `type(scope): subject`
  - Examples: `feat(auth): implement Clerk login`, `fix(api): resolve points calculation bug`, `chore(deps): update nx`.
- Keep commits focused on a single logical change.

## 5. Human-AI Pairing Protocol

- **Boilerplate & Scaffolding:** `agy` is responsible for generating CRUD boilerplate, TypeScript interfaces, DTOs, and test scaffolding.
- **Core Logic Implementation:** When instructed with "Test-Driven Pairing," `agy` MUST write the unit tests and leave the implementation function bodies empty (or as TODOs) for the Human developer to code manually.
- **Code Review:** Before applying diffs, ensure code adheres to DRY (Don't Repeat Yourself) and SOLID principles.
