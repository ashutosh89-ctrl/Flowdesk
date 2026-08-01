import { Suspense } from 'react';
import GlassAuthCard from '@/components/auth/GlassAuthCard';
import ResetPasswordFormClient from '@/components/auth/ResetPasswordFormClient';

export default function ResetPasswordPage() {
  return (
    <GlassAuthCard>
      <Suspense fallback={<div className="text-center py-4 text-sm text-gray-500 font-medium">Loading details...</div>}>
        <ResetPasswordFormClient />
      </Suspense>
    </GlassAuthCard>
  );
}
