'use client';

import React from 'react';
import { InvoiceReceipt, Invoice, Client } from '@/lib/types';
import { getCurrencySymbol, formatCurrency } from '@/lib/utils/currency';
import { CheckCircle2, Download, Printer, X, ShieldCheck, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: InvoiceReceipt | null;
  invoice: Invoice | null;
  client?: Client | null;
}

export default function ReceiptModal({ isOpen, onClose, receipt, invoice, client }: ReceiptModalProps) {
  if (!isOpen || !receipt || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const text = `
==================================================
              FLOWDESK OFFICIAL PAYMENT RECEIPT
==================================================
Receipt #:     ${receipt.receiptNumber}
Invoice #:     ${invoice.invoiceNumber}
Date Paid:     ${new Date(receipt.paidAt).toLocaleDateString()}
Client:        ${client?.name || 'Valued Client'} (${client?.company || ''})
--------------------------------------------------
Payment Method: ${receipt.paymentMethod}
Payment ID:     ${receipt.paymentId}
${receipt.razorpayOrderId ? `Razorpay Order:  ${receipt.razorpayOrderId}\n` : ''}Amount Paid:   ${formatCurrency(receipt.amountPaid, receipt.currency || invoice.currency)}
Status:        COMPLETED / VERIFIED
--------------------------------------------------
Thank you for your prompt payment!
==================================================
`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${receipt.receiptNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 print:p-0">
      <div className="fixed inset-0 print:hidden" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-lg bg-white border border-black/10 rounded-[28px] shadow-2xl p-6 space-y-6 overflow-hidden print:shadow-none print:border-none print:max-w-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-extrabold text-gray-900">Official Payment Receipt</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div className="space-y-6">
          <div className="text-center py-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-1.5" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">Payment Verified</span>
            <h4 className="text-2xl font-black text-gray-950 mt-1">
              {formatCurrency(receipt.amountPaid, receipt.currency || invoice.currency)}
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Receipt Number</span>
              <span className="font-mono font-bold text-gray-900 text-sm">{receipt.receiptNumber}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Invoice Number</span>
              <span className="font-mono font-bold text-gray-900 text-sm">#{invoice.invoiceNumber}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Billed To</span>
              <span className="font-bold text-gray-900">{client?.name || 'Client'}</span>
              {client?.company && <span className="block text-[10px] text-gray-500 font-medium">{client.company}</span>}
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Date Paid</span>
              <span className="font-bold text-gray-900">{new Date(receipt.paidAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-black/5 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Payment Method:</span>
              <span className="font-bold text-gray-900 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                {receipt.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Transaction ID:</span>
              <span className="font-mono text-gray-800 text-[11px]">{receipt.paymentId}</span>
            </div>
            {receipt.razorpayOrderId && (
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Razorpay Order ID:</span>
                <span className="font-mono text-gray-800 text-[11px]">{receipt.razorpayOrderId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2 print:hidden">
          <button
            onClick={handleDownload}
            className="flex-1 py-2.5 border border-black/10 hover:bg-gray-50 font-bold text-xs rounded-full transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-gray-800"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-gray-950 hover:bg-gray-800 text-white font-bold text-xs rounded-full transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
        </div>
      </motion.div>
    </div>
  );
}
