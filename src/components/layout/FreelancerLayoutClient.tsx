'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import MobileBottomNav from '@/components/navigation/MobileBottomNav';
import MobileMenuDrawer from '@/components/layout/MobileMenuDrawer';
import GlassWindow from '@/components/layout/GlassWindow';

export default function FreelancerLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#B8B5B0]">
      {/* Mobile Menu Drawer */}
      <MobileMenuDrawer 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Sidebar (Desktop only) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopBar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        
        {/* Page children wrapped inside the Google Stitch Glass Window */}
        <div className="flex-1 overflow-hidden relative bg-[#B8B5B0]">
          <GlassWindow>
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1, ease: 'easeOut' }}
              className="h-full overflow-auto"
            >
              {children}
            </motion.div>
          </GlassWindow>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
}
