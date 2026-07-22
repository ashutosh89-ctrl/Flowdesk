export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#B8B5B0] flex items-center justify-center p-7">
      {children}
    </div>
  );
}
