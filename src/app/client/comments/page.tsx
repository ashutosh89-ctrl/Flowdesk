import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/utils/session';
import CommentsClient from '@/components/comments/CommentsClient';

export default async function CommentsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  
  const user = sessionCookie ? await verifySession(sessionCookie) : null;
  if (!user) redirect('/login');
  if (user.role !== 'client') redirect('/freelancer/dashboard');
  
  return <CommentsClient />;
}
