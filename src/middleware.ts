import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Route protection middleware.
 * - Public routes: /login, /signup, /forgot-password, /reset-password, /auth/callback, /invite
 * - Redirects unauthenticated visitors to /login
 * - Redirects authenticated users away from login/signup based on role + onboarding state
 * - Enforces role-based access: clients cannot access /freelancer, freelancers cannot access /client
 * - Redirects users with incomplete onboarding to /onboarding
 */
export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // Public routes
  const publicRoutes = ['/login', '/signup', '/auth/callback', '/invite', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // No session + protected route → login
  if (!user && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user) {
    // Single profile fetch serves both the login/signup branch and the
    // role-based protection branch below.
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, onboarding_completed')
      .eq('id', user.id)
      .maybeSingle();

    // Has session + on login/signup → redirect based on role
    if (pathname === '/login' || pathname === '/signup') {
      if (!profile?.onboarding_completed) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
      const redirectPath = profile?.role === 'client' ? '/client/workspace' : '/freelancer/dashboard';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Role-based route protection
    if (pathname.startsWith('/freelancer') && profile?.role === 'client') {
      return NextResponse.redirect(new URL('/client/workspace', request.url));
    }
    if (pathname.startsWith('/client') && profile?.role === 'freelancer') {
      return NextResponse.redirect(new URL('/freelancer/dashboard', request.url));
    }

    // Incomplete onboarding trying to access the app
    if (!profile?.onboarding_completed && !pathname.startsWith('/onboarding') && !isPublicRoute) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
