'use client';

import React, { useState, useEffect } from 'react';
import { 
  Invoice, Client, Project, InvoiceActivity, InvoiceReminder, InvoiceReceipt 
} from '@/lib/types';
import { getCurrencySymbol } from '@/lib/utils/currency';
import { 
  sendInvoice, sendInvoiceReminder, markPaidOffline, duplicateInvoice, 
  getInvoiceActivities, getInvoiceReminders, getInvoiceReceipt 
} from '@/lib/services/invoiceService';
import { useApp } from '@/components/AppContext';
import ReceiptModal from './ReceiptModal';
import { 
  X, Send, Bell, CheckCircle2, Download, Printer, Copy, CreditCard, 
  Clock, Eye, FileText, AlertTriangle, ChevronDown 
} from 'lucide-react';
import RazorpayCheckout from '@/components/ui/RazorpayCheckout';
import { motion } from 'motion/react';
import { InvoicePrintView } from './InvoicePrintView';

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  projects: Project[];
  clients: Client[];
  onRefresh?: () => void;
}

export default function InvoiceDetailModal({
  isOpen, onClose, invoice, projects, clients, onRefresh
}: InvoiceDetailModalProps) {
  const { addToast, user } = useApp();

  const [activities, setActivities] = useState<InvoiceActivity[]>([]);
  const [reminders, setReminders] = useState<InvoiceReminder[]>([]);
  const [receipt, setReceipt] = useState<InvoiceReceipt | null>(null);

  const [showOfflineMenu, setShowOfflineMenu] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reminderError, setReminderError] = useState('');

  const currentInvoice = invoice;

  useEffect(() => {
    if (isOpen && currentInvoice) {
      loadDetails(currentInvoice.id);
    }
  }, [isOpen, currentInvoice]);

  const loadDetails = async (id: string) => {
    try {
      const [acts, rems, rec] = await Promise.all([
        getInvoiceActivities(id),
        getInvoiceReminders(id),
        getInvoiceReceipt(id)
      ]);
      setActivities(acts);
      setReminders(rems);
      setReceipt(rec);
    } catch (e) {}
  };

  if (!isOpen || !currentInvoice) return null;

  const project = projects.find(p => p.id === currentInvoice.projectId);
  const client = clients.find(c => c.id === (currentInvoice.clientId || project?.clientId));

  const isPaid = currentInvoice.paymentStatus === 'paid';
  const isDraft = currentInvoice.workflowStatus === 'draft';
  const currencySymbol = getCurrencySymbol(currentInvoice.currency);

  const handleSend = async () => {
    setLoading(true);
    try {
      await sendInvoice(currentInvoice.id);
      addToast(`Invoice ${currentInvoice.invoiceNumber} sent to client!`, 'success');
      if (onRefresh) onRefresh();
      loadDetails(currentInvoice.id);
    } catch (e: any) {
      addToast(e.message || 'Failed to send invoice', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async () => {
    setReminderError('');
    setLoading(true);
    try {
      await sendInvoiceReminder(currentInvoice.id);
      addToast(`Payment reminder sent for #${currentInvoice.invoiceNumber}!`, 'success');
      if (onRefresh) onRefresh();
      loadDetails(currentInvoice.id);
    } catch (e: any) {
      setReminderError(e.message || 'Failed to send reminder');
      addToast(e.message || 'Failed to send reminder', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleOfflinePayment = async (method: 'bank_transfer' | 'cash' | 'cheque' | 'other') => {
    setShowOfflineMenu(false);
    setLoading(true);
    try {
      const res = await markPaidOffline(currentInvoice.id, method);
      addToast(`Invoice marked as Paid via ${method.replace('_', ' ')}!`, 'success');
      setReceipt(res.receipt);
      setShowReceipt(true);
      if (onRefresh) onRefresh();
      loadDetails(currentInvoice.id);
    } catch (e: any) {
      addToast(e.message || 'Failed to mark payment', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async () => {
    setLoading(true);
    try {
      const copy = await duplicateInvoice(currentInvoice.id);
      addToast(`Created draft copy ${copy.invoiceNumber}!`, 'success');
      if (onRefresh) onRefresh();
      onClose();
    } catch (e: any) {
      addToast(e.message || 'Failed to duplicate invoice', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 print:p-0">
        <div className="fixed inset-0 print:hidden" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative z-10 w-full max-w-4xl bg-white border border-black/10 rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-w-none print:shadow-none print:border-none"
        >
          {/* Top Bar Actions */}
          <div className="h-16 px-6 border-b border-black/5 bg-gray-50/80 flex items-center justify-between shrink-0 print:hidden">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-gray-900 bg-white border border-black/10 px-3 py-1 rounded-lg">
                #{currentInvoice.invoiceNumber}
              </span>
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                isPaid ? 'bg-emerald-100 text-emerald-800' :
                currentInvoice.workflowStatus === 'viewed' ? 'bg-indigo-100 text-indigo-800' :
                currentInvoice.workflowStatus === 'sent' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'
              }`}>
                {isPaid ? 'Paid' : currentInvoice.workflowStatus}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isDraft && (
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="px-3.5 py-2 bg-gray-950 hover:bg-gray-800 text-white font-bold text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send to Client
                </button>
              )}

              {!isPaid && !isDraft && currentInvoice.workflowStatus !== 'cancelled' && (
                <RazorpayCheckout
                  invoiceId={currentInvoice.id}
                  invoiceNumber={currentInvoice.invoiceNumber}
                  amount={currentInvoice.total}
                  currency={currentInvoice.currency}
                  businessName={(user as any)?.businessName || 'FlowDesk'}
                  clientEmail={client?.email}
                  clientPhone={client?.phone}
                  onSuccess={() => {
                    if (onRefresh) onRefresh();
                    loadDetails(currentInvoice.id);
                    setLoading(false);
                  }}
                  onError={() => setLoading(false)}
                />
              )}

              {!isPaid && !isDraft && (
                <div className="relative">
                  <button
                    onClick={handleSendReminder}
                    disabled={loading || reminders.length >= 5}
                    className="px-3.5 py-2 border border-black/10 hover:bg-gray-100 disabled:opacity-50 text-gray-800 font-bold text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    {reminders.length >= 5 ? 'Limit Reached' : `Send Reminder (${reminders.length}/5)`}
                  </button>
                </div>
              )}

              {!isPaid && (
                <div className="relative">
                  <button
                    onClick={() => setShowOfflineMenu(!showOfflineMenu)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Paid (Offline)
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {showOfflineMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-black/10 rounded-2xl shadow-xl p-1.5 z-30 text-xs">
                      <button
                        onClick={() => handleOfflinePayment('bank_transfer')}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 font-semibold text-gray-800 rounded-xl"
                      >
                        Bank Transfer
                      </button>
                      <button
                        onClick={() => handleOfflinePayment('cash')}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 font-semibold text-gray-800 rounded-xl"
                      >
                        Cash
                      </button>
                      <button
                        onClick={() => handleOfflinePayment('cheque')}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 font-semibold text-gray-800 rounded-xl"
                      >
                        Cheque
                      </button>
                      <button
                        onClick={() => handleOfflinePayment('other')}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 font-semibold text-gray-800 rounded-xl"
                      >
                        Other
                      </button>
                    </div>
                  )}
                </div>
              )}

              {isPaid && receipt && (
                <button
                  onClick={() => setShowReceipt(true)}
                  className="px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View Receipt
                </button>
              )}

              <button
                onClick={async () => {
                  try {
                    addToast('Generating PDF document...', 'info');
                    const { downloadInvoicePDF } = await import('@/lib/utils/pdfDownload');
                    const { getFullSettings } = await import('@/lib/services/settingsService');
                    const fullSettings = await getFullSettings();
                    await downloadInvoicePDF(currentInvoice, fullSettings.business, client);
                    addToast('Invoice PDF downloaded successfully!', 'success');
                  } catch (e: any) {
                    console.error('PDF download error:', e);
                    addToast('Failed to generate PDF. Using print mode as fallback.', 'warning');
                    window.print();
                  }
                }}
                className="p-2 border border-black/10 hover:bg-gray-100 rounded-full text-gray-600 transition-colors cursor-pointer"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={handleDuplicate}
                className="p-2 border border-black/10 hover:bg-gray-100 rounded-full text-gray-600 transition-colors cursor-pointer"
                title="Duplicate Invoice"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                onClick={handlePrint}
                className="p-2 border border-black/10 hover:bg-gray-100 rounded-full text-gray-600 transition-colors cursor-pointer"
                title="Print Invoice"
              >
                <Printer className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Split View */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Professional Invoice Print View (8 cols) */}
            <div id="invoice-print-area" className="lg:col-span-8 space-y-6 bg-white border border-black/5 p-6 rounded-2xl print:bg-white print:border-none print:p-0 max-h-[70vh] overflow-y-auto">
              <InvoicePrintView 
                invoice={currentInvoice}
                client={client}
                project={project}
              />
            </div>

            {/* Right: Activity & Reminder History (4 cols) */}
            <div className="lg:col-span-4 space-y-6 print:hidden">
              
              {/* Status & Viewed Badge Card */}
              <div className="p-4 bg-gray-50 border border-black/5 rounded-2xl space-y-3">
                <h4 className="text-xs font-extrabold text-gray-950 uppercase tracking-wider">Invoice Analytics</h4>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">Viewed Status:</span>
                  <span className="font-bold text-gray-900 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                    {currentInvoice.viewedAt ? `Viewed (${new Date(currentInvoice.viewedAt).toLocaleDateString('en-US')})` : 'Not Viewed'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">Payment State:</span>
                  <span className={`font-extrabold capitalize ${isPaid ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {currentInvoice.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Reminders History */}
              <div className="p-4 bg-gray-50 border border-black/5 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-extrabold text-gray-950 uppercase tracking-wider">Reminder History</h4>
                  <span className="text-[10px] font-bold text-gray-400 font-mono">{reminders.length}/5 Max</span>
                </div>

                {reminderError && (
                  <p className="text-rose-600 text-[11px] font-bold">{reminderError}</p>
                )}

                {reminders.length === 0 ? (
                  <p className="text-xs text-gray-400 font-medium italic">No reminders sent yet.</p>
                ) : (
                  <div className="space-y-2">
                    {reminders.map(r => (
                      <div key={r.id} className="p-2.5 bg-white border border-black/5 rounded-xl text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-gray-900">Reminder #{r.reminderNumber}</span>
                          <span className="block text-[10px] text-gray-400">{new Date(r.sentAt).toLocaleString()}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Sent</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity Timeline */}
              <div className="p-4 bg-gray-50 border border-black/5 rounded-2xl space-y-3">
                <h4 className="text-xs font-extrabold text-gray-950 uppercase tracking-wider">Activity Log</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {activities.map(act => (
                    <div key={act.id} className="flex gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-gray-900 mt-1.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900 leading-tight">{act.description}</p>
                        <span className="text-[10px] text-gray-400 font-medium">{new Date(act.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>

      <ReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        receipt={receipt}
        invoice={currentInvoice}
        client={client}
      />
    </>
  );
}
