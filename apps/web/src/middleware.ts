import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/', '/pricing', '/about', '/api/webhooks(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  // 1. If logged in and trying to access ANY public route (excluding webhook APIs)
  if (userId && isPublicRoute(req) && !req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // 2. If NOT logged in and trying to access a protected route
  if (!userId && !isPublicRoute(req)) {
    const url = new URL('/', req.url)
    url.searchParams.set('show-signin', 'true')
    url.searchParams.set('redirect_url', req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
