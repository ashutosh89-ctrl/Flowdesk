"use client";
import React, { useState, useEffect } from 'react';
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

  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const loadData = async () => {
    try {
      const invsRes = await fetch('/api/invoices');
      const invs = await invsRes.json();
      setInvoices(invs);

      const projsRes = await fetch('/api/projects');
      const projs = await projsRes.json();
      setProjects(projs);

      const clsRes = await fetch('/api/clients');
      const cls = await clsRes.json();
      setClients(cls);
    } catch (e) {}
  };

  const getProjectName = (projId: string) => {
    const p = projects.find(pr => pr.id === projId);
    return p ? p.name : 'Unknown Project';
  };

  const getClientName = (projId: string) => {
    const p = projects.find(pr => pr.id === projId);
    if (!p) return 'Unknown Client';
    const c = clients.find(cl => cl.id === p.clientId);
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
    setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, status: 'paid' as const } : i));
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

  const filteredInvoices = invoices.filter(inv => {
    const num = (inv?.invoiceNumber || inv?.number || inv?.id || '').toLowerCase();
    const projName = (getProjectName(inv?.projectId || '') || '').toLowerCase();
    const clientName = (getClientName(inv?.projectId || '') || '').toLowerCase();
    const query = (search || '').toLowerCase();
    return num.includes(query) || 
           projName.includes(query) ||
           clientName.includes(query);
  });

  const overdueInvoices = invoices.filter(i => i.status === 'overdue');
  const overdueTotal = overdueInvoices.reduce((sum, item) => sum + (item.total || 0), 0);

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

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {overdueInvoices.length > 0 && (
          <div className="p-4 border border-red-150/30 bg-red-50 text-red-750 rounded-2xl flex gap-3 text-xs leading-normal">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-extrabold block">Outstanding Receivables</span>
              <span className="font-semibold block mt-0.5">
                You have {overdueInvoices.length} overdue invoices totalling <span className="font-extrabold text-red-650">₹{overdueTotal.toLocaleString()}</span>. Consider sending quick email reminders.
              </span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/5 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Client / Project</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150/40">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs font-semibold text-gray-400">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 text-sm font-extrabold text-gray-950 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      {inv.invoiceNumber || inv.number || inv.id}
                    </td>
                    <td className="px-6 py-4">
                      <h4 className="text-xs font-bold text-gray-900 leading-tight">{getClientName(inv.projectId)}</h4>
                      <span className="text-[10px] font-bold text-gray-400 block mt-0.5">{getProjectName(inv.projectId)}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                      {new Date(inv.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-xs font-extrabold text-gray-900">
                      ₹{inv.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                        inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        inv.status === 'overdue' ? 'bg-red-50 text-red-750 border-red-150/30' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => handleSendReminder(inv.id)}
                            className="p-1.5 bg-gray-50 hover:bg-gray-150 rounded-full border border-black/5 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                            title="Send email reminder"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <a
                          href={inv.razorpayLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-gray-50 hover:bg-gray-150 rounded-full border border-black/5 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                          title="Open payment link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateInvoiceModal 
        isOpen={isCreateInvoiceOpen}
        onClose={() => setCreateInvoiceOpen(false)}
        onSuccess={loadData}
      />

      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-xs p-4">
            <div className="fixed inset-0" onClick={() => setSelectedInvoice(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md bg-white border border-black/5 rounded-[24px] shadow-2xl p-6 space-y-6"
            >
              <div className="flex justify-between items-center border-b border-black/5 pb-2">
                <h3 className="text-xs font-bold text-gray-950 uppercase tracking-wide">Invoice Details</h3>
                <button onClick={() => setSelectedInvoice(null)} className="p-1 hover:bg-black/5 rounded-full text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-semibold text-gray-650">
                <div className="flex justify-between">
                  <span>Invoice #</span>
                  <span className="font-extrabold text-gray-950">{selectedInvoice.invoiceNumber || selectedInvoice.number || selectedInvoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Client / Company</span>
                  <span className="font-extrabold text-gray-950">{getClientName(selectedInvoice.projectId)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Due Date</span>
                  <span className="text-gray-900">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</span>
                </div>
                
                <div className="border-t border-dashed border-black/5 pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{selectedInvoice.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>GST (18%)</span>
                    <span>₹{selectedInvoice.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-gray-950 pt-1">
                    <span>Total Amount</span>
                    <span>₹{selectedInvoice.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="flex-grow py-2.5 border border-black/10 text-gray-700 text-xs font-bold rounded-full cursor-pointer hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedInvoice.status !== 'paid' && (
                  <button
                    onClick={() => handleMarkPaid(selectedInvoice.id)}
                    className="flex-grow py-2.5 bg-emerald-650 hover:bg-emerald-700 text-white text-xs font-bold rounded-full cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark as Paid
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
