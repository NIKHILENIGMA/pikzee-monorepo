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

- **Refer to [FRONTEND_RULES.md](./FRONTEND_RULES.md)** for comprehensive architectural, performance, and state management standards related to the Next.js frontend.

### 3.3 NestJS (Backend API)

- **Refer to [BACKEND_RULES.md](./BACKEND_RULES.md)** for comprehensive architectural, security, and scalability standards related to the NestJS backend.

### 3.4 Drizzle ORM & Database

- Always define schemas clearly in the central database library.
- Never write raw SQL unless Drizzle does not support the required query complexity (which is rare).
- Ensure all database mutations are wrapped in transactions if they modify multiple tables.

### 3.5 Security

- **Refer to [SECURITY_RULES.md](./SECURITY_RULES.md)** for comprehensive security, authentication, and vulnerability prevention standards.

## 4. Git & Commits (If agent is managing version control)

- Use Conventional Commits format: `type(scope): subject`
  - Examples: `feat(auth): implement Clerk login`, `fix(api): resolve points calculation bug`, `chore(deps): update nx`.
- Keep commits focused on a single logical change.

## 5. Human-AI Pairing Protocol

- **Boilerplate & Scaffolding:** `agy` is responsible for generating CRUD boilerplate, TypeScript interfaces, DTOs, and test scaffolding.
- **Core Logic Implementation:** When instructed with "Test-Driven Pairing," `agy` MUST write the unit tests and leave the implementation function bodies empty (or as TODOs) for the Human developer to code manually.
- **Code Review:** Before applying diffs, ensure code adheres to DRY (Don't Repeat Yourself) and SOLID principles.
