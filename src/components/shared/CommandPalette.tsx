'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Users, FolderOpen, Receipt, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Command {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  const commands: Command[] = [
    { id: 'dashboard', label: 'Go to Dashboard', icon: FolderOpen, action: () => router.push('/freelancer/dashboard') },
    { id: 'clients', label: 'Go to Clients', icon: Users, action: () => router.push('/freelancer/clients') },
    { id: 'projects', label: 'Go to Projects', icon: FolderOpen, action: () => router.push('/freelancer/projects') },
    { id: 'invoices', label: 'Go to Invoices', icon: Receipt, action: () => router.push('/freelancer/invoices') },
    { id: 'settings', label: 'Open Settings', icon: Settings, action: () => router.push('/freelancer/settings') },
  ];

  const filtered = query
    ? commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[20vh] backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center border-b border-[#B8B5B0]/20 px-4 py-3">
          <Search className="mr-3 h-5 w-5 text-[rgba(26,26,25,0.40)]" />
          <input
            autoFocus
            type="text"
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-sm text-[#1a1a19] placeholder:text-[rgba(26,26,25,0.40)] outline-none"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <kbd className="rounded bg-[#B8B5B0]/20 px-2 py-1 text-xs text-[rgba(26,26,25,0.60)]">ESC</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {filtered.map((command, index) => (
            <button
              key={command.id}
              onClick={() => {
                command.action();
                setIsOpen(false);
              }}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#1a1a19]/5',
                index === 0 && 'bg-[#1a1a19]/5'
              )}
            >
              <command.icon className="h-4 w-4 text-[rgba(26,26,25,0.60)]" />
              <span className="flex-1 text-sm text-[#1a1a19]">{command.label}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-[rgba(26,26,25,0.40)]">
              No commands found for &quot;{query}&quot;
            </p>
          )}
        </div>
        <div className="flex items-center gap-4 border-t border-[#B8B5B0]/20 px-4 py-2 text-xs text-[rgba(26,26,25,0.40)]">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span className="ml-auto">⌘K to open</span>
        </div>
      </div>
    </div>
  );
}
