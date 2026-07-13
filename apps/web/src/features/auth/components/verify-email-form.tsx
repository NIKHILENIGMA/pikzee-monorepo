'use client'
import { Controller } from 'react-hook-form'

import { Button, InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@pikzee/ui'

import { useVerifyEmailForm } from '../hooks/use-verify-email-form'

interface VerifyEmailFormProps {
  email: string
  onSuccess: () => void
  onBackToSignUp: () => void
}

export function VerifyEmailForm({ email, onSuccess, onBackToSignUp }: VerifyEmailFormProps) {
  const { handleSubmit, control, formError, error, loading } = useVerifyEmailForm({ onSuccess })

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Verify Your Email</h2>
        <p className="text-sm text-slate-400 mt-1">We sent a 6-digit code to {email}</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-900/30 border border-red-800 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Controller
          name="otp"
          control={control}
          render={({ field }) => (
            <InputOTP maxLength={6} value={field.value} onChange={field.onChange}>
              <div className="flex justify-center items-center gap-3 w-full">
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="size-12 text-lg font-semibold" />
                  <InputOTPSlot index={1} className="size-12 text-lg font-semibold" />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={2} className="size-12 text-lg font-semibold" />
                  <InputOTPSlot index={3} className="size-12 text-lg font-semibold" />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={4} className="size-12 text-lg font-semibold" />
                  <InputOTPSlot index={5} className="size-12 text-lg font-semibold" />
                </InputOTPGroup>
              </div>
            </InputOTP>
          )}
        />
        {formError !== undefined && <p className="text-sm text-destructive">{formError}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Verifying...' : 'Verify Email'}
        </Button>
      </form>

      <div className="text-center text-sm text-slate-400">
        Didn&apos;t receive code?{' '}
        <button
          onClick={onBackToSignUp}
          className="font-semibold text-indigo-400 hover:text-indigo-300 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  )
}
