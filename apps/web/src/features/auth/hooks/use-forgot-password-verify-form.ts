import { useSignIn } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  type ForgotPasswordVerifyFormValues,
  forgotPasswordVerifySchema,
} from '@pikzee/shared-types'

import { transformClerkError } from '../lib/clerk-error'

export const useForgotPasswordVerifyForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { signIn } = useSignIn()
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [timer, setTimer] = useState<number>(10)
  const router = useRouter()

  // Countdown timer for resending code
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const form = useForm<ForgotPasswordVerifyFormValues>({
    resolver: zodResolver(forgotPasswordVerifySchema),
    defaultValues: {
      code: '',
      password: '',
      confirmPassword: '',
    },
  })

  const handleSubmit = async (data: ForgotPasswordVerifyFormValues) => {
    if (!signIn) return

    setLoading(true)
    setError('')

    try {
      // 1. Verify code
      const verifyRes = await signIn.resetPasswordEmailCode.verifyCode({
        code: data.code,
      })

      if (verifyRes.error) {
        setError(transformClerkError(verifyRes, 'Invalid or expired code.'))
        setLoading(false)
        return
      }

      // 2. Submit new password
      const resetRes = await signIn.resetPasswordEmailCode.submitPassword({
        password: data.password,
        signOutOfOtherSessions: true,
      })

      if (resetRes.error) {
        setError(transformClerkError(resetRes, 'Failed to update password.'))
        setLoading(false)
        return
      }

      if (signIn.status === 'complete') {
        await signIn.finalize({
          navigate: async ({ decorateUrl }) => {
            router.push(decorateUrl('/dashboard'))
          },
        })
        onSuccess()
      } else {
        setError('Password reset requires additional steps or MFA.')
      }
    } catch (err) {
      setError(transformClerkError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!signIn) return

    setLoading(true)
    setError('')

    try {
      const resendRes = await signIn.resetPasswordEmailCode.sendCode()

      if (resendRes.error) {
        setError(transformClerkError(resendRes, 'Failed to resend code.'))
        setLoading(false)
        return
      }
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
    handleResendCode,
    timer,
  }
}
