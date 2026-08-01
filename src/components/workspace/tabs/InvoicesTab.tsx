'use client';
import React, { useState } from 'react';
import { Invoice, Project, Client } from '@/lib/types';
import { CreditCard, CheckCircle2, Eye, Plus, Receipt } from 'lucide-react';
import { getCurrencySymbol } from '@/lib/utils/currency';
import { useApp } from '@/components/AppContext';
import InvoiceDetailModal from '@/components/invoices/InvoiceDetailModal';

interface InvoicesTabProps {
  invoices: Invoice[];
  client?: Client;
  projects?: Project[];
  onMarkPaid: (invoiceId: string) => void;
  onRefresh?: () => void;
}

export function InvoicesTab({ invoices, client, projects = [], onMarkPaid, onRefresh }: InvoicesTabProps) {
  const { setCreateInvoiceOpen, setActiveClientId } = useApp();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const handleCreateInvoiceClick = () => {
    if (client?.id) {
      setActiveClientId(client.id);
    }
    setCreateInvoiceOpen(true);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-gray-950">Workspace Invoices</h3>
          <p className="text-xs font-bold text-gray-400">Track payment status, aging, and billing history for this client.</p>
        </div>
        <button
          onClick={handleCreateInvoiceClick}
          className="px-4 py-2 bg-gray-950 text-white rounded-full font-bold text-xs hover:bg-gray-800 transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
        >
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      <div className="space-y-3">
        {invoices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-black/5 p-12 text-center space-y-3">
            <Receipt className="w-10 h-10 text-gray-300 mx-auto" />
            <div>
              <p className="text-sm font-bold text-gray-900">No invoices issued for this client yet</p>
              <p className="text-xs text-gray-400 font-semibold mt-1">Create and send commercial invoices directly from this workspace.</p>
            </div>
            <button
              onClick={handleCreateInvoiceClick}
              className="px-4 py-2 bg-gray-950 text-white rounded-full font-bold text-xs hover:bg-gray-800 transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Invoice
            </button>
          </div>
        ) : (
          invoices.map((inv) => {
            const currencySymbol = getCurrencySymbol(inv.currency);
            const isPaid = inv.paymentStatus === 'paid' || inv.status === 'paid';
            const isViewed = Boolean(inv.viewedAt || inv.workflowStatus === 'viewed');
            const invNum = inv.invoiceNumber || inv.number || `#INV-${inv.id.substring(0, 6)}`;

            return (
              <div
                key={inv.id}
                onClick={() => setSelectedInvoice(inv)}
                className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm space-y-4 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 font-bold shrink-0 group-hover:bg-gray-950 group-hover:text-white transition-colors">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-gray-950 group-hover:text-black">{invNum}</h4>
                        {isViewed && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-100">
                            <Eye className="w-3 h-3" /> Viewed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        Due: {formatDate(inv.dueDate)} • Issued: {formatDate(inv.issueDate || inv.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-base font-extrabold text-gray-950 font-mono">
                      {currencySymbol}{(inv.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase border ${
                      isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      inv.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-100' :
                      'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {isPaid ? 'Paid' : (inv.workflowStatus || inv.status || 'Pending')}
                    </span>
                  </div>
                </div>

                {!isPaid && (
                  <div className="flex items-center justify-end pt-2 border-t border-black/5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onMarkPaid(inv.id)}
                      className="px-3.5 py-1.5 bg-gray-950 hover:bg-gray-800 text-white font-bold text-xs rounded-full flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Paid
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
        projects={projects}
        clients={client ? [client] : []}
        onRefresh={onRefresh}
      />
    </div>
  );
}
