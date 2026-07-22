'use client';

export default function InviteError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#B8B5B0] flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-[420px] text-center">
        <h2 className="text-lg font-bold text-[#1a1a19] mb-2">Invitation Error</h2>
        <p className="text-sm text-gray-500 mb-6">{error.message}</p>
        <button onClick={reset} className="px-6 py-2.5 bg-[#1a1a19] text-white text-xs font-bold rounded-full">
          Try again
        </button>
      </div>
    </div>
  );
}
