"use client";
import React from 'react';

interface GlassWindowProps {
  children: React.ReactNode;
}

export default function GlassWindow({ children }: GlassWindowProps) {
  return (
    <div className="h-full w-full bg-[#B8B5B0] relative overflow-hidden flex flex-col">
      {/* Fuzzy decorative background blobs */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-white/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-white/30 rounded-full blur-3xl pointer-events-none" />
      
      {/* Outer container to enforce margins */}
      <div className="flex-1 flex flex-col m-2 md:m-6 bg-white/20 backdrop-blur-3xl border border-white/50 rounded-[24px] shadow-2xl overflow-hidden relative min-h-0">
        {/* Specular top/left rim highlights */}
        <div className="absolute inset-x-0 top-0 h-px bg-white/60 pointer-events-none z-30" />
        <div className="absolute inset-y-0 left-0 w-px bg-white/60 pointer-events-none z-30" />
        
        {/* Interior surface */}
        <div className="flex-1 bg-[#F5F5F3] m-1 rounded-[20px] overflow-hidden relative flex flex-col min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
}
