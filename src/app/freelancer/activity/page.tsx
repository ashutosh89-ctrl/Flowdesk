import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/utils/session';
import ActivityClient from '@/components/activity/ActivityClient';

export default async function ActivityPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  
  const user = sessionCookie ? await verifySession(sessionCookie) : null;
  if (!user) redirect('/login');
  
  return <ActivityClient />;
}
