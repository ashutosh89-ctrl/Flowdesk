import { getSession } from '@/lib/utils/session';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role === 'client') {
    redirect('/client/workspace');
  } else {
    redirect('/freelancer/dashboard');
  }
}
