export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-[#B8B5B0] p-7 flex items-center justify-center">
      <div className="glass-window w-full max-w-2xl p-8 animate-pulse">
        <div className="flex justify-center gap-2 mb-8">
          {[1,2,3].map(i => (
            <div key={i} className="h-2 w-16 bg-black/5 rounded-full" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-12 bg-black/5 rounded-xl" />
          <div className="h-12 bg-black/5 rounded-xl" />
          <div className="h-10 bg-black/5 rounded-full w-1/3 mx-auto" />
        </div>
      </div>
    </div>
  );
}
