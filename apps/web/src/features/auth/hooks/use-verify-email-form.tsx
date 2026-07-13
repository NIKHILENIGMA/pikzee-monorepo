import { useSignUp } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { type ChangeEvent, useState } from 'react'
import { type Control, useForm } from 'react-hook-form'

import { type VerifyOtpFormValues, verifyOtpSchema } from '@pikzee/shared-types'

import { transformClerkError } from '../lib/clerk-error'

interface UseVerifyEmailForm {
  handleSubmit: (e: ChangeEvent<HTMLFormElement>) => Promise<void>
  control: Control<VerifyOtpFormValues>
  formError: string | undefined
  error: string
  loading: boolean
  setError: (error: string) => void
  setLoading: (loading: boolean) => void
}

interface UseVerifyEmailFormProps {
  onSuccess: () => void
}

export const useVerifyEmailForm = ({ onSuccess }: UseVerifyEmailFormProps): UseVerifyEmailForm => {
  const { signUp, fetchStatus } = useSignUp()
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(fetchStatus === 'fetching')
  const router = useRouter()

  const form = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      otp: '',
    },
  })

  const handleSubmit = async (data: VerifyOtpFormValues) => {
    if (!signUp) return

    setLoading(true)
    setError('')

    try {
      // Verify the email code
      const res = await signUp.verifications.verifyEmailCode({ code: data.otp })
      if (res.error) {
        setError(transformClerkError(res, 'Failed to verify email. Please try again.'))
        setLoading(false)
        return
      }

      // Finalize the sign-up process
      if (signUp.status === 'complete') {
        await signUp.finalize({
          navigate: async ({ decorateUrl }) => {
            const url = decorateUrl('/onboarding?redirect=true')
            router.push(url)
            onSuccess()
          },
        })
      }
    } catch (err) {
      setError(transformClerkError(err, 'Failed to verify email. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return {
    handleSubmit: form.handleSubmit(handleSubmit),
    control: form.control,
    formError: form.formState.errors.otp?.message,
    error,
    loading,
    setError,
    setLoading,
  }
}
