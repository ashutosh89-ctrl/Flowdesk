'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/components/AppContext';

interface QuickSearchItem {
  keywords: string[];
  label: string;
  href: string;
  action?: 'add_client' | 'create_project' | 'create_invoice';
}

const SEARCH_ITEMS: QuickSearchItem[] = [
  { keywords: ['pending', 'overdue', 'unpaid', 'invoice'], label: 'Pending Invoices', href: '/freelancer/invoices' },
  { keywords: ['active clients', 'clients', 'customer'], label: 'Active Clients', href: '/freelancer/clients' },
  { keywords: ['active projects', 'projects', 'ongoing'], label: 'Active Projects', href: '/freelancer/projects' },
  { keywords: ['dashboard', 'home', 'overview'], label: 'Dashboard', href: '/freelancer/dashboard' },
  { keywords: ['settings', 'profile', 'account'], label: 'Settings', href: '/freelancer/settings' },
  { keywords: ['activity', 'logs', 'history'], label: 'Activity Feed', href: '/freelancer/activity' },
  { keywords: ['new client', 'add client'], label: 'Add New Client', href: '/freelancer/clients', action: 'add_client' },
  { keywords: ['new project', 'create project'], label: 'Create Project', href: '/freelancer/projects', action: 'create_project' },
  { keywords: ['create invoice', 'new invoice', 'send invoice'], label: 'Create Invoice', href: '/freelancer/invoices', action: 'create_invoice' },
];

export function QuickSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { setCreateClientOpen, setCreateProjectOpen, setCreateInvoiceOpen } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return SEARCH_ITEMS;
    const q = query.toLowerCase();
    return SEARCH_ITEMS.filter(item =>
      item.keywords.some(k => k.includes(q)) || item.label.toLowerCase().includes(q)
    );
  }, [query]);

  const handleSelect = (item: QuickSearchItem) => {
    router.push(item.href);
    if (item.action === 'add_client') setCreateClientOpen(true);
    if (item.action === 'create_project') setCreateProjectOpen(true);
    if (item.action === 'create_invoice') setCreateInvoiceOpen(true);
    setIsOpen(false);
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[20vh] backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center border-b border-[#B8B5B0]/20 px-4 py-3">
          <Search className="mr-3 h-5 w-5 text-[rgba(26,26,25,0.40)]" />
          <input
            autoFocus
            type="text"
            placeholder="Type anything... 'pending', 'active clients', 'new project'"
            className="flex-1 bg-transparent text-sm text-[#1a1a19] placeholder:text-[rgba(26,26,25,0.40)] outline-none font-medium"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={() => setIsOpen(false)} className="rounded bg-[#B8B5B0]/20 px-2 py-1 text-xs font-semibold text-gray-600">
            ESC
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {results.map((item, i) => (
            <button
              key={item.label}
              onClick={() => handleSelect(item)}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#1a1a19]/5 transition-colors cursor-pointer',
                i === 0 && 'bg-[#1a1a19]/5'
              )}
            >
              <span className="flex-1 text-sm font-semibold text-[#1a1a19]">{item.label}</span>
              <span className="text-xs text-[rgba(26,26,25,0.40)] font-mono">{item.href}</span>
            </button>
          ))}
          {query && results.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-[rgba(26,26,25,0.40)]">
              No results for &quot;{query}&quot; — try &quot;pending&quot;, &quot;clients&quot;, or &quot;projects&quot;
            </p>
          )}
        </div>
        <div className="flex items-center gap-4 border-t border-[#B8B5B0]/20 px-4 py-2 text-xs text-[rgba(26,26,25,0.40)]">
          <span>⌘K to open</span>
          <span>↵ to select</span>
          <span className="ml-auto">{results.length} results</span>
        </div>
      </div>
    </div>
  );
}
