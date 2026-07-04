import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { type ChangeEvent, useState } from 'react'

import { transformClerkError } from '../lib/clerk-error'

interface UseVerifyEmailForm {
  code: string
  setCode: (code: string) => void
  handleSubmit: (e: ChangeEvent<HTMLFormElement>) => Promise<void>
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
  const [code, setCode] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(fetchStatus === 'fetching')
  const router = useRouter()

  const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()

    setLoading(true)
    setError('')

    try {
      // Verify the email code
      const res = await signUp.verifications.verifyEmailCode({ code })
      if (res.error) {
        setError(transformClerkError(res, 'Failed to verify email. Please try again.'))
        setLoading(false)
        return
      }

      // Finalize the sign-up process
      if (signUp.status === 'complete') {
        await signUp.finalize({
          navigate: async ({ decorateUrl }) => {
            const url = decorateUrl('/dashboard')
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
    code,
    setCode,
    handleSubmit,
    error,
    loading,
    setError,
    setLoading,
  }
}
