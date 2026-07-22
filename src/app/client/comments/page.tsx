import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import CommentsClient from '@/components/comments/CommentsClient';

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || 'dev-secret-change-in-production');

export default async function CommentsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  if (!sessionCookie) redirect('/login');
  
  try {
    const { payload } = await jwtVerify(sessionCookie, SECRET, { clockTolerance: 60 });
    const user = payload as { id: string; email: string; role: string };
    if (user.role !== 'client') redirect('/freelancer/dashboard');
  } catch {
    redirect('/login');
  }
  
  return <CommentsClient />;
}
