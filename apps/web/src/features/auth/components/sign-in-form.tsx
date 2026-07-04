'use client'

import { CircleAlert, Eye, EyeClosed, Lock, Mail, LogIn } from 'lucide-react'
import { useState } from 'react'
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
} from '@pikzee/ui'

import { useSignInForm } from '../hooks/use-signin-form'

import { OAuthButton } from './oauth-button'

interface SignInFormProps {
  onSwitchToSignUp: () => void
  onSuccess: () => void
}

export function SignInForm({ onSwitchToSignUp, onSuccess }: SignInFormProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const { handleSubmit, control, error, loading } = useSignInForm({ onSuccess })

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
        <p className="text-sm text-slate-400 mt-1">Sign in to manage your workspaces</p>
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

        <Button
          variant="default"
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            'Signing in...'
          ) : (
            <>
              <LogIn size={16} />
              <span>Sign In</span>
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

      <div className="grid grid-cols-2 gap-3">
        <OAuthButton provider="google" />
        <OAuthButton provider="github" />
      </div>

      <div className="text-center text-sm text-slate-400">
        Don&apos;t have an account?{' '}
        <Button type="button" variant="link" onClick={onSwitchToSignUp}>
          Sign Up
        </Button>
      </div>
    </div>
  )
}
