import { z } from 'zod'

export const webEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url().default('http://localhost:3000'),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'Clerk Publishable Key is required'),
})

export type WebEnv = z.infer<typeof webEnvSchema>

export function parseWebEnv(env: Record<string, unknown> = process.env): WebEnv {
  const parsed = webEnvSchema.safeParse(env)
  if (!parsed.success) {
    console.error('❌ Invalid Web Environment Variables:', parsed.error.format())
    throw new Error('Invalid Web Environment Variables')
  }
  return parsed.data
}
