import { useSignIn } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { type ForgotPasswordFormValues, forgotPasswordSchema } from '@pikzee/shared-types'

import { transformClerkError } from '../lib/clerk-error'

export const useForgotPasswordForm = ({ onCodeSent }: { onCodeSent: (email: string) => void }) => {
  const { signIn } = useSignIn()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const handleSubmit = async (data: ForgotPasswordFormValues) => {
    if (!signIn) return

    setLoading(true)
    setError('')

    try {
      // 1. Initiate sign-in session with identifier
      await signIn.create({
        identifier: data.email,
      })

      // 2. Request code dispatch
      const res = await signIn.resetPasswordEmailCode.sendCode()

      if (res.error) {
        setError(transformClerkError(res, 'Failed to send reset code. Please try again.'))
        setLoading(false)
        return
      }

      onCodeSent(data.email)
    } catch (err) {
      setError(transformClerkError(err))
    } finally {
      setLoading(false)
    }
  }

  return {
    control: form.control,
    handleSubmit: form.handleSubmit(handleSubmit),
    error,
    loading,
  }
}
