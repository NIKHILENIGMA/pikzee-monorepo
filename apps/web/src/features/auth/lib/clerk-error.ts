import { isClerkAPIResponseError } from '@clerk/backend/errors'

const CLERK_ERROR_MAP: Record<string, string> = {
  // Sign-in errors mapped together for security
  form_identifier_not_found: 'Invalid email or password. Please try again.',
  form_password_incorrect: 'Invalid email or password. Please try again.',

  // Custom sign-up errors
  form_identifier_exists: 'This email address is already in use. Please sign in instead.',
  form_password_pwned:
    'This password has been leaked in a data breach. Please choose a safer password.',
  form_password_validation_failed: 'Password does not meet the security requirements.',
}

export function transformClerkError(
  error: unknown,
  fallbackMessage = 'An unexpected error occurred. Please try again.',
): string {
  // If it's not a Clerk error, return the fallback message
  if (!isClerkAPIResponseError(error)) {
    return fallbackMessage
  }

  const firstError = error.errors[0]
  if (!firstError) {
    return fallbackMessage
  }

  // 1. Try matching using Clerk's machine-readable code
  const code = firstError.code
  if (code && CLERK_ERROR_MAP[code]) {
    return CLERK_ERROR_MAP[code]
  }

  // 2. Fall back to Clerk's descriptive message, and finally the generic fallback
  return firstError.longMessage || firstError.message || fallbackMessage
}
