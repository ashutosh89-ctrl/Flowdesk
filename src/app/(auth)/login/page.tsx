import GlassAuthCard from '@/components/auth/GlassAuthCard';
import LoginFormClient from '@/components/auth/LoginFormClient';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#B8B5B0] relative overflow-hidden flex items-center justify-center py-12">
      {/* Decorative Blobs */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-white/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-white/20 rounded-full blur-3xl pointer-events-none" />
      
      <GlassAuthCard>
        <LoginFormClient />
      </GlassAuthCard>
    </div>
  );
}
