import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, extractToken } from './lib/auth'

const requestCounts = new Map<string, { count: number; resetTime: number }>()
export const runtime = 'nodejs';
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || 'unknown'
}

function isRateLimited(ip: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = requestCounts.get(ip)

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs })
    return false
  }

  if (record.count >= limit) {
    return true
  }

  record.count++
  return false
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const ip = getClientIp(request)

  console.log(`[${new Date().toISOString()}] ${request.method} ${pathname} - IP: ${ip}`)

  if (isRateLimited(ip)) {
    console.warn(`Rate limit exceeded for IP: ${ip}`)
    return NextResponse.json(
      {
        success: false,
        error: 'Too many requests',
        code: 429,
      },
      { status: 429 }
    )
  }

  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  const authHeader = request.headers.get('authorization')
  const token = extractToken(authHeader)

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: 'Token not provided',
        code: 401,
      },
      { status: 401 }
    )
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid or expired token',
        code: 401,
      },
      { status: 401 }
    )
  }

  if (pathname.startsWith('/api/users')) {
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required',
          code: 403,
        },
        { status: 403 }
      )
    }
  }

  if (request.method === 'DELETE') {
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin access required for delete operations',
          code: 403,
        },
        { status: 403 }
      )
    }
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', decoded.id)
  requestHeaders.set('x-user-email', decoded.email)
  requestHeaders.set('x-user-role', decoded.role)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    '/api/users/:path*',
    '/api/students/:path*',
    '/api/courses/:path*',
    '/api/enrollments/:path*',
  ],
}