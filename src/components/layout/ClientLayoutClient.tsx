'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/components/AppContext';
import GlassWindow from '@/components/layout/GlassWindow';
import { Home, FileText, CheckSquare, Receipt, MessageSquare, LogOut } from 'lucide-react';

export default function ClientLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut, toasts, removeToast } = useApp();

  const clientNav = [
    { name: 'Dashboard', icon: Home, href: '/client/workspace' },
    { name: 'Documents', icon: FileText, href: '/client/documents' },
    { name: 'Deliverables', icon: CheckSquare, href: '/client/deliverables' },
    { name: 'Invoices', icon: Receipt, href: '/client/invoices' },
    { name: 'Comments', icon: MessageSquare, href: '/client/comments' },
  ];

  return (
    <div className="flex flex-col h-screen w-screen bg-[#B8B5B0] overflow-hidden select-none">
      {/* Simplified Portal Header */}
      <header className="h-16 border-b border-black/5 bg-white/40 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white font-black text-sm">
            ⚡
          </div>
          <span className="font-bold text-lg text-gray-950 font-sans tracking-tight">
            Client Portal <span className="text-gray-400 font-light">FlowDesk</span>
          </span>
        </div>

        {/* Client Portal Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {clientNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-gray-900 text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-black/5 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout Control */}
        <button
          onClick={() => {
            signOut();
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-650 hover:bg-rose-50/50 rounded-full transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Log Out</span>
        </button>
      </header>

      {/* Main client workspace enclosed in Stitch Glass Window */}
      <div className="flex-1 overflow-hidden bg-[#B8B5B0] relative">
        <GlassWindow>
          {children}
        </GlassWindow>
      </div>

      {/* Mobile client nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-black/5 pb-6 pt-2 px-4 flex justify-around items-center">
        {clientNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center gap-1 text-center py-1 px-3 active:scale-95 transition-transform"
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-gray-900' : 'text-gray-400'}`} />
              <span className={`text-[10px] ${isActive ? 'text-gray-950 font-semibold' : 'text-gray-400 font-medium'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
