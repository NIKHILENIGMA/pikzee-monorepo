# Pikzee — To-Do List (MVP Phases)

> This file tracks the development status of backend and frontend implementation for the Pikzee monorepo.
> It has been structured into MVP cycles to prioritize immediate goals.

---

## 🚀 MVP 1 (The Foundation & Single-Player Experience)

**Goal:** A user can create a workspace, invite up to 2 members, write a script with AI assistance, organize assets in folders, and publish to YouTube.

### Feature 1: Authentication & Onboarding (✅ Complete)

- **Completed Tasks:**
  - [x] Clerk Webhook Synchronization (`user.created`, `user.updated`).
  - [x] Clerk JWT Authentication Guard & `@CurrentUser()`.
  - [x] Sign-In & Sign-Up Flow Interfaces.
  - [x] Onboarding Wizard (Initial workspace creation).
  - [x] Protected Routes & Redirection Rules.
  - [x] Email OTP Verification & Password Reset Flows.

### Feature 2: Workspace & Members Management

- **Completed Tasks:**
  - [x] Workspace CRUD (Backend) Refactoring & Security Audit.
  - [x] Phase 1: Shared Setup (Permissions enum, `ROLE_PERMISSIONS`).
  - [x] Phase 2: Authorization Module: `WorkspacePermissionsGuard` & Decorators.
- **Outstanding Tasks (MVP 1):**
  - [ ] **Workspace Switcher & CRUD UI**: Build the frontend UI for switching between and managing workspaces.
  - [x] **Phase 3: Members Module**: API for member management. Enforce rule: _Only Admin can change roles. No one can kick Admin._ (Completed).
  - [x] **Phase 4: Invitations Module**: Send invite emails via Resend, accept invite flow, list pending, revoke. (Completed).
  - [x] **Phase 5: Notification Module**: Abstracted email logic into a scalable multi-channel notification system using Resend dashboard templates. (Completed).
  - [ ] **Free Plan Limits**: Enforce maximum of 2 members per workspace on the Free plan.

### Feature 3: Digital Asset Management (Folders & Uploads)

- **Outstanding Tasks (MVP 1):**
  - [ ] **Asset Display UI & File Upload Dropzone**: Build the frontend UI.
  - [ ] **Asset Backend Schema**: DB schema for assets and nested folders.
  - [ ] **Asset APIs**: Allow users to dump files into custom nested folder structures.
  - [ ] **S3 Upload System**: Pre-signed URL generation and chunked uploading completion API.
  - [ ] **Free Plan Limits**: Enforce 500MB storage limit. Show premium banner when exceeded.

### Feature 4: Script Editor & AI

- **Outstanding Tasks (MVP 1):**
  - [ ] **Rich Text Editor Integration**: TipTap basic blocks and frontend UI.
  - [ ] **Editor Customizations**: Implement Slash commands (Heading, paragraph, code, quote, bullets, highlighting).
  - [ ] **AI Scripting**: `POST /ai/complete` endpoint.
  - [ ] **AI Limits**: Implement 10 gems limit per workspace (each AI call costs 2 gems).

### Feature 5: Publisher (YouTube)

- **Outstanding Tasks (MVP 1):**
  - [ ] **Social Uploader UI**: Build the frontend publishing interface.
  - [ ] **YouTube OAuth 2.0 Integration**: Connect Google accounts for publishing.
  - [ ] **Publishing Queue**: BullMQ worker to stream files from S3 directly to YouTube API.

### Feature 6: Settings

- **Outstanding Tasks (MVP 1):**
  - [ ] **Settings Panels UI**: Build the frontend UI for managing preferences.
  - [ ] **Settings API**: Implement backend logic to change name, password, email, and other preferences.

---

## 🚀 MVP 2 (Multiplayer, Social Expansion & Tracking)

**Goal:** Collaborative live-editing, expanded social reach, limits enforcement, and workspace transparency.

### Feature 7: Advanced Editor & Collaboration

- **Outstanding Tasks (MVP 2):**
  - [ ] **Live Collaboration Gateway**: Hocuspocus WebSockets (see multiple people typing).
  - [ ] **Editor Comments**: Inline comment threads on draft scripts.
  - [ ] **Custom Nodes**: Advanced TipTap extensions.

### Feature 8: Advanced Asset Management

- **Outstanding Tasks (MVP 2):**
  - [ ] **Asset Comments**: Ability to comment on uploaded images, videos, and docs.
  - [ ] **Uploader Tracking**: UI indicator showing which user uploaded specific assets.

### Feature 9: Advanced Publisher & Scheduler

- **Outstanding Tasks (MVP 2):**
  - [ ] **LinkedIn & Twitter OAuth**: Add integrations for publishing.
  - [ ] **Content Scheduler**: Calendar interface to track uploaded/pending content.
  - [ ] **File Size Limits**: Enforce single-file upload size limits according to subscription plans.

### Feature 10: Audit Logs

- **Outstanding Tasks (MVP 2):**
  - [ ] **Audit Logs Schema & API**: Track and display which member performed what action at what time.

---

## ⏳ Post-MVP / Backlog

- [ ] **Payment & Billing (Razorpay)**: Checkout flows for upgrading to paid tiers.
- [ ] **Project Management**: Dedicated project cards/folders routing (if beyond basic asset folders).
- [ ] **Active Sessions Management**: Allow users to revoke other active sessions.
- [ ] **AI Image Generation/Transformation**: Future AI additions.
