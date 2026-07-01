import { createZodDto } from 'nestjs-zod'

import { UserResponseSchema } from '@pikzee/shared-types'

export class UserResponseDto extends createZodDto(UserResponseSchema) {}
