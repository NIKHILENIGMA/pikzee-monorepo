---
title: CI/CD
description: GitHub Actions CI pipeline using Nx affected.
---

# CI/CD

## GitHub Actions

The pipeline uses **Nx affected** to only build/test what changed:

```yaml
# .github/workflows/ci.yml (planned)
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Required for Nx affected

      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4

      - run: pnpm install

      - run: pnpm nx affected -t lint,build,test --base=origin/main
```

## Nx Cloud Remote Cache

Nx Cloud remote cache is planned to share computation cache across CI runs and developer machines — reducing CI time dramatically for unchanged projects.

## Docker Build in CI

On merge to `main`:

1. Nx affected determines which apps changed
2. Only those Dockerfiles are rebuilt
3. Images are pushed to the container registry
