import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppContext';
import { read, update } from '../lib/services/dataService';
import { markAsPaid, sendReminder } from '../lib/services/invoiceService';
import { Invoice } from '../lib/types';
import { 
  FileText, Download, CheckCircle, Bell, ArrowLeft, 
  QrCode, CreditCard, Clock, ChevronRight, Check, AlertTriangle 
} from 'lucide-react';

export default function InvoiceDetailScreen() {
  const { activeInvoiceId, setScreen, addToast } = useApp();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);

  const loadInvoice = async () => {
    if (!activeInvoiceId) return;
    try {
      const inv = await read<Invoice>('invoices', activeInvoiceId);
      setInvoice(inv);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [activeInvoiceId]);

  if (!invoice) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white/10 text-gray-500 font-medium">
        <p>No active invoice selected. View invoices from the dashboard or workspaces.</p>
        <button 
          onClick={() => setScreen('dashboard')}
          className="mt-4 px-4 py-2 bg-gray-950 text-white rounded-lg text-sm cursor-pointer hover:bg-gray-800"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const handleMarkAsPaid = async () => {
    setLoading(true);
    try {
      await markAsPaid(invoice.id, 'usr_ann');
      addToast(`Invoice ${invoice.invoiceNumber} marked as paid successfully!`, 'success');
      await loadInvoice();
    } catch (e: any) {
      addToast(e.message || 'Action failed', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async () => {
    setLoading(true);
    try {
      await sendReminder(invoice.id, 'usr_ann');
      addToast('Mock email reminder dispatched to client!', 'success');
      await loadInvoice();
    } catch (e: any) {
      addToast(e.message || 'Action failed', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = invoice.status === 'overdue';

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white/10">
      
      {/* Header */}
      <header className="h-16 border-b border-gray-200/50 px-8 flex items-center justify-between bg-white/40 backdrop-blur-md">
        <button
          onClick={() => setScreen('dashboard')}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-950 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          Back to Dashboard
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => addToast('Mock PDF receipt download started...', 'info')}
            className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>

          {invoice.status !== 'paid' && (
            <button
              onClick={handleMarkAsPaid}
              disabled={loading}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-700 text-white font-semibold text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Mark as Paid
            </button>
          )}
        </div>
      </header>

      {/* Viewport */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        
        {/* Overdue Warning Banner */}
        {isOverdue && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <div className="text-xs font-semibold">
                <span className="font-extrabold uppercase">Payment Overdue:</span> This invoice has passed the scheduled deadline (May 28, 2023) and remains unpaid.
              </div>
            </div>
            <button
              onClick={handleSendReminder}
              disabled={loading}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer"
            >
              Send Reminder Email
            </button>
          </motion.div>
        )}

        {/* Invoice Summary */}
        <div className="grid grid-cols-3 gap-8">
          
          {/* Detailed Invoice Sheet (Left Side) */}
          <div className="col-span-2 glass-card p-8 rounded-xl space-y-8 border border-white/60 shadow-xs">
            
            {/* Header Block */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">TAX INVOICE</span>
                <h1 className="text-2xl font-extrabold text-gray-900 mt-1">{invoice.invoiceNumber}</h1>
                <p className="text-xs text-gray-500 font-semibold mt-1">Date: {new Date(invoice.createdAt).toLocaleDateString()}</p>
              </div>

              <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
                invoice.status === 'paid'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : invoice.status === 'overdue'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {invoice.status}
              </span>
            </div>

            {/* Client billing address block */}
            <div className="grid grid-cols-2 gap-8 border-t border-b border-gray-100 py-6 text-xs">
              <div>
                <h4 className="font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h4>
                <p className="font-bold text-gray-900 text-sm">David Stern</p>
                <p className="text-gray-500 font-semibold mt-1">Axiom Global</p>
                <p className="text-gray-500 font-semibold">San Francisco, CA</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-400 uppercase tracking-wider mb-2">Remit Payment To</h4>
                <p className="font-bold text-gray-900 text-sm">Ann Kowalski</p>
                <p className="text-gray-500 font-semibold mt-1">ann.k@flowdesk.com</p>
                <p className="text-gray-500 font-semibold">San Francisco, CA</p>
              </div>
            </div>

            {/* Line items table */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Itemized Line Details</h3>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-bold">
                    <th className="py-2.5">Description</th>
                    <th className="py-2.5 text-center">Hours</th>
                    <th className="py-2.5 text-right">Rate</th>
                    <th className="py-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {invoice.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-4 font-bold text-gray-900">{item.description}</td>
                      <td className="py-4 text-center">{item.quantity.toFixed(1)} hrs</td>
                      <td className="py-4 text-right">${item.rate.toFixed(2)}</td>
                      <td className="py-4 text-right font-bold text-gray-900">${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* QR card & summaries (Right Side) */}
          <div className="space-y-6">
            
            {/* Payment Summary Box */}
            <div className="glass-card p-6 rounded-xl space-y-6">
              <h3 className="text-sm font-bold text-gray-900">Remittance Reminders</h3>

              <div className="space-y-3 border-b border-gray-100 pb-4 text-xs font-semibold text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-gray-900">${invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                {invoice.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>GST (18%)</span>
                    <span className="text-gray-900">${invoice.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-100 text-sm font-extrabold text-gray-950">
                  <span>Total Amount Due</span>
                  <span>${invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* QR Code Graphic element */}
              <div className="p-4 border border-gray-200/50 bg-white/40 rounded-xl flex flex-col items-center justify-center text-center gap-3">
                <div className="w-32 h-32 bg-white rounded-lg p-2 shadow-xs border border-gray-100 flex items-center justify-center relative group">
                  <QrCode className="w-28 h-28 text-gray-900" />
                  <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold text-indigo-600">RAZORPAY LINK</span>
                    <span className="text-[8px] text-gray-400 font-semibold mt-1">Click to Pay</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">Scan to Remit Funds</h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-1">Remittance QR Code linked to Gateway</p>
                </div>
              </div>

              {/* Reminder action */}
              {invoice.status !== 'paid' && (
                <button
                  onClick={handleSendReminder}
                  disabled={loading}
                  className="w-full py-3 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 text-gray-700 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4 text-gray-500" />
                  Send Reminder
                </button>
              )}
            </div>

            {/* History logs of invoice */}
            <div className="glass-card p-6 rounded-xl space-y-4">
              <h3 className="text-xs font-bold text-gray-900">Invoice Timeline History</h3>
              <div className="space-y-3.5 text-xs font-semibold text-gray-600">
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"></div>
                  <div>
                    <p className="font-bold text-gray-800">Invoice Created</p>
                    <span className="text-[10px] text-gray-400 font-medium">July 01, 2026</span>
                  </div>
                </div>
                {invoice.status === 'paid' && (
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"></div>
                    <div>
                      <p className="font-bold text-gray-800">Payment Cleared</p>
                      <span className="text-[10px] text-gray-400 font-medium">Today</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
