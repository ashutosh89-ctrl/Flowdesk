import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/utils/session';

// Simple in-memory rate limiter for localhost/Edge requests
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string, maxRequests: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (record.count >= maxRequests) {
    return true;
  }

  record.count++;
  return false;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';

  // Rate limit auth routes: 5 requests per minute
  if (path.startsWith('/api/auth/')) {
    if (isRateLimited(ip, 5, 60000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
  }

  // Rate limit general API routes: 100 requests per minute
  if (path.startsWith('/api/') && !path.startsWith('/api/auth/')) {
    if (isRateLimited(ip, 100, 60000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please slow down.' },
        { status: 429 }
      );
    }
  }

  // Public routes — no session required
  const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/invite', '/api/auth/login', '/api/auth/signup'];
  if (publicPaths.some(p => path.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow API routes to handle their own auth checks
  if (path.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check session cookie for protected page routes
  const sessionCookie = request.cookies.get('session')?.value;
  const user = sessionCookie ? await verifySession(sessionCookie) : null;

  // No session → redirect to login
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  // Role gating for pages
  if (path.startsWith('/freelancer') && user.role !== 'freelancer') {
    return NextResponse.redirect(new URL('/client/workspace', request.url));
  }
  if (path.startsWith('/client') && user.role !== 'client') {
    return NextResponse.redirect(new URL('/freelancer/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
