import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import OnboardingClient from '@/components/onboarding/OnboardingClient';

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || 'dev-secret-change-in-production');

export default async function OnboardingPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  
  if (!sessionCookie) {
    redirect('/login');
  }
  
  let onboarded = false;
  let role = 'freelancer';
  try {
    const { payload } = await jwtVerify(sessionCookie, SECRET, { clockTolerance: 60 });
    const user = payload as { id: string; email: string; role: string; onboarded?: boolean };
    onboarded = user.onboarded || false;
    role = user.role;
    
    // If already onboarded, skip to dashboard
    if (onboarded) {
      redirect(role === 'freelancer' ? '/freelancer/dashboard' : '/client/workspace');
    }
  } catch {
    redirect('/login');
  }
  
  return (
    <div className="min-h-screen bg-[#B8B5B0] relative overflow-hidden flex items-center justify-center py-12">
      {/* Decorative Blobs */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-white/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-white/20 rounded-full blur-3xl pointer-events-none" />

      <OnboardingClient />
    </div>
  );
}
