import { redirect } from 'next/navigation';
import { getSession } from '@/lib/supabase/server';
import ActivityClient from '@/components/activity/ActivityClient';

export default async function ActivityPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return <ActivityClient />;
}
