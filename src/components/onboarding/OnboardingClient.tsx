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
    try {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        addToast('Not authenticated. Redirecting to login...', 'warning');
        router.push('/login');
        return;
      }

      const userRole = authUser.user_metadata?.role || user?.role || 'freelancer';
      const userName = profileData?.name || user?.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User';
      const userAvatar = profileData?.avatar || user?.avatar || null;

      // Mark user as onboarded in the profiles table
      const { data: updated, error } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.id,
          email: authUser.email,
          name: userName,
          avatar_url: userAvatar,
          role: userRole,
          plan: 'free',
          onboarding_completed: true,
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      // Create default settings rows if missing
      await supabase.from('business_settings').upsert({ user_id: authUser.id });
      await supabase.from('notification_settings').upsert({ user_id: authUser.id });
      await supabase.from('workspace_preferences').upsert({ user_id: authUser.id });
      await supabase.from('subscriptions').upsert({ user_id: authUser.id, plan: 'free', status: 'active' });

      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: updated?.name ?? userName,
        avatar: updated?.avatar_url ?? userAvatar,
        role: userRole as 'freelancer' | 'client',
        plan: 'free',
        onboarded: true,
        createdAt: new Date().toISOString(),
      });

      addToast('Onboarding completed! Welcome to FlowDesk.', 'success');

      const redirectPath = userRole === 'client' ? '/client/workspace' : '/freelancer/dashboard';
      router.push(redirectPath);
      setTimeout(() => {
        if (window.location.pathname.includes('/onboarding')) {
          window.location.href = redirectPath;
        }
      }, 400);
    } catch (e: any) {
      console.error('Onboarding completion error:', e);
      addToast(e.message || 'Failed to save profile configurations', 'warning');
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
