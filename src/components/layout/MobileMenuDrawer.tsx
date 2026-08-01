'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { X, LayoutDashboard, Users, FolderOpen, Receipt, Settings, Activity, LogOut } from 'lucide-react';
import { useApp } from '@/components/AppContext';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenuDrawer({ isOpen, onClose }: MobileMenuDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useApp();

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleNavigate = (href: string) => {
    onClose();
    router.push(href);
  };

  const handleLogout = () => {
    onClose();
    signOut();
    router.push('/login');
  };

  const navItems = [
    { href: '/freelancer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/freelancer/clients', label: 'Clients', icon: Users },
    { href: '/freelancer/projects', label: 'Projects', icon: FolderOpen },
    { href: '/freelancer/invoices', label: 'Invoices', icon: Receipt },
    { href: '/freelancer/activity', label: 'Activity', icon: Activity },
    { href: '/freelancer/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 250 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-[#F5F5F3] border-r border-black/5 shadow-2xl flex flex-col md:hidden"
          >
            {/* Header */}
            <div className="h-16 px-6 border-b border-black/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center text-white font-black text-sm">
                  ⚡
                </div>
                <span className="font-extrabold text-lg tracking-tight text-gray-950">FlowDesk</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-black/5 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Mobile navigation">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavigate(item.href)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-gray-900 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-white hover:text-gray-900'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-black/5 shrink-0">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                Log Out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
