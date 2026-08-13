import { SetMetadata } from '@nestjs/common'

export const ALLOW_SELF_KEY = 'allow_self'
/**
 * Bypasses the required permissions check if the `memberId` parameter in the route
 * matches the ID of the currently authenticated member making the request.
 * Useful for endpoints like `DELETE /members/:memberId` where a user can remove themselves.
 */
export const AllowSelf = () => SetMetadata(ALLOW_SELF_KEY, true)
