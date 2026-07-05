---
title: Authentication
description: Clerk Core 3.0 authentication integration, form validation, auth-specific routing, and UI component structures.
---

# Authentication

## Decision

Pikzee uses **Clerk** for authentication but with **fully custom UI** — no Clerk-branded components are visible in production. This was decided in [D-01](/decisions/d-01-auth).

## How it works

```
User visits /sign-in
    └─ Custom sign-in page (our UI)
           └─ useSignIn() hook from @clerk/nextjs
                  └─ Clerk backend validates credentials
                         └─ Session cookie set
                                └─ Redirect to dashboard
```

## Key Hooks Used

| Hook          | Purpose                        |
| ------------- | ------------------------------ |
| `useSignIn()` | Handle sign-in flow            |
| `useSignUp()` | Handle sign-up flow            |
| `useUser()`   | Access current user object     |
| `useAuth()`   | Get auth state and tokens      |
| `useClerk()`  | Access Clerk instance directly |

## Server-Side

| Function            | Purpose                                           |
| ------------------- | ------------------------------------------------- |
| `auth()`            | Get session in Server Components / Route Handlers |
| `currentUser()`     | Get full user object server-side                  |
| `clerkMiddleware()` | Protect routes in `middleware.ts`                 |

## OAuth (Google, GitHub)

OAuth buttons are hand-coded but wired to Clerk's OAuth strategy:

```ts
const { signIn } = useSignIn()

const handleGoogleSignIn = () =>
  signIn.authenticateWithRedirect({
    strategy: 'oauth_google',
    redirectUrl: '/sso-callback',
    redirectUrlComplete: '/dashboard',
  })
```

---

## Form Validation (React Hook Form + Zod)

Pikzee uses **Zod** schema validation and **React Hook Form** to manage input fields cleanly before they reach Clerk.

Schemas are imported from our shared library `@pikzee/shared-types`.

### Validation Hook Initialization Example

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type SignInFormValues, signInSchema } from '@pikzee/shared-types'

export const useSignInForm = () => {
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // form.control is passed to <Controller /> components in UI
  return { control: form.control, handleSubmit: form.handleSubmit }
}
```

---

## Clerk Core 3.0 Auth Integration

Pikzee implements **Clerk Core 3.0** password and verification APIs in our custom authentication flows.

### 1. Custom Sign-In Flow

Sign-in uses `signIn.password()` to verify the credentials and `signIn.finalize()` to establish the session cookie and redirect the user.

```typescript
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

const { signIn } = useSignIn()
const router = useRouter()

const handleSignIn = async (data: SignInFormValues) => {
  if (!signIn) return

  // 1. Authenticate credentials
  const res = await signIn.password({
    identifier: data.email,
    password: data.password,
  })

  if (res.error) {
    throw new Error(res.error.message)
  }

  // 2. Finalize session and redirect
  if (signIn.status === 'complete') {
    await signIn.finalize({
      navigate: async ({ decorateUrl }) => {
        router.push(decorateUrl('/dashboard'))
      },
    })
  }
}
```

### 2. Custom Sign-Up Flow

Sign-up uses `signUp.create()` to initialize the account and trigger validation steps (such as email code confirmation).

```typescript
import { useSignUp } from '@clerk/nextjs'

const { signUp } = useSignUp()

const handleSignUp = async (data: SignUpFormValues) => {
  if (!signUp) return

  // Create pending registration
  const res = await signUp.create({
    emailAddress: data.email,
    password: data.password,
  })

  // Check if email verification is required
  if (res.status === 'missing_requirements') {
    await signUp.prepareEmailAddressVerification()
    // Show email OTP verification UI page
  }
}
```

---

## Auth-Specific Routing & Middleware

Authentication state divides the application routes into public and protected route groups using Next.js App Router directories and NextJS middleware.

### Route Groups

```
app/
├── (auth)/                   # Public auth routes — no layout header
│   ├── sign-in/page.tsx      # Custom Sign In Form
│   ├── sign-up/page.tsx      # Custom Sign Up Form
│   └── sso-callback/page.tsx # OAuth callback handler
│
├── (dashboard)/              # Protected — requires active session
│   ├── layout.tsx            # Dashboard shell (sidebar, workspace navigation)
│   └── [workspaceSlug]/      # Workspace-scoped pages
└── layout.tsx                # Root layout (ClerkProvider wrapper)
```

### Middleware Authentication Enforcement

The `middleware.ts` file acts as the primary gatekeeper, intercepting requests and redirecting anonymous traffic away from dashboard routes:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define which routes are public
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/api/webhooks(.*)', // Public webhooks (e.g. Clerk webhook)
])

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    // Enforce login for all other routes
    auth().protect()
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

---

## Authentication Components System

We use a modular UI approach to render auth forms. Layout elements are styled and managed separately from form validation states to ensure reuse and maintainability.

### 1. Controllers for State Linking

We avoid raw inputs. Instead, UI inputs are wrapped in `react-hook-form`'s `<Controller>` component to bind input values and error states cleanly to the form's control logic:

```tsx
<Controller
  name="email"
  control={control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor="email">Email address</FieldLabel>
      <InputGroup>
        <InputGroupInput {...field} id="email" />
      </InputGroup>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

### 2. UI Form Wrappers (`@pikzee/ui`)

Visual elements like fields, groups, and inputs are imported from the workspace's shared components package (`@pikzee/ui`), decoupling style from authentication:

- **`<FieldGroup>`**: Groups form elements and manages spacing.
- **`<FieldLabel>`**: Renders styled, accessible labels.
- **`<InputGroup>`**: Supports prepending/appending icons or helper buttons (e.g. toggle password visibility).
- **`<FieldError>`**: Visually highlights error messages on validation failure.

---

## 📋 Outstanding Authentication TODOs

This list tracks the authentication flows and policies that are planned but not yet implemented:

- [ ] **Password Reset (Forgot Password)**:
  - Create a `/forgot-password` view.
  - Implement Clerk's reset password sequence (submit email, verify reset code, and input new password).
- [ ] **Password Change (User Settings)**:
  - Add a security page inside dashboard settings.
  - Implement secure password updating using Clerk's update APIs.
- [ ] **Terms of Service & Privacy Policy**:
  - Create static legal pages at `/terms` and `/privacy`.
  - Add required consent checkboxes to the Custom Sign-up Form to ensure legal compliance before registering.
- [ ] **Email OTP Verification UI**:
  - Connect the verification code input screen to handle the pending sign-up code submission.
- [ ] **Active Sessions Management**:
  - Allow users to view and revoke other active sessions from user settings.

---

## Future Roadmap & Enhancements

As the platform grows, we can expand the authentication system with the following feature sections:

### 🔒 Passwordless & Magic Link Flows

Introduce passwordless sign-ins using Magic Links (`signIn.create({ strategy: "email_code" })` or passcodes). This lowers friction during user onboarding.

### 🛡️ Multi-Factor Authentication (MFA)

Enable TOTP (Time-based One-Time Passwords) or SMS-based verification layers inside settings. Our custom form flow can be adapted by checking `result.status === "needs_second_factor"` and rendering a verification code sub-form.

### 🏢 Organization & Workspace Switchers

Deepen integrations with Clerk's Organizations feature. This will allow:

- Inviting users to workspaces directly through email invitations.
- Mapping workspace roles (Owner, Admin, Member) to Clerk-managed permissions.

### 🔌 SSO Enterprise Integrations

For enterprise workspaces, support custom SAML Single Sign-On providers (Okta, Azure AD) mapped via Clerk's enterprise configurations.
