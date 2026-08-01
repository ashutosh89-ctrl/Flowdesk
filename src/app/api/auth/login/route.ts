import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createSession } from '@/lib/utils/session';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { token, user } = body;

  let sessionToken: string | null = null;

  // Preferred: build the session server-side from the user payload.
  // This is the only place that knows the real SESSION_SECRET, so the JWT
  // can be verified by middleware, layouts, and API routes afterwards.
  const allowedRoles = ['freelancer', 'client'];
  const isUserPayloadValid =
    user &&
    typeof user.id === 'string' &&
    user.id.length > 0 &&
    typeof user.email === 'string' &&
    user.email.length > 0 &&
    typeof user.role === 'string' &&
    allowedRoles.includes(user.role);

  if (isUserPayloadValid) {
    sessionToken = await createSession({
      id: user.id,
      email: user.email,
      role: user.role,
      onboarded: user.onboarded ?? true,
    });
  } else if (typeof token === 'string' && token.length > 0) {
    // Legacy: accept a pre-generated token (e.g. from older clients).
    sessionToken = token;
  }

  if (!sessionToken) {
    return NextResponse.json({ error: 'Invalid session payload' }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set('session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });

  return NextResponse.json({ success: true, token: sessionToken });
}
