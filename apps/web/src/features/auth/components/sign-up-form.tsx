'use client'

import { CircleAlert, Eye, EyeClosed, Lock, Mail, User, UserPlus } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'
import { Controller } from 'react-hook-form'

import {
  Button,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
  Checkbox,
} from '@pikzee/ui'

import { useSignUpForm } from '../hooks/use-signup-form'

import { OAuthButton } from './oauth-button'

interface SignUpFormProps {
  onSwitchToSignIn: () => void
  onRequireVerification: (email: string) => void
}

export function SignUpForm({ onSwitchToSignIn, onRequireVerification }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const { handleSubmit, control, error, loading } = useSignUpForm({ onRequireVerification })

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Create an Account</h2>
        <p className="text-sm text-slate-400 mt-1">Get started with your free workspace</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-900/30 border border-red-800 p-3 text-sm text-red-400 gap-1">
          <CircleAlert size={15} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <FieldGroup>
            <div className="grid grid-cols-2 gap-3">
              <Controller
                name="firstName"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="firstName">First name</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <User className="text-slate-400" size={16} />
                      </InputGroupAddon>
                      <InputGroupInput
                        {...field}
                        id="firstName"
                        aria-invalid={fieldState.invalid}
                        placeholder="John"
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
              <Controller
                name="lastName"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <User className="text-slate-400" size={16} />
                      </InputGroupAddon>
                      <InputGroupInput
                        {...field}
                        id="lastName"
                        aria-invalid={fieldState.invalid}
                        placeholder="Doe"
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
            </div>
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
            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align="inline-start">
                      <Lock className="text-slate-400" size={16} />
                    </InputGroupAddon>
                    <InputGroupInput
                      {...field}
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      aria-invalid={fieldState.invalid}
                      placeholder="••••••••"
                      autoComplete="off"
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeClosed size={15} /> : <Eye size={15} />}
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
        </div>

        <div className="my-3">
          <Controller
            name="acceptTerms"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center space-x-2 text-sm text-slate-400 select-none">
                  <Checkbox
                    id="acceptTerms"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                  />
                  <label htmlFor="acceptTerms" className="cursor-pointer leading-none">
                    I agree to the{' '}
                    <Link
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 font-semibold underline"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 font-semibold underline"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {fieldState.invalid && (
                  <span className="flex items-center gap-1 text-sm text-red-400 mt-1">
                    <CircleAlert size={15} />
                    <FieldError errors={[fieldState.error]} />
                  </span>
                )}
              </Field>
            )}
          />
        </div>

        <Button
          variant="default"
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            'Creating account...'
          ) : (
            <>
              <UserPlus size={16} />
              <span>Sign Up</span>
            </>
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-900 px-2 text-slate-400">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <OAuthButton provider="google" />
        {/* <OAuthButton provider="github" /> */}
      </div>

      <div className="text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Button onClick={onSwitchToSignIn} variant="link">
          Sign In
        </Button>
      </div>
    </div>
  )
}
