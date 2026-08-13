---
title: Workspace
description: Workspace implementation details
---

# Workspace

### F-02 · Workspace `[DISCUSSED]`

#### Decisions Made

| #          | Decision                 | Choice                                                           |
| ---------- | ------------------------ | ---------------------------------------------------------------- |
| Slug       | Immutable after creation | ✅ Immutable — changing breaks all URLs/bookmarks                |
| Onboarding | 1-step or wizard         | ✅ Multi-step wizard (professional feel)                         |
| Deletion   | Hard or soft             | ✅ Soft delete — status=`archived`, data preserved               |
| Logo       | Skip or collect          | ✅ Collect during onboarding — `logo_url` stored as string in DB |

> **Logo upload note:** Full asset system (F-07) isn't built during F-02.
> Onboarding uses a lightweight `POST /workspaces/upload-logo` endpoint (multipart)
> that uploads directly to S3/ImageKit and returns a URL. Unified with asset system later.

---

#### 1. Setup

**Packages to install:**

```bash
# apps/api
pnpm add slugify
pnpm add @aws-sdk/client-s3    ← logo upload only, no full asset system yet
```

**Environment variables (additions):**

```env
# apps/api/.env
S3_BUCKET_NAME=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_PUBLIC_URL=                 ← CDN/public base URL for uploaded files
```

**Complete folder structure — `apps/web` (Next.js):**

```
apps/web/src/
│
├── app/(app)/
│   ├── onboarding/
│   │   └── page.tsx                     ← multi-step wizard host page
│   │
│   └── [workspaceSlug]/
│       ├── layout.tsx                   ← fetches workspace, validates membership + status
│       ├── dashboard/
│       │   └── page.tsx                 ← workspace overview (stats, recent docs, activity)
│       └── settings/
│           └── general/
│               └── page.tsx             ← rename workspace, replace logo
│
└── components/
    ├── workspace/
    │   ├── WorkspaceContext.tsx          ← React context — current workspace data
    │   ├── WorkspaceProvider.tsx         ← wraps [workspaceSlug]/layout, fetches + provides
    │   ├── WorkspaceSwitcher.tsx         ← sidebar dropdown: owned + joined workspaces
    │   ├── WorkspaceAvatar.tsx           ← logo img OR initials fallback (auto color)
    │   └── WorkspaceSuspendedScreen.tsx  ← full-page block when status=suspended
    │
    └── onboarding/
        ├── OnboardingWizard.tsx          ← step controller (tracks current step + collected data)
        ├── OnboardingProgress.tsx        ← step indicator dots / progress bar
        └── steps/
            ├── StepWorkspaceName.tsx     ← Step 1: name input + live slug preview
            ├── StepWorkspaceLogo.tsx     ← Step 2: drag-drop logo upload or skip
            └── StepComplete.tsx          ← Step 3: success screen + "Go to Dashboard" CTA
```

**Complete folder structure — `apps/api` (NestJS):**

```
apps/api/src/
│
└── workspaces/
    ├── workspaces.module.ts
    ├── workspaces.controller.ts
    │   ├── POST   /workspaces                  ← create workspace
    │   ├── POST   /workspaces/upload-logo       ← multipart logo → S3 → returns URL
    │   ├── GET    /workspaces/mine              ← all workspaces for current user
    │   ├── GET    /workspaces/by-slug/:slug     ← load by slug (context fetch on every page)
    │   ├── PATCH  /workspaces/:id               ← update name / logo_url (slug immutable)
    │   └── DELETE /workspaces/:id               ← soft delete → status=archived
    ├── workspaces.service.ts
    │   ├── create()           ← slugify + uniqueness check + ownership limit + atomic insert
    │   ├── uploadLogo()       ← multipart → S3 → return CDN URL
    │   ├── findAllForUser()   ← owned + member workspaces ordered (owned first)
    │   ├── findBySlug()       ← slug lookup + membership validation
    │   ├── update()           ← update name/logo only (slug field never touched)
    │   └── archive()          ← status=archived + notify members via Novu (worker job)
    └── dto/
        ├── create-workspace.dto.ts    ← { name: string; logo_url?: string }
        └── update-workspace.dto.ts    ← { name?: string; logo_url?: string }
```

**`libs/database/src/schema/` (additions):**

```
libs/database/src/schema/
├── index.ts                  ← add workspaces export here
├── users.schema.ts            ← (existing)
└── workspaces.schema.ts       ← NEW
```

**`libs/shared/types/src/` (additions):**

```
libs/shared/types/src/
├── index.ts
├── user.types.ts              ← (existing)
└── workspace.types.ts         ← NEW — WorkspaceDto, WorkspacePlan, WorkspaceStatus enums
```

---

#### 2. Schema

```sql
-- libs/database/src/schema/workspaces.schema.ts (Drizzle)
workspaces (
  id          UUID         PRIMARY KEY  DEFAULT gen_random_uuid()
  name        VARCHAR(100) NOT NULL
  slug        VARCHAR(100) NOT NULL UNIQUE          -- immutable after creation, DB-level enforced
  logo_url    TEXT         NULLABLE                 -- S3/CDN URL or null → show initials avatar
  plan        ENUM         'free'|'plus'|'pro'      DEFAULT 'free'
  status      ENUM         'active'|'suspended'|'archived'  DEFAULT 'active'
  owner_id    UUID         NOT NULL REFERENCES users(id)
  created_at  TIMESTAMP    NOT NULL  DEFAULT now()
  updated_at  TIMESTAMP    NOT NULL  DEFAULT now()
)

CREATE UNIQUE INDEX idx_workspaces_slug  ON workspaces(slug);    -- fast slug lookup
CREATE INDEX        idx_workspaces_owner ON workspaces(owner_id); -- ownership queries
```

**Design decisions:**

- `slug` unique constraint at DB level — collision-safe even under concurrent requests
- `owner_id` denormalized — fast ownership check without joining `workspace_members`
- `logo_url = null` → render `<WorkspaceAvatar />` with initials + auto-generated color (never broken img)
- `status` drives ALL access control — `[workspaceSlug]/layout.tsx` checks it on every load

---

#### 3. Business Logic

**A. Onboarding Wizard (3 steps):**

```
Step 1 — Workspace Name
  ├── Text input for workspace name
  ├── Live slug preview below: "app.pikzee.com/acme-agency" (debounced 300ms)
  └── Validation: 3–100 chars, alphanumeric + spaces only

Step 2 — Workspace Logo
  ├── Drag-drop or click-to-upload image (PNG, JPG, SVG — max 2MB)
  ├── Client-side preview via FileReader (instant, before upload)
  ├── On "Next" → POST /workspaces/upload-logo (multipart)
  │            → API uploads to S3 → returns { logo_url }
  └── "Skip for now" → logo_url stays null → initials shown everywhere

Step 3 — Complete
  ├── Summary card: workspace avatar + name + slug
  ├── "Go to Dashboard" → POST /workspaces { name, logo_url }
  │   → API: slugify(name) → check uniqueness → check ownership limit
  │   → Atomic: INSERT workspaces + INSERT workspace_members { role: 'OWNER' }
  │   → Returns { workspace }
  └── router.push('/:workspaceSlug/dashboard')
```

**B. Workspace Context Load (every protected page):**

```
[workspaceSlug]/layout.tsx (server component — runs on every navigation)
  → GET /workspaces/by-slug/:slug
  → 404 → redirect to /
  → 403 → redirect to /   (user not a member)
  → status = 'suspended'  → render <WorkspaceSuspendedScreen />  (with upgrade CTA)
  → status = 'archived'   → redirect to /
  → ok → pass workspace as prop to <WorkspaceProvider />
  → <WorkspaceProvider /> puts workspace in React Context
  → All child pages read via useWorkspace() hook (zero refetch)
```

**C. Slug Generation:**

```
slugify("Acme Agency!") → "acme-agency"
SELECT id FROM workspaces WHERE slug = 'acme-agency'
  → not found → ✅ use "acme-agency"
  → found     → try "acme-agency-1" → ... until unique
```

**D. Workspace Switcher:**

```
GET /workspaces/mine
  SELECT w.* FROM workspaces w
  INNER JOIN workspace_members wm ON wm.workspace_id = w.id
  WHERE wm.user_id = :userId AND w.status = 'active'
  ORDER BY (wm.role = 'OWNER') DESC, w.created_at ASC
  → owned workspaces appear first, then joined workspaces
```

**E. Soft Delete (archive):**

```
DELETE /workspaces/:id  (OWNER only)
  → UPDATE workspaces SET status='archived', updated_at=now()
  → Enqueue worker job: notify all members via Novu in-app
  → Members hit 404-equivalent on next access → redirect to /
  → Data preserved for 30 days → then permanent cleanup job
```

---

#### 4. Future Scope

- **Slug redirect** — if slug change ever allowed, old slug 301-redirects to new (post-MVP)
- **Workspace transfer** — transfer ownership to another ADMIN member
- **Workspace templates** — pre-populate with example projects/docs on creation wizard
- **Workspace analytics** — aggregated storage, AI usage, publish stats dashboard for owner
- **GDPR data export** — download all workspace data as ZIP (regulatory requirement)
- **Sub-workspaces** — nested hierarchy for large enterprise clients (far future)

---
