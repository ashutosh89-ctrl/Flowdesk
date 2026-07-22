import { Suspense } from 'react';
import GlassAuthCard from '@/components/auth/GlassAuthCard';
import ResetPasswordFormClient from '@/components/auth/ResetPasswordFormClient';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#B8B5B0] relative overflow-hidden flex items-center justify-center py-12">
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-white/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-white/20 rounded-full blur-3xl pointer-events-none" />

      <GlassAuthCard>
        <Suspense fallback={<div className="text-center py-4 text-sm text-gray-500 font-medium">Loading details...</div>}>
          <ResetPasswordFormClient />
        </Suspense>
      </GlassAuthCard>
    </div>
  );
}
