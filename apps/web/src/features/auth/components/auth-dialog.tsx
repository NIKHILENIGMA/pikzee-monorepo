'use client'

import React, { useState, useEffect } from 'react'

import { Dialog, DialogContent, DialogTitle } from '@pikzee/ui'

import { ForgotPasswordForm } from './forgot-password-form'
import { ForgotPasswordVerifyForm } from './forgot-password-verify-form'
import { SignInForm } from './sign-in-form'
import { SignUpForm } from './sign-up-form'
import { VerifyEmailForm } from './verify-email-form'

interface AuthDialogProps {
  isOpen: boolean
  onClose: () => void
  initialMode: 'signin' | 'signup'
}

type AuthDialogMode = 'signin' | 'signup' | 'verify' | 'forgot_password' | 'forgot_password_verify'

export function AuthDialog({ isOpen, onClose, initialMode }: AuthDialogProps) {
  const [mode, setMode] = useState<AuthDialogMode>('signin')
  const [verifyEmail, setVerifyEmail] = useState<string>('')
  const [resetEmail, setResetEmail] = useState<string>('')

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
    }
  }, [isOpen, initialMode])

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent showCloseButton={true} className="sm:max-w-md p-6">
        <DialogTitle className="sr-only">Authentication</DialogTitle>
        {mode === 'signin' && (
          <SignInForm
            onSwitchToSignUp={() => setMode('signup')}
            onForgotPassword={() => setMode('forgot_password')}
            onSuccess={onClose}
          />
        )}

        {mode === 'signup' && (
          <SignUpForm
            onSwitchToSignIn={() => setMode('signin')}
            onRequireVerification={(email) => {
              setVerifyEmail(email)
              setMode('verify')
            }}
          />
        )}

        {mode === 'verify' && (
          <VerifyEmailForm
            email={verifyEmail}
            onSuccess={onClose}
            onBackToSignUp={() => setMode('signup')}
          />
        )}

        {mode === 'forgot_password' && (
          <ForgotPasswordForm
            onCodeSent={(email) => {
              setResetEmail(email)
              setMode('forgot_password_verify')
            }}
            onBackToSignIn={() => setMode('signin')}
          />
        )}

        {mode === 'forgot_password_verify' && (
          <ForgotPasswordVerifyForm
            email={resetEmail}
            onSuccess={onClose}
            onBackToSignIn={() => setMode('signin')}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
