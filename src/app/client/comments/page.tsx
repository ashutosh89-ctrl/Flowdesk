import { redirect } from 'next/navigation';
import { getSession } from '@/lib/supabase/server';
import CommentsClient from '@/components/comments/CommentsClient';

export default async function CommentsPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== 'client') redirect('/freelancer/dashboard');

  return <CommentsClient />;
}
