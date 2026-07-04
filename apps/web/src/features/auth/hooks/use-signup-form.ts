import { useSignUp } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, type Control } from 'react-hook-form'

import { signUpSchema, type SignUpFormValues } from '@pikzee/shared-types'

import { transformClerkError } from '../lib/clerk-error'

interface UseSignUpForm {
  handleSubmit: () => Promise<void>
  control: Control<SignUpFormValues>
  error: string
  loading: boolean
  setError: (error: string) => void
  setLoading: (loading: boolean) => void
}

interface UseSignUpFormProps {
  onRequireVerification: (email: string) => void
}

export const useSignUpForm = ({ onRequireVerification }: UseSignUpFormProps): UseSignUpForm => {
  const { signUp } = useSignUp()
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  })

  const handleSubmit = async (data: SignUpFormValues) => {
    if (!signUp) return

    setLoading(true)
    setError('')

    try {
      // Create a new user with the provided email and password
      const res = await signUp.password({
        emailAddress: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      })

      if (res.error) {
        setError(
          transformClerkError(res, 'Failed to sign up. Please check your details and try again.'),
        )
        setLoading(false)
        return
      }

      // Send the user verification email code
      const verifyRes = await signUp.verifications.sendEmailCode()
      if (verifyRes.error) {
        setError(
          transformClerkError(verifyRes, 'Failed to send verification email. Please try again.'),
        )
        setLoading(false)
        return
      }

      onRequireVerification(data.email)
    } catch (err) {
      setError(transformClerkError(err, 'Failed to sign up. Please try again.'))
    }
  }

  return {
    handleSubmit: form.handleSubmit(handleSubmit),
    control: form.control,
    error,
    loading,
    setError,
    setLoading,
  }
}
