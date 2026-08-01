'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { useApp } from '@/components/AppContext';
import { createClient } from '@/lib/supabase/client';

export default function OnboardingClient() {
  const router = useRouter();
  const { user, setUser, addToast } = useApp();
  const [step, setStep] = useState(1);

  const handleComplete = async (profileData: any) => {
    if (!user) return;

    try {
      const supabase = createClient();

      // Mark user as onboarded in the profiles table (upsert so the row always
      // exists even if the email-verification callback never fired)
      const { data: updated, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          name: profileData?.name || user.name,
          avatar_url: profileData?.avatar || user.avatar || null,
          role: user.role,
          plan: user.plan,
          onboarding_completed: true,
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      if (updated) {
        setUser({
          ...user,
          name: updated.name ?? user.name,
          avatar: updated.avatar_url ?? user.avatar,
          onboarded: true,
        });
      } else {
        setUser({ ...user, onboarded: true });
      }

      addToast('Onboarding completed! Welcome to FlowDesk.', 'success');

      router.push(user.role === 'freelancer' ? '/freelancer/dashboard' : '/client/workspace');
      router.refresh();
    } catch (e) {
      addToast('Failed to save profile configurations', 'warning');
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <OnboardingWizard
        step={step}
        onStepChange={setStep}
        onComplete={handleComplete}
      />
    </div>
  );
}
