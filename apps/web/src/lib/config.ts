import { z } from 'zod'

const webEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url().default('http://localhost:4000/api'),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'Clerk Publishable Key is required'),
})

const parsed = webEnvSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
})

if (!parsed.success) {
  console.error('❌ Invalid Web Environment Variables:', parsed.error.format())
  throw new Error('Invalid Web Environment Variables')
}

export const env = parsed.data
