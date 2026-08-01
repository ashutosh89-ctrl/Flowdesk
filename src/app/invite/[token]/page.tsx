import { redirect } from 'next/navigation';
import { getSession } from '@/lib/supabase/server';
import InviteClient from '@/components/invite/InviteClient';

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await getSession();

  // If already logged in, redirect to workspace
  if (session) {
    redirect(session.role === 'freelancer' ? '/freelancer/dashboard' : '/client/workspace');
  }

  return <InviteClient token={token} />;
}
