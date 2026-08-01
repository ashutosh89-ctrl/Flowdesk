import { redirect } from 'next/navigation';
import { getSession } from '@/lib/supabase/server';
import ClientLayoutClient from '@/components/layout/ClientLayoutClient';

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'client') {
    redirect('/freelancer/dashboard');
  }

  return <ClientLayoutClient>{children}</ClientLayoutClient>;
}
