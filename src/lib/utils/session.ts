import { SignJWT, jwtVerify } from 'jose';

const secretKey = process.env.SESSION_SECRET || 'flowdesk-production-256bit-session-secret-key-at-least-32-chars';
if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  console.warn('[SECURITY WARNING] SESSION_SECRET environment variable is missing. Using default fallback key.');
}
const SECRET = new TextEncoder().encode(secretKey);

export async function createSession(user: { id: string; email: string; role: string; onboarded?: boolean }) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(SECRET);
  return token;
}

export async function verifySession(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET, { clockTolerance: 60 });
    return payload as unknown as { id: string; email: string; role: string; onboarded?: boolean };
  } catch {
    return null;
  }
}

export async function getSession() {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return null;
    return await verifySession(token);
  } catch (e) {
    return null;
  }
}
