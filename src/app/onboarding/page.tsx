import { redirect } from 'next/navigation';
import { getSession } from '@/lib/supabase/server';
import OnboardingClient from '@/components/onboarding/OnboardingClient';

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  // If already onboarded, skip to dashboard
  if (session.onboarded) {
    redirect(session.role === 'freelancer' ? '/freelancer/dashboard' : '/client/workspace');
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
