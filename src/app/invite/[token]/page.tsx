import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/utils/session';
import InviteClient from '@/components/invite/InviteClient';

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  
  // If already logged in, redirect to workspace
  if (sessionCookie) {
    const user = await verifySession(sessionCookie);
    if (user) {
      redirect(user.role === 'freelancer' ? '/freelancer/dashboard' : '/client/workspace');
    }
  }
  
  return (
    <InviteClient token={token} />
  );
}
