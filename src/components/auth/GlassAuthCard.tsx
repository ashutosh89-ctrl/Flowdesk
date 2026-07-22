"use client";
import React from 'react';

interface GlassAuthCardProps {
  children: React.ReactNode;
}

export default function GlassAuthCard({ children }: GlassAuthCardProps) {
  return (
    <div className="relative w-full max-w-[420px] mx-7 bg-white/20 backdrop-blur-2xl border border-white/40 rounded-[28px] shadow-2xl p-8 overflow-hidden">
      {/* Specular Rim Highlights */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/60" />
      <div className="absolute inset-y-0 left-0 w-px bg-white/60" />
      
      {/* Decorative Blob Glow */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
