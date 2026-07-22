"use client";
import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F5F5F3] flex items-center justify-center p-8 font-sans">
        <div className="bg-white border border-black/5 rounded-3xl p-8 shadow-2xl max-w-md w-full text-center space-y-4">
          <h2 className="text-base font-extrabold text-red-650 uppercase tracking-wide">Global System Error</h2>
          <p className="text-xs text-gray-550 font-semibold leading-relaxed">
            {error.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-gray-950 hover:bg-gray-800 text-white font-bold text-xs rounded-full transition-colors cursor-pointer"
          >
            Reset System
          </button>
        </div>
      </body>
    </html>
  );
}
