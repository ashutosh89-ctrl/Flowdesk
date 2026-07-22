'use client';

export default function ForgotPasswordError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="glass-window w-full max-w-[420px] p-8 text-center">
      <h2 className="text-xl font-bold text-[#1a1a19] mb-2">Something went wrong</h2>
      <p className="text-sm text-gray-500 mb-6">{error.message}</p>
      <button onClick={reset} className="px-6 py-2.5 bg-[#1a1a19] text-white text-xs font-bold rounded-full">
        Try again
      </button>
    </div>
  );
}
