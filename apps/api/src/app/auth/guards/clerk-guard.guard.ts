import { createClerkClient, AuthObject } from '@clerk/backend'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'

type AuthenticatedRequest = Request & { user?: AuthObject }

@Injectable()
export class ClerkGuard implements CanActivate {
  private clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  })

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const token = this.extractTokenFromRequest(request)
    if (!token) {
      return false
    }

    try {
      const session = await this.clerk.authenticateRequest(request)
      if (session.isAuthenticated) {
        request.user = session.toAuth()
        return true
      }
      return false
    } catch (_error) {
      return false
    }
  }

  private extractTokenFromRequest(request: Request): string | null {
    const authHeader = request.headers['authorization'] || request.headers['Authorization']
    const headerString = Array.isArray(authHeader) ? authHeader[0] : authHeader
    const [type, token] = headerString?.split(' ') ?? []
    if (type !== 'Bearer' || !token) {
      return null
    }

    return token
  }
}
