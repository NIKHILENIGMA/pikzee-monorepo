import { createParamDecorator, type ExecutionContext } from '@nestjs/common'

import { type AuthenticatedRequest } from '../guards/clerk-guard.guard'

type CurrentUserKey = 'userId' | 'clerkId'

export const CurrentUser = createParamDecorator(
  (data: CurrentUserKey | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>()
    const user = request.user
    if (!user) {
      return null
    }
    if (!data) {
      return user
    }
    return user[data] ?? null
  },
)
