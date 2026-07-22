"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from './AppContext';
import { 
  Home, Users, Folder, CreditCard, BarChart2, Bell, Settings, 
  ChevronLeft, ChevronRight, LogOut, ShieldAlert 
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: 'Dashboard', icon: Home, href: '/freelancer/dashboard' },
    { name: 'Clients', icon: Users, href: '/freelancer/clients', activePattern: /^\/freelancer\/workspace/ },
    { name: 'Projects', icon: Folder, href: '/freelancer/projects' },
    { name: 'Invoices', icon: CreditCard, href: '/freelancer/invoices' },
    { name: 'Activity', icon: Bell, href: '/freelancer/activity' },
    { name: 'Settings', icon: Settings, href: '/freelancer/settings' },
  ];

  return (
    <motion.div
      animate={{ width: isCollapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="hidden md:flex flex-col justify-between h-screen bg-white/40 border-r border-black/5 p-4 relative z-30 select-none shrink-0"
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-7 w-6 h-6 bg-white border border-black/10 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm cursor-pointer z-50 hover:bg-gray-50"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      <div>
        {/* Brand Logo Header */}
        <div className="flex items-center gap-3 px-2 mb-8 mt-2 overflow-hidden h-8">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white font-black text-sm shrink-0">
            ⚡
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-lg tracking-tight text-gray-950"
            >
              Flow<span className="text-gray-400 font-light">Desk</span>
            </motion.span>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.activePattern && item.activePattern.test(pathname));

            return (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 relative z-10 ${
                    isActive
                      ? 'text-gray-950 bg-black/5'
                      : 'text-gray-550 hover:bg-black/5 hover:text-gray-950'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-gray-950' : 'text-gray-400 group-hover:text-gray-900'}`} />
                  
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="truncate"
                    >
                      {item.name}
                    </motion.span>
                  )}

                  {/* Active Slide Bar Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarItem"
                      className="absolute left-0 w-1.5 h-8 bg-gray-900 rounded-r-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>

                {/* Collapsed Tooltip */}
                {isCollapsed && (
                  <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-50">
                    {item.name}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* User Info Footing */}
      <div className="pt-4 border-t border-black/5 space-y-4">
        <div className="flex items-center gap-3 px-2 group relative">
          <img
            src={user?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Ann'}
            alt="Freelancer Profile"
            className="w-9 h-9 rounded-full border border-gray-200 object-cover shrink-0"
            referrerPolicy="no-referrer"
          />
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-w-0 flex-1"
            >
              <h4 className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Ann Kowalski'}</h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
                {user?.role === 'client' ? 'Client' : 'Freelancer Admin'}
              </p>
            </motion.div>
          )}

          {isCollapsed && (
            <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-50">
              {user?.name || 'Profile'}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            signOut();
            router.push('/login');
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-650 hover:bg-red-50/50 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Log Out</span>}
        </button>
      </div>
    </motion.div>
  );
}
