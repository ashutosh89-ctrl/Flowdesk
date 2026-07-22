import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import FreelancerLayoutClient from '@/components/layout/FreelancerLayoutClient';

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || 'dev-secret-change-in-production');

export default async function FreelancerLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  
  if (!sessionCookie) {
    redirect('/login');
  }
  
  try {
    const { payload } = await jwtVerify(sessionCookie, SECRET, { clockTolerance: 60 });
    const sessionUser = payload as { id: string; email: string; role: string };
    
    if (sessionUser.role !== 'freelancer') {
      redirect('/client/workspace');
    }
  } catch {
    redirect('/login');
  }
  
  return <FreelancerLayoutClient>{children}</FreelancerLayoutClient>;
}
