'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { useApp } from '@/components/AppContext';
import { update } from '@/lib/services/dataService';
import { User } from '@/lib/types';

export default function OnboardingClient() {
  const { user, setUser, addToast, refreshClients } = useApp();
  const [step, setStep] = useState(1);

  const handleComplete = async (profileData: any) => {
    if (!user) return;
    
    try {
      // Mark user as onboarded
      const updatedUser = await update<User>('users', user.id, { 
        ...profileData, 
        onboarded: true 
      });
      
      if (updatedUser) {
        setUser(updatedUser);
      }
      
      addToast('Onboarding completed! Welcome to FlowDesk.', 'success');
      
      // Hard navigate to ensure fresh auth state
      window.location.href = user.role === 'freelancer' 
        ? '/freelancer/dashboard' 
        : '/client/workspace';
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
