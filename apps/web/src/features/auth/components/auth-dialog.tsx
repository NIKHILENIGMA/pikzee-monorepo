'use client'

import React, { useState, useEffect } from 'react'

import { Dialog, DialogContent, DialogTitle } from '@pikzee/ui'

import { SignInForm } from './sign-in-form'
import { SignUpForm } from './sign-up-form'
import { VerifyEmailForm } from './verify-email-form'

interface AuthDialogProps {
  isOpen: boolean
  onClose: () => void
  initialMode: 'signin' | 'signup'
}

type AuthDialogMode = 'signin' | 'signup' | 'verify'

export function AuthDialog({ isOpen, onClose, initialMode }: AuthDialogProps) {
  const [mode, setMode] = useState<AuthDialogMode>('signin')
  const [verifyEmail, setVerifyEmail] = useState<string>('')

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
          <SignInForm onSwitchToSignUp={() => setMode('signup')} onSuccess={onClose} />
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
      </DialogContent>
    </Dialog>
  )
}
