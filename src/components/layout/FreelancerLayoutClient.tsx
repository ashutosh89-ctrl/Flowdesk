'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import MobileBottomNav from '@/components/navigation/MobileBottomNav';
import GlassWindow from '@/components/layout/GlassWindow';

export default function FreelancerLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#B8B5B0]">
      {/* Sidebar (Desktop only) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopBar />
        
        {/* Page children wrapped inside the Google Stitch Glass Window */}
        <div className="flex-1 overflow-hidden relative bg-[#B8B5B0]">
          <GlassWindow>
            {children}
          </GlassWindow>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
}
