'use client';

import React, { useEffect, useState } from 'react';
import { Invoice, Client, Project, BusinessSettings } from '@/lib/types';
import { getCurrencySymbol } from '@/lib/utils/currency';
import { numberToWords } from '@/lib/utils/numberToWords';
import { getFullSettings } from '@/lib/services/settingsService';
import { QRCode } from '@/components/ui/QRCode';

interface InvoicePrintViewProps {
  invoice: Invoice;
  client?: Client;
  project?: Project;
}

export function InvoicePrintView({ invoice, client, project }: InvoicePrintViewProps) {
  const [business, setBusiness] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    getFullSettings().then(s => {
      if (s?.business) {
        setBusiness(s.business);
      }
    });
  }, []);

  const currencySymbol = getCurrencySymbol(invoice.currency);

  const hasBankDetails = Boolean(
    business?.bankName || business?.accountNumber || business?.bankCode || business?.branch
  );

  const qrValue = business?.upiId
    ? `upi://pay?pa=${encodeURIComponent(business.upiId)}&pn=${encodeURIComponent(business.businessName || 'FlowDesk')}&am=${invoice.total}&cu=${invoice.currency}`
    : invoice.razorpayLink || '';

  const amountInWords = numberToWords(invoice.total || 0, invoice.currency);

  const taxLabel = invoice.taxName ? `${invoice.taxName} (${invoice.taxRate || 0}%)` : `Tax (${invoice.taxRate || 0}%)`;

  return (
    <div className="invoice-print-container font-sans text-gray-900 w-full max-w-[210mm] mx-auto bg-white p-8 sm:p-10 shadow-lg rounded-2xl print:p-0 print:shadow-none print:rounded-none select-text">
      
      {/* 1. HEADER / LETTERHEAD (Two-column layout) */}
      <div className="flex justify-between items-start pb-6 mb-6 border-b border-gray-200">
        <div className="flex items-start gap-4">
          {business?.logo ? (
            <img
              src={business.logo}
              alt={business.businessName || 'Business Logo'}
              className="w-16 h-16 rounded-xl object-cover border border-gray-200"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gray-950 text-white flex items-center justify-center font-bold text-xl tracking-tight">
              {business?.businessName?.substring(0, 2).toUpperCase() || 'FD'}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              {business?.businessName || 'FlowDesk Business'}
            </h1>
            {business?.tagline && (
              <p className="text-xs text-gray-500 font-medium mt-0.5">{business.tagline}</p>
            )}
          </div>
        </div>

        <div className="text-right text-xs text-gray-600 space-y-1">
          {business?.businessPhone && <p className="font-medium">Phone: {business.businessPhone}</p>}
          {business?.businessEmail && <p className="font-medium">Email: {business.businessEmail}</p>}
          {business?.address && (
            <p className="text-gray-500 max-w-[240px] whitespace-pre-line leading-snug">
              {business.address}
            </p>
          )}
        </div>
      </div>

      {/* 2. INVOICE TITLE BAR */}
      <div className="bg-gray-100 rounded-xl p-4 mb-6 flex justify-between items-center border border-gray-200/60">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-gray-950 uppercase">INVOICE</h2>
        </div>
        <div className="text-right text-xs space-y-1">
          <p>
            <span className="font-semibold text-gray-500">Invoice No:</span>{' '}
            <span className="font-bold font-mono text-gray-950">{invoice.invoiceNumber}</span>
          </p>
          {project?.name && (
            <p>
              <span className="font-semibold text-gray-500">Project Ref:</span>{' '}
              <span className="font-medium text-gray-900">{project.name}</span>
            </p>
          )}
          <p>
            <span className="font-semibold text-gray-500">Date of Issue:</span>{' '}
            <span className="font-medium text-gray-900">{invoice.issueDate}</span>
          </p>
          <p>
            <span className="font-semibold text-gray-500">Due Date:</span>{' '}
            <span className="font-medium text-gray-900">{invoice.dueDate}</span>
          </p>
          <p>
            <span className="font-semibold text-gray-500">Currency:</span>{' '}
            <span className="font-bold text-gray-950">{invoice.currency} ({currencySymbol})</span>
          </p>
        </div>
      </div>

      {/* 3. BILL TO (RECIPIENT) SECTION */}
      <div className="mb-6 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
          BILL TO
        </h3>
        <p className="text-sm font-bold text-gray-950">{client?.name || 'Valued Client'}</p>
        {client?.company && (
          <p className="text-xs font-semibold text-gray-700">{client.company}</p>
        )}
        {client?.phone && <p className="text-xs text-gray-500">Phone: {client.phone}</p>}
        {(invoice.clientEmailSnapshot || client?.email) && (
          <p className="text-xs text-gray-500">Email: {invoice.clientEmailSnapshot || client?.email}</p>
        )}
      </div>

      {/* 4. ITEMS TABLE */}
      <div className="mb-6 overflow-hidden border border-gray-200 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-600">
              <th className="py-3 px-3 w-10 text-center border-r border-gray-200">#</th>
              <th className="py-3 px-4 border-r border-gray-200">Description</th>
              <th className="py-3 px-3 text-center w-16 border-r border-gray-200">Qty</th>
              <th className="py-3 px-3 text-right w-24 border-r border-gray-200">Rate</th>
              <th className="py-3 px-3 text-right w-20 border-r border-gray-200">Discount</th>
              <th className="py-3 px-3 text-right w-20 border-r border-gray-200">Tax</th>
              <th className="py-3 px-3 text-right w-28">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoice.items.map((item, i) => {
              const itemTotal = item.quantity * item.rate;
              return (
                <tr key={i} className="font-medium text-gray-800 hover:bg-gray-50/50">
                  <td className="py-3 px-3 text-center text-gray-400 font-mono border-r border-gray-100">{i + 1}</td>
                  <td className="py-3 px-4 font-semibold text-gray-950 border-r border-gray-100">{item.description}</td>
                  <td className="py-3 px-3 text-center font-mono border-r border-gray-100">{item.quantity}</td>
                  <td className="py-3 px-3 text-right font-mono border-r border-gray-100">
                    {currencySymbol}{(item.rate || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-gray-500 border-r border-gray-100">
                    {invoice.discount ? `${currencySymbol}${invoice.discount.toFixed(2)}` : '$0.00'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-gray-500 border-r border-gray-100">
                    {invoice.taxRate}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-gray-950">
                    {currencySymbol}{itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Two-Column Section: Left (Payment & QR) + Right (Totals Box) */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        
        {/* 5. BANK / PAYMENT DETAILS & 6. QR CODE (Left Side) */}
        <div className="col-span-7 space-y-4">
          {hasBankDetails && (
            <div className="border border-gray-200 rounded-xl p-4 bg-white">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 pb-1 border-b border-gray-100">
                PAYMENT DETAILS
              </h3>
              <div className="text-xs space-y-1.5 text-gray-700">
                {business?.bankName && (
                  <p className="flex justify-between">
                    <span className="font-semibold text-gray-500">Bank Name:</span>
                    <span className="font-bold text-gray-900">{business.bankName}</span>
                  </p>
                )}
                {business?.accountNumber && (
                  <p className="flex justify-between">
                    <span className="font-semibold text-gray-500">A/C Number:</span>
                    <span className="font-mono font-bold text-gray-900">{business.accountNumber}</span>
                  </p>
                )}
                {business?.bankCode && (
                  <p className="flex justify-between">
                    <span className="font-semibold text-gray-500">IFSC/SWIFT:</span>
                    <span className="font-mono font-bold text-gray-900">{business.bankCode}</span>
                  </p>
                )}
                {business?.branch && (
                  <p className="flex justify-between">
                    <span className="font-semibold text-gray-500">Branch:</span>
                    <span className="font-medium text-gray-900">{business.branch}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* QR Code & Pay Link Section */}
          {qrValue && (
            <div className="border border-gray-200 rounded-xl p-4 bg-white flex items-center gap-4">
              <div className="shrink-0">
                <QRCode value={qrValue} size={84} />
              </div>
              <div className="text-xs space-y-1 text-gray-700">
                <p className="font-bold text-gray-900">Scan QR Code to Pay</p>
                {business?.upiId && (
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-500">UPI ID:</span>{' '}
                    <span className="font-mono font-semibold">{business.upiId}</span>
                  </p>
                )}
                {invoice.razorpayLink && (
                  <p className="text-gray-600 truncate max-w-[200px]">
                    <span className="font-semibold text-gray-500">Link:</span>{' '}
                    <span className="font-mono text-[10px] text-blue-600 underline">{invoice.razorpayLink}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 9. TOTALS BOX (Right Side) */}
        <div className="col-span-5">
          <div className="border border-gray-200 rounded-xl p-4 space-y-2 text-xs bg-gray-50/50">
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Subtotal:</span>
              <span className="font-semibold font-mono text-gray-900">
                {currencySymbol}{(invoice.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Discount:</span>
              <span className="font-semibold font-mono text-gray-900">
                {currencySymbol}{(invoice.discount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="h-px bg-gray-200 my-1" />

            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Taxable Amount:</span>
              <span className="font-semibold font-mono text-gray-900">
                {currencySymbol}{((invoice.subtotal || 0) - (invoice.discount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">{taxLabel}:</span>
              <span className="font-semibold font-mono text-gray-900">
                {currencySymbol}{(invoice.taxAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="h-px bg-gray-900 my-2" />

            <div className="flex justify-between text-sm pt-0.5">
              <span className="font-bold text-gray-950 uppercase">Grand Total:</span>
              <span className="font-black font-mono text-gray-950">
                {currencySymbol}{(invoice.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 7. AMOUNT IN WORDS */}
      {(invoice.total || 0) > 0 && (
        <div className="mb-6 p-3.5 border border-gray-200 rounded-xl bg-gray-100/60">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
            AMOUNT IN WORDS
          </h3>
          <p className="text-xs font-bold text-gray-950 uppercase tracking-wide">
            {amountInWords}
          </p>
        </div>
      )}

      {/* 8. TERMS & CONDITIONS */}
      <div className="mb-8">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 pb-1 border-b border-gray-100">
          TERMS & CONDITIONS
        </h3>
        <div className="text-xs text-gray-600 space-y-1 leading-relaxed">
          {business?.termsAndConditions ? (
            business.termsAndConditions.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))
          ) : (
            <>
              <p>1. Payment is due by the date specified above.</p>
              <p>2. Please mention Invoice Number on all payment transfers.</p>
              <p>3. Late payments may incur additional charges.</p>
            </>
          )}
        </div>
      </div>

      {/* 10. AUTHORIZED SIGNATURE AREA */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-end">
          <div className="space-y-8">
            <p className="text-xs font-bold text-gray-900">
              For {business?.businessName || 'Business Name'}
            </p>
            <div>
              <div className="border-b border-gray-400 w-52 mb-1.5" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Authorized Representative
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 11. FOOTER */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center">
        <p className="text-[10px] text-gray-400 font-medium">
          This is a computer-generated invoice.
          {business?.businessEmail && ` For queries, contact: ${business.businessEmail}`}
          {business?.businessPhone && ` | ${business.businessPhone}`}
        </p>
      </div>

      {/* Print CSS Rules */}
      <style jsx global>{`
        @media print {
          nav,
          header,
          footer,
          .sidebar,
          .top-bar,
          .mobile-bottom-nav,
          [class*="bottom-nav"],
          [class*="MobileBottomNav"],
          [class*="Sidebar"],
          [class*="TopBar"],
          [class*="Toast"],
          [class*="toast"],
          [class*="no-print"],
          button:not(.print-only),
          .no-print {
            display: none !important;
          }

          @page {
            margin: 0;
            size: A4;
          }

          body {
            background: white !important;
            color: black !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .invoice-print-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
