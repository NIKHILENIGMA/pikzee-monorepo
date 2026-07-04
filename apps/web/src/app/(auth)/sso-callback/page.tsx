import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

export default function SSOCallbackPage() {
  // This component automatically handles the "transfer" from sign-in to sign-up
  // if the user is new. You don't have to write any manual logic!
  return (
    <AuthenticateWithRedirectCallback
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/onboarding"
    />
  )
}
