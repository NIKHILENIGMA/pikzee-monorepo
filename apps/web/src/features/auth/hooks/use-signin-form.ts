import { useSignIn } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { type SignInFormValues, signInSchema } from '@pikzee/shared-types'

import { transformClerkError } from '../lib/clerk-error'

export const useSignInForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { signIn } = useSignIn()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleSubmit = async (data: SignInFormValues) => {
    if (!signIn) return

    setLoading(true)
    setError('')

    try {
      // Attempt to sign in the user with the provided email and password
      const res = await signIn.password({
        identifier: data.email,
        password: data.password,
      })

      if (res.error) {
        setError(
          transformClerkError(
            res,
            'Failed to sign in. Please check your credentials and try again.',
          ),
        )
        setLoading(false)
        return
      }

      // Redirect or perform any other action upon successful sign-in
      if (signIn.status === 'complete') {
        await signIn.finalize({
          navigate: async ({ decorateUrl }) => {
            router.push(decorateUrl('/dashboard'))
          },
        }) // Finalize the sign-in process
      }

      onSuccess()
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
    setError,
    setLoading,
  }
}
