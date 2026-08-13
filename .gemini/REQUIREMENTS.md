# Pikzee Requirements Document

This document provides a detailed overview of the Pikzee project's core features and functionalities, serving as a comprehensive reference for development.

> **Note:** For details on the technology stack and system architecture, please refer to [ARCHITECTURE.md](./ARCHITECTURE.md).

## 🚀 Core Features and Functionalities

### 1. Authentication

- **Custom UI with Clerk Backend**: Fully custom sign-in/sign-up forms built with shadcn/ui, wired to Clerk's React SDK hooks (`useSignIn`, `useSignUp`).
- **OAuth Integration**: Support for Google and GitHub authentication.
- **Webhook Syncing**: User creation, updates, and deletions in Clerk are synced to the local PostgreSQL `users` table via Svix-verified webhooks.

### 2. Multi-Workspace & Billing

- **Workspace as the Billing Unit**: Subscriptions and plans (Free, Plus, Pro) are attached to individual workspaces, not users.
- **Plan Limits**: Storage quotas, AI request allocations (doc edits and image transforms), and member limits are strictly enforced on a per-workspace basis.
- **Abuse Prevention**: Workspace ownership capacity is tied to the user's highest paid plan across their workspaces.

### 3. Role-Based Access Control (RBAC) & Invites

- **Custom Roles**: Members in a workspace are assigned specific roles: `OWNER`, `EDITOR`, `COMMENTOR`, and `GUEST`.
- **Granular Permissions**: API endpoints are guarded using custom NestJS Role Guards verifying the user's role in the active workspace via the `X-Workspace-Id` header.
- **Member Invites**: Owners can invite users based on workspace plan limits.

### 4. Real-Time Document Collaboration

- **TipTap + Yjs**: Rich text editing with TipTap, synced in real-time between clients using Yjs.
- **Hocuspocus Server**: Hosted inside `apps/worker` as a NestJS service to handle real-time WebSocket state synchronization.
- **Presence Engine**: Live cursors, avatars, and activity state of members active within a document.

### 5. AI Writing & Processing

- **AI Document Edits**: Users can prompt AI to write, refine, or summarize document content.
- **AI Image Transformation**: Processing and altering images within documents.
- **Usage Tracking**: Monthly AI requests are metered per workspace and reset on a scheduled cron job.

### 6. Media and Assets

- **Direct S3/ImageKit Uploads**: Assets and workspace logos are uploaded directly and tracked via CDN URLs.
- **Storage Limits**: Enforcement of total asset sizes per workspace based on subscription tiers.

### 7. Social Publishing

- **OAuth Connections**: Authenticate and connect workspace accounts to external platforms like YouTube, Twitter/X, and LinkedIn.
- **Scheduled Publishing**: Post content and documents to linked platforms. Publishing jobs are handled asynchronously by the BullMQ worker.

### 8. Notifications

- **Email Delivery**: Transactional emails (e.g., invites, payment receipts) built using `react-email` and dispatched via Resend.
- **In-App Alerts**: A centralized notification center powered by Novu for real-time in-app activity updates (e.g., new comments, publishing failures).

## 💳 Subscription Plans (Razorpay)

> Payment provider: **Razorpay Subscriptions API** (recurring monthly/annual)

| Feature                       | FREE   | PLUS  | PRO       |
| ----------------------------- | ------ | ----- | --------- |
| Price (per workspace/mo)      | ₹0     | ₹TBD  | ₹TBD      |
| Workspaces user can OWN       | 1 max  | 3 max | Unlimited |
| AI doc edits / month          | 10     | 500   | Unlimited |
| AI image transforms / month   | 0      | 20    | 200       |
| Asset storage (per workspace) | 500 MB | 10 GB | 50 GB     |
| Publish → YouTube             | ✅     | ✅    | ✅        |
| Publish → Twitter/X           | ❌     | ✅    | ✅        |
| Publish → LinkedIn            | ❌     | ❌    | ✅        |
| Max member invitations        | 1      | 5     | 20        |

### How Paying for a Plan Works

- Payment happens **inside a specific workspace's billing settings**
- That workspace becomes Plus/Pro — other workspaces the user owns stay on Free
- Paying for Plus on Workspace A unlocks **two things**:
  1. Workspace A gets Plus features (10GB, 500 AI, 5 members, Twitter)
  2. User's ownership capacity increases (can now create up to 3 workspaces)
- Extra workspaces (B, C) default to **Free** — they are useful for data/team isolation,
  not for extra limits (separate clients, side projects, staging environments)

### Abuse Prevention Rules

1. Workspace ownership count gated by whether user has any paid workspace
2. All limits enforced server-side — never trust client
3. Storage checked on every upload via quota guard middleware
4. AI requests tracked in `workspace_usage` table, reset monthly via cron
5. Members can JOIN unlimited workspaces (membership ≠ ownership)
6. Workspace status field controls access: `active | suspended | archived`

### Plan Expiry / Downgrade Rules

**When Plus expires on Workspace A** (payment.failed or cancelled):

| Resource                         | What happens                                       |
| -------------------------------- | -------------------------------------------------- |
| Storage > 500MB                  | Read-only mode — can view, cannot upload new files |
| Members > 1                      | Existing members stay active, new invites blocked  |
| AI requests                      | Resets to 10/month cap on next cycle               |
| Scheduled Twitter/LinkedIn posts | Cancelled → moved to Draft, owner notified         |

**When ownership capacity drops** (Plus=3 → Free=1, but user has 3 workspaces):

- Extra workspaces (B, C) → status set to `suspended`
- Members of B and C lose access immediately
- Data is **preserved** — nothing deleted
- Owner sees: _"Renew Plus to reactivate your other workspaces"_
- On upgrade → B and C reactivate instantly

**Downgrade timeline:**

```
Day 0   payment.failed received → Razorpay retries payment
Day 3   Grace period ends → plan marked EXPIRING
          → Novu in-app alert + Resend warning email to owner
Day 7   Full downgrade to Free
          → Workspace A limits enforced (read-only storage, invite block)
          → Workspaces B, C suspended
Day 21  Final warning: "Upgrade or excess data will be archived"
Day 30  Excess assets archived (compressed, still recoverable on upgrade)
Never   Data permanently deleted without explicit user request
```

### Razorpay Webhook Events

- `subscription.activated` → set workspace `plan = plus/pro`, reactivate suspended workspaces
- `subscription.charged` → renew period dates
- `subscription.cancelled` → schedule downgrade job at period end (worker cron)
- `subscription.completed` → downgrade to free, suspend extra workspaces
- `payment.failed` → start grace period counter, notify owner

### Billing DB Schema

```sql
workspaces
  plan            ENUM('free','plus','pro')  DEFAULT 'free'
  status          ENUM('active','suspended','archived')  DEFAULT 'active'
  plan_expires_at TIMESTAMP NULL
  owner_id        → users

workspace_subscriptions
  workspace_id              → workspaces
  razorpay_subscription_id  VARCHAR
  razorpay_plan_id          VARCHAR
  status                    ENUM('active','paused','cancelled','expired')
  current_period_start      TIMESTAMP
  current_period_end        TIMESTAMP
  grace_period_ends_at      TIMESTAMP NULL   ← set on payment.failed

workspace_usage  -- reset monthly via worker cron
  workspace_id      → workspaces
  ai_doc_requests   INT DEFAULT 0
  ai_image_requests INT DEFAULT 0
  storage_bytes     BIGINT DEFAULT 0
  period_start      TIMESTAMP
  period_end        TIMESTAMP
```

### Enforcement Checkpoints in Code

| Endpoint                   | Limit Checked                                              |
| -------------------------- | ---------------------------------------------------------- |
| `POST /uploads`            | `storage_bytes + file_size ≤ plan_storage_limit`           |
| `POST /ai/complete`        | `ai_doc_requests < plan_ai_doc_limit`                      |
| `POST /ai/transform-image` | `ai_image_requests < plan_ai_image_limit`                  |
| `POST /invites`            | `member_count < plan_member_limit`                         |
| `POST /publish`            | `platform ∈ plan_allowed_platforms`                        |
| `POST /workspaces`         | `owned_workspaces_count < ownership_limit_for_user`        |
| **All (app) routes**       | `workspace.status === 'active'` else show suspended screen |

---
