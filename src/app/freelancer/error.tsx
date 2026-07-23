'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function FreelancerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Freelancer route error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">
      <div className="glass-card max-w-md p-8 text-center">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-amber-500" />
        <h2 className="mb-2 text-xl font-semibold text-[#1a1a19]">
          Something went wrong
        </h2>
        <p className="mb-6 text-sm text-[rgba(26,26,25,0.60)]">
          We encountered an error loading this page. Please try again.
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={reset} variant="primary">
            Try Again
          </Button>
          <Button onClick={() => (window.location.href = '/freelancer/dashboard')} variant="ghost">
            Go to Dashboard
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-[#1a1a19]/5 p-4 text-left text-xs">
            {error.message}
            {error.digest && `\nDigest: ${error.digest}`}
          </pre>
        )}
      </div>
    </div>
  );
}
