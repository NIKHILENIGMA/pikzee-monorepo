# Pikzee

Monorepo for the Pikzee project. This repository contains the backend API and public Next.js frontend. It uses Nx for monorepo tooling and pnpm as the package manager.

## Contents

- `apps/api/` — NestJS backend (API server)
- `apps/web/` — Next.js public website

## Key technologies

- Node.js + TypeScript
- NestJS for the API
- Next.js for frontends
- Nx for monorepo tooling
- pnpm for package management
- TailwindCSS, PostCSS for styling

## Quickstart

Prerequisites:

- Node.js (recommend v18+)
- pnpm (v7+)

Steps:

1. Clone the repository

```bash
git clone <repo-url>
cd pikzee-monorepo
```

2. Install dependencies

```bash
pnpm install
```

3. Start services for development (examples using Nx)

```bash
# Run the API
pnpm nx serve api

# Run the public website
pnpm nx serve web
```

If you prefer, you can use `npx nx <command>` instead of `pnpm nx <command>`.

## Build

Build a specific app:

```bash
pnpm nx build api
pnpm nx build web
```

## Testing

Run tests (per-app):

```bash
pnpm nx test api
pnpm nx test web
```

## Environment variables

Each app may require environment variables. Look for `.env.example` or app-specific README files inside `apps/<app>/`. Create `.env` or `.env.local` as required before running.

## Development notes

- The monorepo uses Nx; use `pnpm nx` (or `npx nx`) to run, build, test, and lint targets.
- Linting and formatting are configured at the workspace level.
- Keep shared code in `libs/` if/when you add it to the repository.

## Contributing

- Use feature branches named `feat/<short-description>` or `fix/<short-description>`.
- Open pull requests against `main` and include a short description of the changes and testing steps.
- Run linters and tests locally before opening a PR:

```bash
pnpm nx lint
pnpm nx test
```

## License

This project is licensed under the MIT License. See `package.json` for details.

## Contact / Maintainers

If you join the project, please add yourself to the maintainers section here with an email or GitHub handle.

---

Notes: adjust the commands above if your local setup uses a different node version manager or if you prefer Docker-based development. See each app's `README.md` (if present) for app-specific setup.
