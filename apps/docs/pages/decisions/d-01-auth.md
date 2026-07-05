---
title: D-01 · Auth Strategy
description: Custom UI with Clerk Backend — decision record.
---

# D-01 · Auth: Custom UI with Clerk Backend

**Status:** ✅ Decided

## Options Considered

### Option A — Hosted Clerk UI

❌ **Rejected.** Exposes Clerk branding in production. No control over design.

### Option B — Embedded `<SignIn />` Component

❌ **Rejected.** Still Clerk-controlled markup. Limited customization. Clerk branding still present.

### Option C — Fully Custom UI ✅ Chosen

✅ **Chosen.**

- Build sign-in / sign-up pages from scratch using **shadcn/ui + Tailwind CSS**
- Use Clerk's `@clerk/nextjs` SDK for hooks: `useSignIn()`, `useSignUp()`, `auth()`, `currentUser()`, `clerkMiddleware()`
- OAuth buttons (Google, GitHub) are hand-coded but wired to Clerk's OAuth strategy

## Conclusion

No Clerk branding is visible in production. Full control over the app-layer UX and flow. Custom components wired directly to Clerk's SDK hooks.
