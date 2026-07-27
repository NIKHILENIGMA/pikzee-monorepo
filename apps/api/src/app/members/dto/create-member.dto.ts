import { createZodDto } from 'nestjs-zod'

import { CreateWorkspaceMemberSchema } from '@pikzee/shared-types'

export class CreateMemberDto extends createZodDto(CreateWorkspaceMemberSchema) {}
