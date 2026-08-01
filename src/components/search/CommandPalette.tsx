'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Users, FolderOpen, Receipt, FileText, ArrowRight, X, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { readAll } from '@/lib/services/dataService';
import { Client, Project, Invoice, Document } from '@/lib/types';
import { getCurrencySymbol } from '@/lib/utils/currency';

interface SearchResultItem {
  id: string;
  type: 'client' | 'project' | 'invoice' | 'document';
  title: string;
  subtitle: string;
  url: string;
}

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch data on modal open
  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        const [cls, prjs, invs, docs] = await Promise.all([
          readAll<Client>('clients'),
          readAll<Project>('projects'),
          readAll<Invoice>('invoices'),
          readAll<Document>('documents')
        ]);
        setClients(cls);
        setProjects(prjs);
        setInvoices(invs);
        setDocuments(docs);
      };
      loadData();
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Compute search results
  const results = React.useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase().trim();
    const items: SearchResultItem[] = [];

    // Search Clients
    clients.forEach(c => {
      if (c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) {
        items.push({
          id: `cl_${c.id}`,
          type: 'client',
          title: c.name,
          subtitle: `${c.company} • ${c.email}`,
          url: `/freelancer/workspace/${c.id}`
        });
      }
    });

    // Search Projects
    projects.forEach(p => {
      if (p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))) {
        items.push({
          id: `prj_${p.id}`,
          type: 'project',
          title: p.name,
          subtitle: `Status: ${p.status.replace('_', ' ')} • Due: ${p.dueDate || 'N/A'}`,
          url: `/freelancer/projects`
        });
      }
    });

    // Search Invoices
    const currSym = getCurrencySymbol('INR');
    invoices.forEach(i => {
      const client = clients.find(c => c.id === i.clientId);
      const clientName = client ? client.name : 'Client';
      const invNum = i.number || i.id;
      const amtStr = `${currSym}${i.total || 0}`;
      if (invNum.toLowerCase().includes(q) || amtStr.includes(q) || clientName.toLowerCase().includes(q)) {
        items.push({
          id: `inv_${i.id}`,
          type: 'invoice',
          title: `Invoice #${invNum}`,
          subtitle: `${clientName} • Total: ${amtStr} • Status: ${i.status}`,
          url: `/freelancer/invoices`
        });
      }
    });

    // Search Documents
    documents.forEach(d => {
      if (d.name.toLowerCase().includes(q)) {
        items.push({
          id: `doc_${d.id}`,
          type: 'document',
          title: d.name,
          subtitle: `Uploaded document`,
          url: `/freelancer/workspace/${d.workspaceId}`
        });
      }
    });

    return items;
  }, [query, clients, projects, invoices, documents]);

  // Handle arrow key & enter navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (results.length > 0 ? (prev + 1) % results.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          router.push(results[selectedIndex].url);
          setIsOpen(false);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, router]);

  return (
    <>
      {/* Top bar trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 hover:bg-white border border-black/5 text-gray-500 hover:text-gray-950 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
        aria-label="Global Search"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono font-bold bg-gray-100 text-gray-400 rounded-md border border-black/5">
          <Command className="w-2.5 h-2.5" /> K
        </kbd>
      </button>

      {/* Global Command Palette Overlay Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-md font-sans">
            <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-black/10 flex flex-col"
            >
              {/* Input Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-black/5 bg-white">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                  placeholder="Search clients, projects, invoices, documents..."
                  className="flex-1 bg-transparent text-sm font-bold text-gray-950 outline-none placeholder:text-gray-400 placeholder:font-medium"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="p-1 text-gray-400 hover:text-gray-900 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-xs font-bold text-gray-400 hover:text-gray-950 cursor-pointer">
                  ESC
                </button>
              </div>

              {/* Results Container */}
              <div className="max-h-[60vh] overflow-y-auto p-3 divide-y divide-gray-100">
                {!query.trim() ? (
                  <div className="p-8 text-center text-gray-400">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-xs font-bold text-gray-600">Quick Global Search</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Type to instantly search across all clients, projects, invoices, and documents.</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <p className="text-xs font-bold text-gray-700">No results found for "{query}"</p>
                    <p className="text-[10px] text-gray-400 mt-1">Try checking for typos or searching by name, company, or invoice number.</p>
                  </div>
                ) : (
                  results.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    const Icon = item.type === 'client' ? Users : item.type === 'project' ? FolderOpen : item.type === 'invoice' ? Receipt : FileText;

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          router.push(item.url);
                          setIsOpen(false);
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`p-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                          isSelected ? 'bg-gray-950 text-white shadow-sm' : 'hover:bg-gray-50 text-gray-950'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black truncate">{item.title}</p>
                            <p className={`text-[10px] font-semibold truncate ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        <ArrowRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-gray-300'}`} />
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-2.5 bg-gray-50 border-t border-black/5 flex items-center justify-between text-[10px] font-bold text-gray-400">
                <div className="flex items-center gap-3">
                  <span>↑↓ Navigate</span>
                  <span>↵ Select</span>
                  <span>esc Close</span>
                </div>
                <span>{results.length} result(s)</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
