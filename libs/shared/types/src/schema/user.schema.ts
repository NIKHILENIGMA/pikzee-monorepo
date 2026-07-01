import z from 'zod'

export const UserSchema = z.object({
  id: z.uuid(),
  clerkId: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.email(),
  avatarImage: z.url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

/**
 * User type representing the structure of a user object.
 */
export type User = z.infer<typeof UserSchema>

export const CreateUserSchema = UserSchema.omit({ id: true, createdAt: true, updatedAt: true })

/**
 * CreateUserDto type representing the structure of a user object for creation.
 */
export type CreateUserDto = z.infer<typeof CreateUserSchema>

export const UpdateUserSchema = UserSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

/**
 * UpdateUserDto type representing the structure of a user object for updates.
 */
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>
