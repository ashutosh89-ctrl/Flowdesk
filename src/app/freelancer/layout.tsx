import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/utils/session';
import FreelancerLayoutClient from '@/components/layout/FreelancerLayoutClient';

export default async function FreelancerLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  
  const sessionUser = sessionCookie ? await verifySession(sessionCookie) : null;
  if (!sessionUser) {
    redirect('/login');
  }
  
  if (sessionUser.role !== 'freelancer') {
    redirect('/client/workspace');
  }
  
  return <FreelancerLayoutClient>{children}</FreelancerLayoutClient>;
}
