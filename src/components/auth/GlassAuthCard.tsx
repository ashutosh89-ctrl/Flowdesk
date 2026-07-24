"use client";
import React from 'react';
import { Sparkles, ShieldCheck, CreditCard, Receipt } from 'lucide-react';

interface GlassAuthCardProps {
  children: React.ReactNode;
}

export default function GlassAuthCard({ children }: GlassAuthCardProps) {
  return (
    <div className="relative w-full max-w-4xl mx-4 sm:mx-6 bg-white/60 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[540px]">
      {/* Specular Rim Highlights */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/80 z-20 pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-px bg-white/80 z-20 pointer-events-none" />
      
      {/* Left Branding Showcase Panel (Desktop) */}
      <div className="hidden md:flex flex-col justify-between w-5/12 bg-gray-950 text-white p-8 lg:p-10 relative overflow-hidden shrink-0 select-none">
        {/* Subtle Background Radial Highlights */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white text-gray-950 flex items-center justify-center font-black text-base shadow-sm">
              ⚡
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">FlowDesk</span>
          </div>

          <div className="space-y-2 pt-4">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">Freelancer Operating System</span>
            <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
              Create → Send → Track → Get Paid
            </h1>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              Streamlined client collaboration, itemized multi-currency invoicing, and Razorpay payment settlements.
            </p>
          </div>
        </div>

        {/* Feature Badges List */}
        <div className="relative z-10 space-y-2.5 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-300">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>8 Global Currencies & Custom Tax</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-300">
            <CreditCard className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Razorpay Secure Online Payments</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-300">
            <Receipt className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Instant Digital Payment Receipts</span>
          </div>
        </div>
      </div>

      {/* Right Content Form Panel */}
      <div className="flex-1 p-6 sm:p-8 lg:p-10 bg-white/80 backdrop-blur-md flex flex-col justify-center relative z-10">
        {children}
      </div>
    </div>
  );
}
