"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Folder, CreditCard, MoreHorizontal, FileText, Activity, Settings, ShieldAlert, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const tabs = [
    { label: 'Home', icon: Home, href: '/freelancer/dashboard' },
    { label: 'Clients', icon: Users, href: '/freelancer/clients' },
    { label: 'Projects', icon: Folder, href: '/freelancer/projects' },
    { label: 'Invoices', icon: CreditCard, href: '/freelancer/invoices' },
  ];

  const moreItems = [
    { label: 'Documents', icon: FileText, href: '/freelancer/clients' },
    { label: 'Activity Feed', icon: Activity, href: '/freelancer/activity' },
    { label: 'Settings', icon: Settings, href: '/freelancer/settings' },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-black/5 pb-6 pt-2 px-4 flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          
          return (
            <Link 
              key={tab.label} 
              href={tab.href}
              className="flex flex-col items-center gap-1 text-center py-1 px-3 active:scale-95 transition-transform"
            >
              <div className={`relative flex items-center justify-center ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                {isActive && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gray-900 rounded-full" />
                )}
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] ${isActive ? 'text-gray-950 font-semibold' : 'text-gray-400 font-medium'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* More Tab */}
        <button
          onClick={() => setShowMore(true)}
          className="flex flex-col items-center gap-1 text-center py-1 px-3 active:scale-95 transition-transform text-gray-400 focus:outline-none"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>

      {/* Sliding Bottom Sheet */}
      <AnimatePresence>
        {showMore && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMore(false)}
              className="fixed inset-0 bg-black z-45 md:hidden"
            />

            {/* Bottom Sheet Card */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[24px] shadow-2xl p-6 md:hidden pb-10 space-y-6"
            >
              {/* Drag Handle */}
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto" onClick={() => setShowMore(false)} />
              
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">More Actions</h3>
                <button 
                  onClick={() => setShowMore(false)}
                  className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setShowMore(false)}
                      className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-black/5 hover:border-gray-900 rounded-2xl text-center gap-2 transition-all active:scale-95"
                    >
                      <Icon className="w-5 h-5 text-gray-700" />
                      <span className="text-xs font-semibold text-gray-800">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
