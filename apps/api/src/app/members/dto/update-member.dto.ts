import { createZodDto } from 'nestjs-zod'

import { UpdateWorkspaceMemberSchema } from '@pikzee/shared-types'

export class UpdateMemberDto extends createZodDto(UpdateWorkspaceMemberSchema) {}
