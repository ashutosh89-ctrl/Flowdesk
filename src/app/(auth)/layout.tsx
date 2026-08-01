export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8e4df] via-[#f0ece6] to-[#e5e1db] relative overflow-hidden flex items-center justify-center p-4 sm:p-7 select-none">
      {/* Warm ambient shapes */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-amber-500/4 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-emerald-500/3 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-white/30 blur-3xl pointer-events-none" />
      {children}
    </div>
  );
}
