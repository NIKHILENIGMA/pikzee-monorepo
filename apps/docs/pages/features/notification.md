---
title: Notification Module
description: Scalable multi-channel notification system abstracting email and other delivery methods.
---

# 🔔 Notification Module

The notification module provides a scalable, abstracted way to send multi-channel notifications (Emails, SMS, In-App, Push) to users across the platform. By centralizing this logic, features like workspace invitations or welcome emails can simply dispatch an event without knowing the underlying provider details.

---

## 1. Architecture & Payload

The system relies on a generic `NotificationService` that iterates through requested channels and delegates delivery to specific channel providers (e.g., `EmailChannelProvider`).

### Notification Payload Schema

```typescript
export interface NotificationPayload {
  recipient: string
  event: NotificationEventEnum
  channel: NotificationChannelEnum[]
  meta: NotificationMetaData
}
```

- **`recipient`**: The target destination (e.g., email address).
- **`event`**: The specific business event (`WORKSPACE_INVITATION`, `WELCOME_EMAIL`).
- **`channel`**: An array of delivery methods (`EMAIL`, `SMS`, `IN_APP`, `PUSH_NOTIFICATION`).
- **`meta`**: Dynamic variables required to hydrate the notification template (e.g., `workspaceName`, `invitationLink`).

---

## 2. Notification Channels

Currently, the primary supported channel is **EMAIL**, powered by [Resend](https://resend.com).

### Email Provider Implementation

The `EmailChannelProvider` uses Resend's dashboard templates. It dynamically maps the business `event` to a specific Resend Template ID using environment variables.

1. **Template Resolution:**
   - `WORKSPACE_INVITATION` maps to `RESEND_INVITE_TEMPLATE_ID`
   - `WELCOME_EMAIL` maps to `RESEND_WELCOME_TEMPLATE_ID`

2. **Variable Hydration:**
   Based on the event, specific `meta` properties are extracted and passed to the template. For example, a workspace invitation extracts:
   - `workspaceName`
   - `inviterName`
   - `invitationLink`

3. **Delivery:**
   The `resend.emails.send` API is invoked. All notifications dispatched in a single request are processed in parallel using `Promise.allSettled()`.

---

## 3. Usage Pattern

To send a notification, inject the `NotificationService` and call the `notify` method.

```typescript
// Example from an invitation or user service
await this.notificationService.notify({
  recipient: 'user@example.com',
  event: NotificationEventEnum.WORKSPACE_INVITATION,
  channel: [NotificationChannelEnum.EMAIL],
  meta: {
    workspaceName: 'Acme Corp',
    inviterName: 'Jane Doe',
    invitationLink: 'https://app.pikzee.com/invite/token123',
  },
})
```

---

## 4. Packages & Environment Setup

**Required Packages:**

```bash
# apps/api
pnpm add resend               # For email delivery
```

**Environment Variables (`apps/api/.env`):**

```env
RESEND_API_KEY=re_123456789
RESEND_FROM_EMAIL=noreply@send.pikzee.com
RESEND_INVITE_TEMPLATE_ID=your_resend_template_id_here
RESEND_WELCOME_TEMPLATE_ID=your_resend_template_id_here
```

---

## 5. Extensibility

The module is designed to easily accommodate new delivery channels in the future without refactoring consuming services. To add SMS or In-App notifications:

1. Create a new provider (e.g., `SmsChannelProvider`) implementing `NotificationChannelProvider`.
2. Add the provider to `NotificationModule` and inject it into `NotificationService`.
3. Add the logic to the `notify` method to push the new provider's `send()` promise into the parallel execution array if the requested `channel` includes it.
