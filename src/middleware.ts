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

  // Rate limit auth routes: 15 requests per minute (slightly higher to avoid rate limiting dev/testing)
  if (path.startsWith('/api/auth/')) {
    if (isRateLimited(ip, 15, 60000)) {
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

  // Handle redirect from /client/portal alias to /client/workspace
  if (path === '/client/portal' || path.startsWith('/client/portal/')) {
    return NextResponse.redirect(new URL(path.replace('/client/portal', '/client/workspace'), request.url));
  }

  // Check session cookie
  const sessionCookie = request.cookies.get('session')?.value;
  const user = sessionCookie ? await verifySession(sessionCookie) : null;

  // Public routes — if already logged in and on /login or /signup, redirect to dashboard
  const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/invite', '/auth/callback', '/api/auth/login', '/api/auth/signup'];
  const isAuthPage = path === '/login' || path === '/signup';

  if (isAuthPage && user) {
    const redirectPath = user.role === 'client' ? '/client/workspace' : '/freelancer/dashboard';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if (publicPaths.some(p => path.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow API routes to handle their own auth checks
  if (path.startsWith('/api/')) {
    return NextResponse.next();
  }

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

