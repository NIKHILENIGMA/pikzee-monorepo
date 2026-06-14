import { z } from 'zod'

export const apiEnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url('Invalid Database URL'),
  REDIS_URL: z.string().url('Invalid Redis URL').optional(),
  CLERK_SECRET_KEY: z.string().min(1, 'Clerk Secret Key is required'),
})

export type ApiEnv = z.infer<typeof apiEnvSchema>

export function parseApiEnv(env: Record<string, unknown> = process.env): ApiEnv {
  const parsed = apiEnvSchema.safeParse(env)
  if (!parsed.success) {
    console.error('❌ Invalid API Environment Variables:', parsed.error.format())
    throw new Error('Invalid API Environment Variables')
  }
  return parsed.data
}
