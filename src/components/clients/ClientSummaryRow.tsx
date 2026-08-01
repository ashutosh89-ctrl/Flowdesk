'use client';

import React from 'react';
import { Client, Project, Invoice } from '@/lib/types';
import { calculateClientHealth } from '@/lib/services/healthService';
import { ClientHealthBadge } from './ClientHealthBadge';
import { getCurrencySymbol } from '@/lib/utils/currency';
import { FolderKanban, Receipt, Clock } from 'lucide-react';

interface ClientSummaryRowProps {
  client: Client;
  projects?: Project[];
  invoices?: Invoice[];
}

export function ClientSummaryRow({ client, projects = [], invoices = [] }: ClientSummaryRowProps) {
  const health = calculateClientHealth(client, projects, invoices);

  const activeProject = projects.find(p => p.clientId === client.id && p.status !== 'completed');
  
  const clientInvoices = invoices.filter(i => i.clientId === client.id);
  const pendingInvoices = clientInvoices.filter(
    i => (i.paymentStatus === 'pending' || i.status === 'pending') && i.paymentStatus !== 'paid'
  );
  const outstandingAmount = pendingInvoices.reduce((sum, i) => sum + (i.total || 0), 0);

  const currencySymbol = getCurrencySymbol('INR');

  return (
    <div className="flex items-center gap-4 text-xs font-medium text-gray-500 pt-1">
      <span className="flex items-center gap-1 font-bold text-gray-800 truncate">
        <FolderKanban className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        {activeProject ? activeProject.name : 'No Active Project'}
      </span>

      {outstandingAmount > 0 && (
        <span className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
          <Receipt className="w-3 h-3 shrink-0" />
          {currencySymbol}{outstandingAmount.toLocaleString()} Pending
        </span>
      )}

      <ClientHealthBadge health={health} />
    </div>
  );
}
