'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  const [selectedIndex, setSelectedIndex] = useState(0);
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

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const closePalette = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  const executeCommand = useCallback((command: Command) => {
    command.action();
    closePalette();
  }, [closePalette]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard nav when open
      if (!isOpen) {
        // Only handle open shortcut - QuickSearch also listens for ⌘K
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          setIsOpen(prev => !prev);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filtered[selectedIndex]) {
            executeCommand(filtered[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          closePalette();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, executeCommand, closePalette]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[20vh] backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center border-b border-gray-200/60 px-4 py-3">
          <Search className="mr-3 h-5 w-5 text-gray-400" />
          <input
            autoFocus
            type="text"
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none font-medium"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <kbd className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500">ESC</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {filtered.map((command, index) => (
            <button
              key={command.id}
              onClick={() => executeCommand(command)}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer',
                index === selectedIndex ? 'bg-gray-100' : 'bg-transparent hover:bg-gray-50'
              )}
            >
              <command.icon className="h-4 w-4 text-gray-500 shrink-0" />
              <span className="flex-1 text-sm font-medium text-gray-800">{command.label}</span>
              {index === selectedIndex && (
                <span className="text-[10px] font-semibold text-gray-400">↵</span>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-gray-400 font-medium">
              No commands found for &quot;{query}&quot;
            </p>
          )}
        </div>
        <div className="flex items-center gap-4 border-t border-gray-200/60 px-4 py-2.5 text-xs text-gray-400">
          <span className="font-medium">↑↓ Navigate</span>
          <span className="font-medium">↵ Select</span>
          <span className="font-medium">Esc Close</span>
          <span className="ml-auto font-medium">⌘K to open</span>
        </div>
      </div>
    </div>
  );
}
