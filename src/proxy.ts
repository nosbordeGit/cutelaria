import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession, SESSION_COOKIE } from '@/lib/auth'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const isAuthenticated = token ? await verifySession(token) : false

  const isDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/')
  const isLogin = pathname === '/login'

  if (isDashboard && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isLogin && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*', '/login'],
}
