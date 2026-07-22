import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/utils/session';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Public routes — no auth needed
  const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/invite'];
  if (publicPaths.some(p => path.startsWith(p))) {
    return NextResponse.next();
  }
  
  // Check session cookie
  const sessionCookie = request.cookies.get('session')?.value;
  const user = sessionCookie ? await verifySession(sessionCookie) : null;
  
  // No session → redirect to login
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }
  
  // Role gating
  if (path.startsWith('/freelancer') && user.role !== 'freelancer') {
    return NextResponse.redirect(new URL('/client/workspace', request.url));
  }
  if (path.startsWith('/client') && user.role !== 'client') {
    return NextResponse.redirect(new URL('/freelancer/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)']
};
