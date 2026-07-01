import z from 'zod'

export const ClerkWebhookType = z.enum(['user.created', 'user.updated', 'user.deleted'])

export type ClerkWebhookType = z.infer<typeof ClerkWebhookType>

export const ClerkWebhookDataSchema = z.object({
  id: z.string(),
  email_addresses: z
    .array(
      z.object({
        id: z.string(),
        email_address: z.email(),
      }),
    )
    .optional(),
  primary_email_address_id: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  image_url: z.string().url().optional(),
})

export type ClerkWebhookData = z.infer<typeof ClerkWebhookDataSchema>

export const ClerkWebhookEventSchema = z.object({
  type: ClerkWebhookType,
  data: ClerkWebhookDataSchema,
})

export type ClerkWebhookEvent = z.infer<typeof ClerkWebhookEventSchema>
