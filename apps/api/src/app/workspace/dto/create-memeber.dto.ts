import { createZodDto } from 'nestjs-zod'

import { CreateWorkspaceMemberSchema } from '@pikzee/shared-types'

export class CreateWorkspaceMemberDto extends createZodDto(CreateWorkspaceMemberSchema) {}
