import { redirect } from 'next/navigation';
import { getSession } from '@/lib/supabase/server';
import FreelancerLayoutClient from '@/components/layout/FreelancerLayoutClient';

export default async function FreelancerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'freelancer') {
    redirect('/client/workspace');
  }

  return <FreelancerLayoutClient>{children}</FreelancerLayoutClient>;
}
