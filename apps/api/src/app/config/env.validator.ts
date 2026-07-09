import { z } from 'zod'

export const apiEnvSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.url('Invalid Database URL'),
  REDIS_URL: z.url('Invalid Redis URL').optional(),
  CLERK_SECRET_KEY: z.string().min(1, 'Clerk Secret Key is required'),
  CLERK_WEBHOOK_SECRET: z.string().min(1, 'Clerk Webhook Secret is required'),
  CLERK_PUBLISHABLE_KEY: z.string().min(1, 'Clerk Publishable Key is required'),
  CLERK_JWT_KEY: z.string().optional(),
})

export type ApiEnv = z.infer<typeof apiEnvSchema>

export function validateApiEnv(config: Record<string, unknown>): ApiEnv {
  const parsed = apiEnvSchema.safeParse(config)
  if (!parsed.success) {
    console.error('❌ Invalid API Environment Variables:', parsed.error.format())
    throw new Error('Invalid API Environment Variables')
  }
  return parsed.data
}
