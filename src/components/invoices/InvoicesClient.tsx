"use client";
import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { Project, Client, Invoice } from '../../lib/types';
import { sendReminder } from '../../lib/services/invoiceService';
import { update } from '../../lib/services/dataService';
import CreateInvoiceModal from './CreateInvoiceModal';
import { 
  Plus, Search, Calendar, AlertTriangle, ArrowUpRight, 
  ExternalLink, FileText, CheckCircle2, IndianRupee, Bell, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InvoicesClientProps {
  initialInvoices: Invoice[];
  initialProjects: Project[];
  initialClients: Client[];
}

export function InvoicesClient({ initialInvoices, initialProjects, initialClients }: InvoicesClientProps) {
  const { 
    user, addToast, 
    isCreateInvoiceOpen, setCreateInvoiceOpen 
  } = useApp();

  const [invoices, setInvoices] = useState<Invoice[]>(Array.isArray(initialInvoices) ? initialInvoices : []);
  const [projects, setProjects] = useState<Project[]>(Array.isArray(initialProjects) ? initialProjects : []);
  const [clients, setClients] = useState<Client[]>(Array.isArray(initialClients) ? initialClients : []);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const loadData = async () => {
    try {
      const invsRes = await fetch('/api/invoices');
      const invsData = await invsRes.json();
      setInvoices(Array.isArray(invsData) ? invsData : (invsData?.invoices ?? []));

      const projsRes = await fetch('/api/projects');
      const projsData = await projsRes.json();
      setProjects(Array.isArray(projsData) ? projsData : (projsData?.projects ?? []));

      const clsRes = await fetch('/api/clients');
      const clsData = await clsRes.json();
      setClients(Array.isArray(clsData) ? clsData : (clsData?.clients ?? []));
    } catch (e) {
      setInvoices([]);
    }
  };

  const getProjectName = (projId: string) => {
    const p = (projects || []).find(pr => pr?.id === projId);
    return p ? p.name : 'Unknown Project';
  };

  const getClientName = (projId: string) => {
    const p = (projects || []).find(pr => pr?.id === projId);
    if (!p) return 'Unknown Client';
    const c = (clients || []).find(cl => cl?.id === p.clientId);
    return c ? `${c.name} (${c.company})` : 'Unknown Client';
  };

  const handleSendReminder = async (invoiceId: string) => {
    try {
      await sendReminder(invoiceId, user?.id || 'usr_ann');
      addToast('Mock payment reminder sent to client email!', 'success');
      loadData();
    } catch (e) {
      addToast('Failed to send reminder', 'warning');
    }
  };

  // Optimistic UI update for marking invoice as paid
  const handleMarkPaid = async (invoiceId: string) => {
    const prevInvoices = [...invoices];
    
    // 1. Optimistic update
    setInvoices(prev => prev.map(i => i?.id === invoiceId ? { ...i, status: 'paid' as const } : i));
    addToast('Invoice marked as Paid!', 'success');
    setSelectedInvoice(null);

    // 2. Background API call
    try {
      await update('invoices', invoiceId, { status: 'paid' });
    } catch (e) {
      // 3. Rollback on error
      setInvoices(prevInvoices);
      addToast('Failed to update invoice status. Rolled back.', 'warning');
    }
  };

  const filteredInvoices = useMemo(() => {
    const safeInvoices = Array.isArray(invoices) ? invoices : [];
    if (!search.trim()) return safeInvoices;

    const q = search.toLowerCase();
    return safeInvoices.filter(inv => {
      if (!inv) return false;
      const projName = (getProjectName(inv.projectId) || '').toLowerCase();
      const clientName = (getClientName(inv.projectId) || '').toLowerCase();
      const invNum = (inv.invoiceNumber || inv.number || inv.id || '').toLowerCase();
      const status = (inv.status || '').toLowerCase();

      return invNum.includes(q) || 
             projName.includes(q) ||
             clientName.includes(q) ||
             status.includes(q);
    });
  }, [invoices, projects, clients, search]);

  const overdueInvoices = (invoices || []).filter(i => i?.status === 'overdue');
  const overdueTotal = overdueInvoices.reduce((sum, item) => sum + (item?.total || 0), 0);

  return (
    <div className="flex-1 flex flex-col font-sans h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-black/5 bg-white/30 backdrop-blur-md shrink-0">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search invoices by number, client, project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-black/5 rounded-full text-xs font-semibold text-gray-800 focus:outline-none focus:border-gray-900 transition-all placeholder-gray-400"
          />
        </div>

        <button
          onClick={() => setCreateInvoiceOpen(true)}
          className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm ml-auto"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      {/* Main content body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {overdueInvoices.length > 0 && (
          <div className="p-4 border border-rose-200 bg-rose-50/50 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <div>
                <h4 className="text-xs font-extrabold text-rose-950">Overdue Payments Warning</h4>
                <p className="text-[11px] text-rose-700 font-semibold mt-0.5">You have {overdueInvoices.length} overdue invoice(s) totaling ₹{overdueTotal.toLocaleString('en-IN')}.</p>
              </div>
            </div>
          </div>
        )}

        {filteredInvoices.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-extrabold text-gray-900">No Invoices Found</h3>
            <p className="text-xs text-gray-400 font-semibold mt-1">Create your first invoice or try adjusting your search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInvoices.map((inv) => (
              <div 
                key={inv.id}
                className="glass-card p-5 rounded-2xl border border-black/5 hover:border-black/15 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md">
                      #{inv.invoiceNumber || inv.number || inv.id}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                      inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                      inv.status === 'overdue' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {inv.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-gray-950 mb-1">{getProjectName(inv.projectId)}</h3>
                  <p className="text-xs text-gray-400 font-semibold mb-4">{getClientName(inv.projectId)}</p>

                  <div className="text-xl font-extrabold text-gray-950 flex items-center gap-0.5 mb-4">
                    <IndianRupee className="w-4 h-4" />
                    {(inv.total || 0).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-black/5">
                  {inv.status !== 'paid' && (
                    <button
                      onClick={() => handleMarkPaid(inv.id)}
                      className="flex-1 py-1.5 bg-gray-950 text-white font-bold text-[11px] rounded-lg hover:bg-gray-800 transition-colors cursor-pointer text-center"
                    >
                      Mark Paid
                    </button>
                  )}
                  <button
                    onClick={() => handleSendReminder(inv.id)}
                    className="p-2 border border-black/10 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors cursor-pointer"
                    title="Send Payment Reminder"
                  >
                    <Bell className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateInvoiceModal 
        isOpen={isCreateInvoiceOpen}
        onClose={() => setCreateInvoiceOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
