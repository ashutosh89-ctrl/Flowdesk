"use client";
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { payInvoice } from '../../lib/services/paymentService';
import { Client, Project, Invoice } from '../../lib/types';
import { CreditCard, ShieldAlert, Loader2, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ClientInvoicesClientProps {
  initialData: {
    client: Client;
    project: Project | null;
    invoices: Invoice[];
  };
}

export function ClientInvoicesClient({ initialData }: ClientInvoicesClientProps) {
  const { addToast } = useApp();
  
  const [client] = useState<Client>(initialData.client);
  const [project] = useState<Project | null>(initialData.project);
  const [invoices, setInvoices] = useState<Invoice[]>(initialData.invoices);
  
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [simulatorStep, setSimulatorStep] = useState<'idle' | 'processing' | 'success'>('idle');
  const [loaderText, setLoaderText] = useState('Connecting to payment portal...');

  const loadData = async () => {
    if (!project) return;
    try {
      const invsRes = await fetch(`/api/invoices`);
      const allInvs = await invsRes.json();
      setInvoices(allInvs.filter((i: any) => i.projectId === project.id));
    } catch (e) {}
  };

  const triggerPaymentSimulator = (inv: Invoice) => {
    setActiveInvoice(inv);
    setSimulatorStep('processing');
    setLoaderText('Initiating secure transaction...');
    
    // 1. Optimistic update
    setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'paid' as const } : i));

    setTimeout(() => {
      setLoaderText('Verifying bank account funds...');
    }, 800);

    setTimeout(async () => {
      try {
        await payInvoice(inv.id, client.id);
        setSimulatorStep('success');
        addToast(`Payment successful for Invoice ${inv.invoiceNumber}!`, 'success');
        await loadData();
      } catch (e) {
        // Rollback
        setInvoices(initialData.invoices);
        addToast('Payment gateway timeout. Rolled back.', 'warning');
        setSimulatorStep('idle');
        setActiveInvoice(null);
      }
    }, 1800);
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'overdue':
        return 'bg-red-50 text-red-750 border-red-200/30 animate-pulse';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      <div className="border-b border-black/5 pb-4">
        <h2 className="text-xl font-bold text-gray-950">Invoices & Billing</h2>
        <p className="text-xs text-gray-550 font-semibold mt-0.5">Manage billing invoices, review itemized line statements, and settle balances.</p>
      </div>

      {invoices.some(i => i.status === 'overdue') && (
        <div className="bg-red-50/70 border border-red-250/20 rounded-2xl p-4 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-650 shrink-0" />
          <p className="text-xs text-red-900 font-bold">
            Outstanding invoices are past their payment due date. Please settle balance immediately.
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/5 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4">Invoice #</th>
              <th className="px-6 py-4">Billing Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Total Amount</th>
              <th className="px-6 py-4 text-right">Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150/40">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-xs font-semibold text-gray-400">
                  No invoices found.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-gray-950">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-gray-550">
                    {new Date(inv.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getStatusColor(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-extrabold text-gray-900">
                    ₹{inv.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {inv.status !== 'paid' ? (
                      <button
                        onClick={() => triggerPaymentSimulator(inv)}
                        className="px-4 py-2 bg-gray-950 hover:bg-gray-800 text-white font-bold text-xs rounded-full transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm inline-flex"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Pay Now
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Sattled
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {simulatorStep !== 'idle' && activeInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-sm bg-white border border-black/5 rounded-[24px] shadow-2xl p-6 text-center space-y-6"
            >
              {simulatorStep === 'processing' && (
                <div className="space-y-4 py-4">
                  <div className="flex justify-center">
                    <Loader2 className="w-10 h-10 text-gray-950 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wide">Processing Secure Payment</h3>
                    <p className="text-xs text-gray-550 font-semibold mt-2">{loaderText}</p>
                  </div>
                  <div className="border border-black/5 rounded-2xl p-3 bg-gray-50/50 text-xs font-semibold text-gray-600">
                    Invoice {activeInvoice.invoiceNumber} • ₹{activeInvoice.total.toLocaleString()}
                  </div>
                </div>
              )}

              {simulatorStep === 'success' && (
                <div className="space-y-4 py-4">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wide">Payment Completed</h3>
                    <p className="text-xs text-gray-500 font-semibold mt-2">Thank you! Your transaction has been approved.</p>
                  </div>
                  <button
                    onClick={() => {
                      setSimulatorStep('idle');
                      setActiveInvoice(null);
                    }}
                    className="w-full py-2.5 bg-gray-950 hover:bg-gray-800 text-white text-xs font-bold rounded-full cursor-pointer transition-colors"
                  >
                    Return to Invoices
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
