import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard', '/admin']

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtected = PROTECTED_ROUTES.some(r => path.startsWith(r))

  if (!isProtected) return NextResponse.next()

  const token = req.cookies.get('auth_token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
