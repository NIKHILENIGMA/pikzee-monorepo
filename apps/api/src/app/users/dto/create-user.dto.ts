import { createZodDto } from 'nestjs-zod'

import { CreateUserSchema } from '@pikzee/shared-types'

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
