import z from 'zod'

export const signUpSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and privacy policy',
  }),
})

export type SignUpFormValues = z.infer<typeof signUpSchema>

export const signInSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
})

export type SignInFormValues = z.infer<typeof signInSchema>

export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .length(6, { message: 'Invalid OTP' })
    .regex(/^\d+$/, { message: 'OTP must be numbers only' }),
})

export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export const forgotPasswordVerifySchema = z
  .object({
    code: z
      .string()
      .length(6, { message: 'Verification code must be exactly 6 digits' })
      .regex(/^\d+$/, { message: 'Verification code must be numbers only' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z
      .string()
      .min(6, { message: 'Password confirmation must be at least 6 characters' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type ForgotPasswordVerifyFormValues = z.infer<typeof forgotPasswordVerifySchema>
