---
title: Feature To-Do List
description: Check off backend and frontend feature implementation status.
---

# 📋 Feature To-Do List

This list tracks the development status of backend and frontend implementation for the Pikzee monorepo. Use it to check off completed modules as we build.

---

## Feature 1: Authentication

- **Completed Tasks:**
  - [x] **Clerk Webhook Synchronization**:
    - [x] Register public webhook endpoint `POST /webhooks/clerk` inside NestJS (`apps/api`).
    - [x] Verify incoming Clerk payload signatures using `svix` and `CLERK_WEBHOOK_SECRET`.
    - [x] Process `user.created` events to populate user records in local PostgreSQL DB.
    - [x] Process `user.updated` and `user.deleted` events to keep user tables in sync.
  - [x] **Clerk JWT Authentication Guard**:
    - [x] Create NestJS `ClerkAuthGuard` to verify request Authorization header JWTs.
    - [x] Create custom `@CurrentUser()` decorator to inject verified user records into controllers.
  - [x] **Sign-In Flow & Interface**:
    - [x] Build custom Sign-In form UI utilizing modular components from `@pikzee/ui`.
    - [x] Hook up form validation via `zodResolver` using schemas from `@pikzee/shared-types`.
    - [x] Implement authentication request using Clerk Core 3.0 `signIn.password()` strategy.
    - [x] Finalize user session and cookie configuration via `signIn.finalize()` and redirect.
  - [x] **Sign-Up Flow & Interface**:
    - [x] Build custom Sign-Up form UI overlay.
    - [x] Bind form validation state to `react-hook-form` and validation schemas.
    - [x] Implement user registration initialization using Clerk's `signUp.create()` method.
- **Outstanding Tasks:**
  - [ ] **Protected Routes & Redirection Rules**:
    - [ ] Configure public vs protected route matchers in Next.js `middleware.ts`.
    - [ ] Setup auth layout guards in `(dashboard)` layout.
    - [ ] Handle redirect logic to prevent loops when signed-in users hit `/sign-in` or anonymous users hit dashboard routes.
  - [x] **Onboarding Wizard widget**:
    - [x] Build a multi-step onboarding wizard overlay for first-time users.
    - [x] Implement initial workspace and project creation steps inside the onboarding wizard.
    - [x] Enforce user redirection to `/onboarding` if they do not belong to any workspace.
  - [ ] **Password Reset (Forgot Password) Flow**:
    - [ ] Build a custom Forgot Password view (email input to request reset).
    - [ ] Implement password reset token request dispatch using Clerk SDK.
    - [ ] Create Forgot Password code verification & new password input UI.
    - [ ] Submit verification and finalize password reset flow.
  - [ ] **Password Change Flow (Settings)**:
    - [ ] Create a "Security" settings panel inside user configurations.
    - [ ] Implement secure password update logic using Clerk's update APIs.
  - [ ] **Email OTP Verification UI**:
    - [ ] Build custom 6-digit OTP code verification modal/screen for pending registrations.
    - [ ] Connect the input handler to submit verification via `signUp.attemptEmailAddressVerification({ code })`.
  - [ ] **Terms & Privacy Consent**:
    - [ ] Render required legal policy consent checkboxes inside the custom Sign-Up Dialog.
    - [ ] Link checkboxes to static legal policy routes.
  - [ ] **User preferences endpoints**:
    - [ ] Create endpoints for user-related data not handled by Clerk (e.g., user theme preferences, default active workspace).
  - [ ] **Active Sessions Management**:
    - [ ] Allow users to view and revoke other active sessions from user settings.

## Feature 2: Workspace & Members Management

- **Backend:**
  - [x] Create, update, and retrieve workspaces (`workspace` module).
  - [ ] Implement logic for inviting and managing members (`invitation` and `members` modules).
  - [ ] Define permissions for workspace roles (OWNER, EDITOR, COMMENTOR, GUEST).
- **Frontend:**
  - [x] Implement workspace switcher and creation UI.
  - [ ] Build member invitation and management dialogs.
  - [ ] Display workspace-specific content and settings based on user permissions.

## Feature 3: Project Management

- **Backend:**
  - [ ] Create a `project` module.
  - [ ] Define the `projects` table schema using Drizzle ORM.
  - [ ] Implement API endpoints for CRUD operations on projects.
  - [ ] Implement project-level access control.
- **Frontend:**
  - [x] Create project cards and project creation UI.
  - [ ] Build the project view with a sidebar for folder navigation.
  - [ ] Connect the UI to the backend API once it's ready.

## Feature 4: Asset Management

- **Backend:**
  - [ ] Create an `asset` module for managing files and folders.
  - [ ] Define the `assets` table schema.
  - [ ] Implement API endpoints for CRUD operations on assets.
  - [ ] Implement batch actions (move, copy, delete).
- **Frontend:**
  - [x] Create UI for displaying folders and assets (cards, list view).
  - [x] Implement single and multi-select functionality.
  - [ ] Connect the UI to the backend API.

## Feature 5: Upload Management

- **Backend:**
  - [ ] Create an `upload` module.
  - [ ] Implement an endpoint to generate pre-signed URLs for client-to-S3 uploads.
  - [ ] Handle upload completion notifications to update the `assets` table.
- **Frontend:**
  - [x] Implement a dropzone for file uploads.
  - [x] Implement chunked uploading for large files.
  - [ ] Integrate with the backend to get pre-signed URLs.

## Feature 6: Document & Drafts Management

- **Backend:**
  - [ ] Create `document` and `draft` modules.
  - [ ] Define database schemas.
  - [ ] Implement APIs for CRUD operations.
- **Frontend:**
  - [x] Integrate the Tiptap editor (`block` feature).
  - [ ] Connect the editor to the backend APIs.

## Feature 7: Asset Upload to Social Platforms

- **Backend:**
  - [ ] Create modules for `youtube`, `linkedin`, `twitter`.
  - [ ] Implement OAuth 2.0 flows for connecting accounts.
  - [ ] Implement APIs for uploading content.
- **Frontend:**
  - [x] Create the UI for the `social-uploader`.
  - [ ] Connect the UI to the backend APIs.

## Feature 8: Payment

- **Backend:**
  - [ ] Create a `payment` module.
  - [ ] Integrate with Razorpay SDK.
  - [ ] Implement APIs for creating and verifying payments.
- **Frontend:**
  - [ ] Create a `billing` or `payment` feature UI.
  - [ ] Implement the UI for payment flows.

## Feature 9: Settings

- **Backend:**
  - [ ] Create a `settings` module.
  - [ ] Implement APIs for managing user, workspace, and project settings.
- **Frontend:**
  - [x] Create the UI for user, workspace, and project settings.
  - [ ] Connect the UI to the backend APIs.
