import z from 'zod'

import { roles } from '@pikzee/shared-db'

export const WorkspaceSchema = z.object({
  id: z.uuid({ message: 'Workspace ID must be a valid UUID' }),
  name: z
    .string()
    .max(150, { message: 'Workspace name must not exceed 150 characters' })
    .min(1, { message: 'Workspace name must be at least 1 character long' }),
  slug: z.string().max(150, { message: 'Workspace slug must not exceed 150 characters' }),
  logoUrl: z.url({ message: 'Workspace logo URL is required' }).optional(),
  ownerId: z.uuid({ message: 'Owner ID must be a valid UUID' }),
  createdAt: z.date({ message: 'Created at must be a valid date' }),
  updatedAt: z.date({ message: 'Updated at must be a valid date' }),
})

export type Workspace = z.infer<typeof WorkspaceSchema>

export const CreateWorkspaceSchema = WorkspaceSchema.omit({
  id: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateWorkspaceDto = z.infer<typeof CreateWorkspaceSchema>

export const UpdateWorkspaceSchema = WorkspaceSchema.partial()

export type UpdateWorkspaceDto = z.infer<typeof UpdateWorkspaceSchema>

export const WorkspaceResponseSchema = WorkspaceSchema.meta({
  id: 'WorkspaceResponseSchema',
})

export type WorkspaceResponseDto = z.infer<typeof WorkspaceResponseSchema>

// -------------------------------------------------------------------------------------------------------

export const WorkspaceMemberSchema = z.object({
  id: z.uuid({ message: 'Workspace member ID must be a valid UUID' }),
  workspaceId: z.uuid({ message: 'Workspace ID must be a valid UUID' }),
  userId: z.uuid({ message: 'User ID must be a valid UUID' }),
  role: z.enum(roles, { message: 'Role must be either ADMIN or MEMBER' }),
  createdAt: z.date({ message: 'Created at must be a valid date' }),
  updatedAt: z.date({ message: 'Updated at must be a valid date' }),
})

export type WorkspaceMember = z.infer<typeof WorkspaceMemberSchema>

export const CreateWorkspaceMemberSchema = WorkspaceMemberSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateWorkspaceMemberDto = z.infer<typeof CreateWorkspaceMemberSchema>

export const UpdateWorkspaceMemberSchema = WorkspaceMemberSchema.partial()

export type UpdateWorkspaceMemberDto = z.infer<typeof UpdateWorkspaceMemberSchema>

export const WorkspaceMemberResponseSchema = WorkspaceMemberSchema.meta({
  id: 'WorkspaceMemberResponseSchema',
})

export type WorkspaceMemberResponseDto = z.infer<typeof WorkspaceMemberResponseSchema>
