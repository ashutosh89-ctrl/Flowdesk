"use client";
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import StepIndicator from './StepIndicator';
import ProfileSetupStep from './ProfileSetupStep';
import CreateClientStep from './CreateClientStep';
import WorkspacePreviewStep from './WorkspacePreviewStep';
import { createClient as createAppClient } from '../../lib/services/clientService';
import { createClient } from '../../lib/supabase/client';

interface OnboardingWizardProps {
  step?: number;
  onStepChange?: (step: number) => void;
  onComplete?: (profileData: any) => void;
}

export default function OnboardingWizard({ step: controlledStep, onStepChange, onComplete }: OnboardingWizardProps) {
  const { user, addToast, refreshClients } = useApp();

  const [internalStep, setInternalStep] = useState(1);
  const step = controlledStep || internalStep;
  const setStep = onStepChange || setInternalStep;

  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '');

  // Client step inputs
  const [clientName, setClientName] = useState('David Stern');
  const [clientCompany, setClientCompany] = useState('Axiom Global');
  const [clientEmail, setClientEmail] = useState('david.stern@axiom.co');
  const [clientPhone, setClientPhone] = useState('+1 (555) 012-3456');

  const triggerConfetti = () => {
    if (typeof window === 'undefined') return;
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '9999';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 4 + 2,
        angle: Math.random() * 360,
        rotationSpeed: Math.random() * 4 - 2,
      });
    }

    let animationFrameId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;

      particles.forEach((p) => {
        p.y += p.speed;
        p.x += Math.sin(p.angle * Math.PI / 180) * 1.2;
        p.angle += p.rotationSpeed;

        if (p.y < canvas.height) {
          active = true;
        }

        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle * Math.PI / 180);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (active) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        try {
          document.body.removeChild(canvas);
        } catch (e) {}
      }
    };

    render();
  };

  const handleFinish = async () => {
    if (!user) return;
    try {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      // 1. Upload avatar (data URL → blob) to the avatars bucket if provided
      let avatarUrl = profileAvatar || user.avatar || '';
      if (profileAvatar && profileAvatar.startsWith('data:')) {
        try {
          const blob = dataUrlToBlob(profileAvatar);
          const path = `${authUser.id}/avatar-${Date.now()}.png`;
          const { data: uploadData } = await supabase.storage.from('avatars').upload(path, blob, { upsert: true });
          if (uploadData) {
            avatarUrl = supabase.storage.from('avatars').getPublicUrl(uploadData.path).data.publicUrl;
          }
        } catch (e) {
          console.warn('Avatar upload failed, saving without avatar:', e);
        }
      }

      // 2. Create First Client & Workspace (clientService persists to Supabase)
      await createAppClient({
        userId: user.id,
        name: clientName,
        company: clientCompany,
        email: clientEmail,
        phone: clientPhone,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(clientName)}`
      });

      // Celebrate
      triggerConfetti();
      addToast('Onboarding completed! Welcome to FlowDesk.', 'success');

      // Call the completion handler (updates profile + redirects appropriately)
      if (onComplete) {
        onComplete({ name: profileName, avatar: avatarUrl });
      }
    } catch (e) {
      addToast('Failed to save profile configurations', 'warning');
    }
  };

  function dataUrlToBlob(dataUrl: string): Blob {
    const [meta, base64] = dataUrl.split(',');
    const mime = meta.match(/:(.*?);/)?.[1] || 'image/png';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }

  return (
    <div className="w-full max-w-md mx-7 bg-white/20 backdrop-blur-2xl border border-white/40 rounded-[28px] shadow-2xl p-8 overflow-hidden relative">
      <div className="absolute inset-x-0 top-0 h-px bg-white/60" />
      <div className="absolute inset-y-0 left-0 w-px bg-white/60" />

      {/* Step Indicator */}
      <StepIndicator currentStep={step} totalSteps={3} />

      <div className="relative z-10 pt-4">
        {step === 1 && (
          <ProfileSetupStep 
            name={profileName}
            onChangeName={setProfileName}
            avatar={profileAvatar}
            onChangeAvatar={setProfileAvatar}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <CreateClientStep 
            clientName={clientName}
            onChangeClientName={setClientName}
            clientCompany={clientCompany}
            onChangeClientCompany={setClientCompany}
            clientEmail={clientEmail}
            onChangeClientEmail={setClientEmail}
            clientPhone={clientPhone}
            onChangeClientPhone={setClientPhone}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <WorkspacePreviewStep 
            clientName={clientName}
            clientCompany={clientCompany}
            onFinish={handleFinish}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </div>
  );
}
