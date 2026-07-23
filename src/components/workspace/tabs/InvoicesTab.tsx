'use client';
import React from 'react';
import { Invoice } from '@/lib/types';
import { CreditCard, CheckCircle2 } from 'lucide-react';

interface InvoicesTabProps {
  invoices: Invoice[];
  onMarkPaid: (invoiceId: string) => void;
}

export function InvoicesTab({ invoices, onMarkPaid }: InvoicesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-gray-950">Project Invoices</h3>
          <p className="text-xs font-bold text-gray-400">Track payment status and invoice history.</p>
        </div>
      </div>

      <div className="space-y-4">
        {invoices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-black/5 p-8 text-center">
            <p className="text-xs font-bold text-gray-400">No invoices generated for this project yet.</p>
          </div>
        ) : (
          invoices.map((inv) => (
            <div key={inv.id} className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 font-bold shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-gray-950">{inv.number}</h4>
                    <p className="text-xs text-gray-500 font-medium">Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-extrabold text-gray-950">${inv.total.toLocaleString()}</span>
                  <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase border ${
                    inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    inv.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-100' :
                    'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {inv.status}
                  </span>
                </div>
              </div>

              {inv.status !== 'paid' && (
                <div className="flex items-center justify-end pt-2 border-t border-black/5">
                  <button
                    onClick={() => onMarkPaid(inv.id)}
                    className="px-3.5 py-1.5 bg-gray-950 hover:bg-gray-800 text-white font-bold text-xs rounded-full flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Paid
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
