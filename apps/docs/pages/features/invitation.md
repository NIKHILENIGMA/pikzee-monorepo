---
title: Workspace Invitations
description: Deep dive into the invitation lifecycle, token validation, and email invitations.
---

# ✉️ Workspace Invitations

To add new members to a workspace, the system uses a secure email-based invitation flow.

---

## 1. Invitation Lifecycle Flow

```mermaid
sequenceDiagram
    actor Owner as Workspace Owner
    participant API as NestJS API (apps/api)
    actor Member as Invited Member
    participant DB as PostgreSQL DB

    Owner->>API: 1. POST /workspaces/:id/invitations (email, role)
    Note over API: Generates secure Invite Token & Expiry (e.g., 7 days)
    API->>DB: 2. Insert invitation record (status = PENDING)
    Note over API: Sends email invitation with link via Resend/Novu
    API-->>Owner: 3. Return Success (PENDING invitation)

    Member->>API: 4. GET /workspaces/invitations/accept?token=xxx
    Note over API: Verifies token validity and checks expiry
    API->>DB: 5. Create member row & set Invitation to ACCEPTED
    API-->>Member: 6. Redirect to Workspace Dashboard
```

---

## 2. Key Backend Safeguards

- **Signature Verification:** Invitation tokens are encrypted/signed with a workspace secret key.
- **Expiration Validation:** Invites automatically expire after 7 days. If a user clicks an expired link, the backend rejects it and marks the invitation record as `EXPIRED`.
- **Target Email Locking:** Only the user registered under the invited email address can accept the invitation, preventing unauthorized token sharing.
