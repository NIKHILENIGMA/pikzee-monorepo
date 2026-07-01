import { createParamDecorator, type ExecutionContext } from '@nestjs/common'

import { type AuthenticatedRequest } from '../guards/clerk-guard.guard'

type CurrentUserKey = 'userId'

export const CurrentUser = createParamDecorator(
  (data: CurrentUserKey | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>()
    if (!request.userId) {
      return null
    }

    if (!data) {
      return request.userId
    }

    return request[data] ?? null
  },
)
