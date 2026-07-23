'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, FolderOpen, Receipt, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/freelancer/dashboard' },
  { icon: Users, label: 'Clients', href: '/freelancer/clients' },
  { icon: FolderOpen, label: 'Projects', href: '/freelancer/projects' },
  { icon: Receipt, label: 'Invoices', href: '/freelancer/invoices' },
  { icon: Settings, label: 'Settings', href: '/freelancer/settings' },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/20 bg-white/80 backdrop-blur-xl md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors',
                isActive ? 'text-[#1a1a19]' : 'text-[rgba(26,26,25,0.40)]'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
