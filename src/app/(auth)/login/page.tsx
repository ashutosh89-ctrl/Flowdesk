import GlassAuthCard from '@/components/auth/GlassAuthCard';
import LoginFormClient from '@/components/auth/LoginFormClient';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F3] relative overflow-hidden flex items-center justify-center p-4 sm:p-6 md:p-10 select-none">
      {/* Subtle Background Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-white/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-black/5 rounded-full blur-3xl pointer-events-none" />
      
      <GlassAuthCard>
        <LoginFormClient />
      </GlassAuthCard>
    </div>
  );
}
