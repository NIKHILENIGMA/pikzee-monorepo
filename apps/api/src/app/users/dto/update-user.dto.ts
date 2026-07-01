import { createZodDto } from 'nestjs-zod'

import { UpdateUserSchema } from '@pikzee/shared-types'

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
