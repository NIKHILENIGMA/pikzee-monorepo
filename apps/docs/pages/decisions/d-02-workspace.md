---
title: D-02 · Workspace Model
description: Multi-workspace, plan per workspace — decision record.
---

# D-02 · Workspace: Multi-workspace, Plan per Workspace

**Status:** ✅ Decided

## Options Considered

### Option A — Single workspace per user

❌ **Rejected.** Doesn't scale to teams or agencies. Painful migration later.

### Option B — Multi-workspace, plan per user

❌ **Rejected.** Can't cleanly control per-workspace limits.

### Option C — Multi-workspace, plan per workspace ✅ Chosen

✅ **Chosen.** The workspace is the billing unit.

## Model Details

- Plan lives on the **workspace**, not the user account
- The workspace **owner** pays for the workspace plan
- Workspace ownership count is gated by the owner's account tier:

| Account Tier | Max Workspaces Owned |
| ------------ | -------------------- |
| Free         | 1                    |
| Plus         | 3                    |
| Pro          | Unlimited            |

- Any user can be a **member** of unlimited workspaces regardless of tier
- All limits (storage, AI credits, members) are **scoped per workspace**
- URL structure: `/:workspaceSlug/...` — future-proof from day 1

## Conclusion

Multi-workspace + per-workspace billing with ownership gating. Scales cleanly to agencies, freelancers, and teams.
