"use client";
import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { processRazorpayPayment, markAsViewed, getInvoiceReceipt } from '../../lib/services/invoiceService';
import { Client, Project, Invoice, InvoiceReceipt } from '../../lib/types';
import { getCurrencySymbol, formatCurrency } from '../../lib/utils/currency';
import ReceiptModal from './ReceiptModal';
import { 
  CreditCard, ShieldCheck, Loader2, CheckCircle2, FileText, 
  Download, Eye, Lock 
} from 'lucide-react';
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
  const [selectedReceipt, setSelectedReceipt] = useState<InvoiceReceipt | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [paymentStep, setPaymentStep] = useState<'idle' | 'razorpay_modal' | 'processing' | 'success'>('idle');
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('client@upi');

  // Mark all unviewed invoices as viewed on client open
  useEffect(() => {
    invoices.forEach(inv => {
      if (inv.workflowStatus !== 'viewed' && inv.workflowStatus !== 'draft') {
        markAsViewed(inv.id).catch(() => {});
      }
    });
  }, [invoices]);

  const loadData = async () => {
    if (!project) return;
    try {
      const invsRes = await fetch(`/api/invoices`);
      const allInvs = await invsRes.json();
      setInvoices(allInvs.filter((i: any) => i.projectId === project.id));
    } catch (e) {}
  };

  const handleOpenPaymentModal = (inv: Invoice) => {
    setActiveInvoice(inv);
    setPaymentStep('razorpay_modal');
  };

  const handleConfirmRazorpayPayment = async () => {
    if (!activeInvoice) return;

    setPaymentStep('processing');
    const mockRzpPaymentId = `pay_rzp_${Math.random().toString(36).substring(2, 9)}`;
    const mockRzpOrderId = `order_rzp_${Math.random().toString(36).substring(2, 9)}`;

    try {
      const { invoice: updatedInv, receipt } = await processRazorpayPayment(
        activeInvoice.id,
        mockRzpPaymentId,
        mockRzpOrderId,
        selectedMethod.toUpperCase()
      );

      // Optimistic state update
      setInvoices(prev => prev.map(i => i.id === updatedInv.id ? updatedInv : i));
      setSelectedReceipt(receipt);
      setPaymentStep('success');
      addToast(`Payment verified! Invoice #${updatedInv.invoiceNumber} paid.`, 'success');
      loadData();
    } catch (e: any) {
      addToast(e.message || 'Payment processing failed', 'warning');
      setPaymentStep('idle');
    }
  };

  const handleViewReceipt = async (inv: Invoice) => {
    try {
      const rec = await getInvoiceReceipt(inv.id);
      setSelectedReceipt(rec);
      setActiveInvoice(inv);
      setShowReceiptModal(true);
    } catch (e) {
      addToast('Receipt not found', 'warning');
    }
  };

  return (
    <div className="p-6 space-y-6 font-sans bg-[#F5F5F3] min-h-screen select-none">
      
      {/* Header */}
      <div className="border-b border-black/5 pb-4 bg-white/40 p-4 rounded-2xl">
        <h2 className="text-xl font-black text-gray-950">Invoices & Payment Portal</h2>
        <p className="text-xs text-gray-500 font-semibold mt-0.5">Review outstanding project invoices, download official statements, and pay securely via Razorpay.</p>
      </div>

      {/* Invoices List Card */}
      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-black/5 bg-gray-50 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4">Invoice #</th>
              <th className="px-6 py-4">Subject / Project</th>
              <th className="px-6 py-4">Due Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Total Amount</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 font-semibold text-gray-800">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-xs font-semibold text-gray-400">
                  No invoices issued yet.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => {
                const isPaid = inv.paymentStatus === 'paid';
                const symbol = getCurrencySymbol(inv.currency);

                return (
                  <tr key={inv.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-gray-950">
                      #{inv.invoiceNumber || inv.number}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-gray-950 block">{inv.title || project?.name}</span>
                      <span className="text-[10px] text-gray-400 font-semibold">{inv.clientEmailSnapshot || client.email}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-mono">
                      {inv.dueDate}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                        isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isPaid ? 'Paid' : inv.workflowStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black font-mono text-gray-950 text-sm">
                      {symbol}{(inv.total || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!isPaid ? (
                        <button
                          onClick={() => handleOpenPaymentModal(inv)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ml-auto"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Pay Securely with Razorpay
                        </button>
                      ) : (
                        <button
                          onClick={() => handleViewReceipt(inv)}
                          className="px-3.5 py-1.5 border border-emerald-200 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-full hover:bg-emerald-100 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          View Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Razorpay Modal Checkout */}
      <AnimatePresence>
        {paymentStep !== 'idle' && activeInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md bg-white border border-black/10 rounded-[28px] shadow-2xl p-6 space-y-6"
            >
              {paymentStep === 'razorpay_modal' && (
                <div className="space-y-6">
                  {/* Razorpay Modal Header */}
                  <div className="flex items-center justify-between border-b border-black/5 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                        RZP
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-gray-950">Razorpay Checkout</h3>
                        <p className="text-[10px] text-gray-400 font-semibold">256-bit Encrypted Transaction</p>
                      </div>
                    </div>
                    <button onClick={() => setPaymentStep('idle')} className="text-gray-400 hover:text-gray-950">
                      <Lock className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Summary Box */}
                  <div className="p-4 bg-gray-50 border border-black/5 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Invoice Total</span>
                      <span className="text-xs font-bold text-gray-900">#{activeInvoice.invoiceNumber}</span>
                    </div>
                    <span className="text-xl font-black text-gray-950 font-mono">
                      {getCurrencySymbol(activeInvoice.currency)}{(activeInvoice.total || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Payment Method Options */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">Select Payment Method</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'upi', label: 'UPI / QR' },
                        { id: 'card', label: 'Card' },
                        { id: 'netbanking', label: 'NetBanking' }
                      ].map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMethod(m.id as any)}
                          className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all ${
                            selectedMethod === m.id
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white text-gray-700 border-black/10 hover:bg-gray-50'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    {selectedMethod === 'upi' && (
                      <div className="pt-2">
                        <input
                          type="text"
                          value={upiId}
                          onChange={e => setUpiId(e.target.value)}
                          placeholder="yourname@upi"
                          className="w-full h-10 px-3 bg-gray-50 border border-black/10 rounded-xl text-xs font-mono text-gray-900 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setPaymentStep('idle')}
                      className="flex-1 py-3 border border-black/10 font-bold text-xs rounded-full hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmRazorpayPayment}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      Pay Securely with Razorpay
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === 'processing' && (
                <div className="space-y-4 py-8 text-center">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
                  <div>
                    <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wide">Communicating with Razorpay</h3>
                    <p className="text-xs text-gray-500 font-semibold mt-1">Verifying credentials and authorizing payment...</p>
                  </div>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="space-y-4 py-4 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <div>
                    <h3 className="text-base font-black text-gray-950">Payment Successful!</h3>
                    <p className="text-xs text-gray-500 font-semibold mt-1">Thank you. Your receipt has been generated automatically.</p>
                  </div>
                  <button
                    onClick={() => {
                      setPaymentStep('idle');
                      setShowReceiptModal(true);
                    }}
                    className="w-full py-3 bg-gray-950 hover:bg-gray-800 text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
                  >
                    View Official Receipt
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        receipt={selectedReceipt}
        invoice={activeInvoice}
        client={client}
      />
    </div>
  );
}
