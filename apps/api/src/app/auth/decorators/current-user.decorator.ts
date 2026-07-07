import { createParamDecorator, UnauthorizedException, type ExecutionContext } from '@nestjs/common'

import { type AuthenticatedRequest } from '../guards/clerk-guard.guard'

type CurrentUserKey = 'userId' | 'clerkId'

export const CurrentUser = createParamDecorator(
  (data: CurrentUserKey, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>()
    const user = request.user

    // If the user is not authenticated, return null
    if (!user) {
      throw new UnauthorizedException('User is not authenticated')
    }

    return user[data] ?? null
  },
)
