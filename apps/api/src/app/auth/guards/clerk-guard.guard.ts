import { createClerkClient } from '@clerk/backend'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'

import { UsersService } from '../../users/users.service'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'

export type AuthenticatedRequest = Request & { user?: { userId: string; clerkId: string } }

@Injectable()
export class ClerkGuard implements CanActivate {
  private clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  })

  constructor(
    private reflector: Reflector,
    private readonly userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic: boolean = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const token = this.extractTokenFromRequest(request)
    if (!token) {
      return false
    }

    try {
      // Construct the full URL of the request
      const protocol: string = request.protocol || 'http'
      const host: string = request.get('host') || 'localhost'
      const url = `${protocol}://${host}${request.originalUrl}`
      const headers: Headers = new Headers()

      // Copy all headers from the original request to the new Request object
      Object.entries(request.headers).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => headers.append(key, v))
        } else if (value !== undefined) {
          headers.set(key, value)
        }
      })

      // Create a new Request object with the original request's method and headers
      const fetchRequest = new Request(url, {
        method: request.method,
        headers,
      })

      const session = await this.clerk.authenticateRequest(fetchRequest, {
        jwtKey: process.env.CLERK_JWT_KEY,
      })

      if (session.isAuthenticated) {
        const clerkId = session.toAuth().userId
        const user = await this.userService.findUserByClerkId(clerkId)

        if (!user) {
          return false
        }

        request.user = { userId: user.id, clerkId: user.clerkId }
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
