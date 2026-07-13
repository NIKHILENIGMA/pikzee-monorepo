'use client'

import { CircleAlert, Eye, EyeClosed, Lock, KeyRound, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
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
  InputGroupButton,
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@pikzee/ui'

import { useForgotPasswordVerifyForm } from '../hooks/use-forgot-password-verify-form'

interface ForgotPasswordVerifyFormProps {
  email: string
  onSuccess: () => void
  onBackToSignIn: () => void
}

export function ForgotPasswordVerifyForm({
  email,
  onSuccess,
  onBackToSignIn,
}: ForgotPasswordVerifyFormProps) {
  const [passwordField, setPasswordField] = useState<{
    showPassword: boolean
    showConfirmPassword: boolean
  }>({ showPassword: false, showConfirmPassword: false })

  const { handleSubmit, control, error, loading, timer, handleResendCode } =
    useForgotPasswordVerifyForm({ onSuccess })

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Create New Password</h2>
        <p className="text-sm text-slate-400 mt-1">We sent a 6-digit code to {email}</p>
      </div>

      {error && (
        <div className="flex items-center rounded-md bg-red-900/30 border border-red-800 p-3 text-sm text-red-400 gap-1.5">
          <CircleAlert size={15} />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-center">
        <FieldGroup className="w-full flex items-center">
          <Controller
            name="code"
            control={control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="w-full flex flex-col items-center"
              >
                <FieldLabel className="self-start mb-2">Verification Code</FieldLabel>
                <InputOTP maxLength={6} value={field.value} onChange={field.onChange}>
                  <div className="flex items-center gap-3">
                    <InputOTPGroup>
                      <InputOTPSlot
                        index={0}
                        className="size-12 text-lg md:size-14 md:text-xl font-semibold"
                      />
                      <InputOTPSlot
                        index={1}
                        className="size-12 text-lg md:size-14 md:text-xl font-semibold"
                      />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot
                        index={2}
                        className="size-12 text-lg md:size-14 md:text-xl font-semibold"
                      />
                      <InputOTPSlot
                        index={3}
                        className="size-12 text-lg md:size-14 md:text-xl font-semibold"
                      />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot
                        index={4}
                        className="size-12 text-lg md:size-14 md:text-xl font-semibold"
                      />
                      <InputOTPSlot
                        index={5}
                        className="size-12 text-lg md:size-14 md:text-xl font-semibold"
                      />
                    </InputOTPGroup>
                  </div>
                </InputOTP>
                {fieldState.invalid && (
                  <span className="flex items-center gap-1 text-sm text-red-400 mt-1 self-start">
                    <CircleAlert size={15} />
                    <FieldError errors={[fieldState.error]} />
                  </span>
                )}
              </Field>
            )}
          />
          <Button
            variant="link"
            type="button"
            disabled={timer > 0}
            onClick={handleResendCode}
            className="w-full flex items-center justify-center gap-2 cursor-pointer"
          >
            {timer > 0 ? `Resend Code in ${timer}s` : 'Resend Code'}
          </Button>
        </FieldGroup>

        <FieldGroup className="w-full">
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password">New Password</FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <Lock className="text-slate-400" size={16} />
                  </InputGroupAddon>
                  <InputGroupInput
                    {...field}
                    id="password"
                    type={passwordField.showPassword ? 'text' : 'password'}
                    aria-invalid={fieldState.invalid}
                    placeholder="••••••••"
                    autoComplete="off"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        setPasswordField({
                          ...passwordField,
                          showPassword: !passwordField.showPassword,
                        })
                      }
                      className="text-slate-400 hover:text-white"
                    >
                      {passwordField.showPassword ? <EyeClosed size={15} /> : <Eye size={15} />}
                    </InputGroupButton>
                  </InputGroupAddon>
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

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <Lock className="text-slate-400" size={16} />
                  </InputGroupAddon>
                  <InputGroupInput
                    {...field}
                    id="confirmPassword"
                    type={passwordField.showConfirmPassword ? 'text' : 'password'}
                    aria-invalid={fieldState.invalid}
                    placeholder="••••••••"
                    autoComplete="off"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        setPasswordField({
                          ...passwordField,
                          showConfirmPassword: !passwordField.showConfirmPassword,
                        })
                      }
                      className="text-slate-400 hover:text-white"
                    >
                      {passwordField.showConfirmPassword ? (
                        <EyeClosed size={15} />
                      ) : (
                        <Eye size={15} />
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
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
            'Resetting...'
          ) : (
            <>
              <KeyRound size={16} />
              <span>Reset Password</span>
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
