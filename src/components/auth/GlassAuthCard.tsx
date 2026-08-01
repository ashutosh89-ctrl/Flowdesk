"use client";
import React from 'react';
import { motion } from 'motion/react';

interface GlassAuthCardProps {
  children: React.ReactNode;
}

export default function GlassAuthCard({ children }: GlassAuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="relative w-full max-w-[360px] sm:max-w-[440px] lg:max-w-[480px] mx-auto bg-[rgba(255,253,250,0.9)] backdrop-blur-2xl border border-white/60 rounded-[28px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.02)] p-6 sm:p-8 lg:p-10 overflow-hidden"
    >
      {/* Specular Rim Highlights */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/80 z-20 pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-px bg-white/80 z-20 pointer-events-none" />
      
      {/* Warm decorative blobs */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/8 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/6 rounded-full blur-2xl pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
