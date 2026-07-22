import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import InviteClient from '@/components/invite/InviteClient';

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || 'dev-secret-change-in-production');

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  
  // If already logged in, redirect to workspace
  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, SECRET, { clockTolerance: 60 });
      const user = payload as { id: string; email: string; role: string };
      redirect(user.role === 'freelancer' ? '/freelancer/dashboard' : '/client/workspace');
    } catch {
      // Invalid session, continue to invite
    }
  }
  
  return (
    <InviteClient token={token} />
  );
}
