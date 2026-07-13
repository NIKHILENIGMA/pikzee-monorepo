'use client'

import { CircleAlert, Mail, ArrowLeft, Send } from 'lucide-react'
import { Controller } from 'react-hook-form'

import {
  Button,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from '@pikzee/ui'

import { useForgotPasswordForm } from '../hooks/use-forgot-password-form'

interface ForgotPasswordFormProps {
  onCodeSent: (email: string) => void
  onBackToSignIn: () => void
}

export function ForgotPasswordForm({ onCodeSent, onBackToSignIn }: ForgotPasswordFormProps) {
  const { handleSubmit, control, error, loading } = useForgotPasswordForm({ onCodeSent })

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Forgot Password</h2>
        <p className="text-sm text-slate-400 mt-1">
          Enter your email and we will send a password reset code
        </p>
      </div>

      {error && (
        <div className="flex items-center rounded-md bg-red-900/30 border border-red-800 p-3 text-sm text-red-400 gap-1.5">
          <CircleAlert size={15} />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FieldGroup>
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <Mail className="text-slate-400" size={16} />
                  </InputGroupAddon>
                  <InputGroupInput
                    {...field}
                    id="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="john.doe@example.com"
                    autoComplete="off"
                  />
                </InputGroup>
                {fieldState.invalid && (
                  <span className="flex items-center gap-1 text-sm text-red-400 mt-1">
                    <CircleAlert size={15} />
                    <FieldError errors={[fieldState.error]} />
                  </span>
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <Button
          variant="default"
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            'Sending code...'
          ) : (
            <>
              <Send size={16} />
              <span>Send Reset Code</span>
            </>
          )}
        </Button>
      </form>

      <div className="text-center">
        <button
          onClick={onBackToSignIn}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={14} />
          <span>Back to Sign In</span>
        </button>
      </div>
    </div>
  )
}
