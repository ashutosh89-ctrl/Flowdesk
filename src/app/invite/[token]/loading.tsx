export default function InviteLoading() {
  return (
    <div className="min-h-screen bg-[#B8B5B0] flex items-center justify-center">
      <div className="glass-card p-8 w-full max-w-[420px]">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-black/5 rounded w-2/3 mx-auto mb-6" />
          <div className="h-12 bg-black/5 rounded w-full" />
          <div className="h-12 bg-black/5 rounded w-full" />
          <div className="h-12 bg-black/5 rounded w-full" />
          <div className="h-12 bg-black/5 rounded w-full" />
        </div>
      </div>
    </div>
  );
}
