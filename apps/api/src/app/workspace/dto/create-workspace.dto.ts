import { createZodDto } from 'nestjs-zod'

import { CreateWorkspaceSchema } from '@pikzee/shared-types'

export class CreateWorkspaceDto extends createZodDto(CreateWorkspaceSchema) {}
