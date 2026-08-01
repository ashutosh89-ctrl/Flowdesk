import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/utils/session';
import OnboardingClient from '@/components/onboarding/OnboardingClient';

export default async function OnboardingPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  
  const user = sessionCookie ? await verifySession(sessionCookie) : null;
  if (!user) {
    redirect('/login');
  }
  
  const onboarded = user.onboarded || false;
  const role = user.role;
  
  // If already onboarded, skip to dashboard
  if (onboarded) {
    redirect(role === 'freelancer' ? '/freelancer/dashboard' : '/client/workspace');
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
