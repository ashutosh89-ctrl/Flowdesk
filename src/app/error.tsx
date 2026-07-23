'use client';

import { useEffect } from 'react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root app error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f2f2f0] p-4">
      <div className="glass-card max-w-md p-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-[#1a1a19]">Oops!</h1>
        <p className="mb-6 text-sm text-[rgba(26,26,25,0.60)]">
          We encountered an unexpected error. Please try reloading the page.
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-[#1a1a19] px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:bg-[#1a1a19]/90"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
