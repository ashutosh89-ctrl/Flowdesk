import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import ActivityClient from '@/components/activity/ActivityClient';

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || 'dev-secret-change-in-production');

export default async function ActivityPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  if (!sessionCookie) redirect('/login');
  
  try {
    await jwtVerify(sessionCookie, SECRET, { clockTolerance: 60 });
  } catch {
    redirect('/login');
  }
  
  return <ActivityClient />;
}
