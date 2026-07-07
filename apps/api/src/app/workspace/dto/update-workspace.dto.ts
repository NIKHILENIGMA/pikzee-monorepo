import { createZodDto } from 'nestjs-zod'

import { UpdateWorkspaceSchema } from '@pikzee/shared-types'

export class UpdateWorkspaceDto extends createZodDto(UpdateWorkspaceSchema) {}
