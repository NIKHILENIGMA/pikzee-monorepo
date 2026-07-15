---
title: UI Component Library
description: Overview of the shared UI components in libs/ui.
---

# 🎨 Component Library (`@pikzee/ui`)

All shared React UI primitives are located inside `libs/ui/src/components`. These are custom styled wrappers built to establish Pikzee’s premium look.

---

## 1. Core UI Primitives

- **`<Button />` (`button.tsx`):** Standard button featuring glassmorphic borders, active hover glows, and integrated loading indicators.
- **`<Checkbox />` (`checkbox.tsx`):** A custom checkbox that performs check/uncheck slide transitions.
- **`<Dialog />` (`dialog.tsx`):** Accessible modals utilizing custom animations when opening/closing.
- **`<Input />` (`input.tsx`):** Floating label inputs with outline glow borders when focused.
- **`<InputOtp />` (`input-otp.tsx`):** Secure 6-digit OTP code verification cells used for sign-up validation.

---

## 2. Using Primitives

Avoid writing raw HTML input elements or generic shadcn wrappers directly in feature folders. Always import from `@pikzee/ui`:

```tsx
import { Button, Input, Checkbox } from '@pikzee/ui'

export function LoginForm() {
  return (
    <div className="space-y-4">
      <Input label="Email Address" type="email" required />
      <Input label="Password" type="password" required />
      <Button variant="primary">Sign In</Button>
    </div>
  )
}
```
