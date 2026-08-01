'use client';

import React from 'react';
import { Client, Document, Deliverable, Invoice, Project } from '@/lib/types';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

interface WorkspaceCompletionProps {
  client: Client;
  documents?: Document[];
  deliverables?: Deliverable[];
  invoices?: Invoice[];
  projects?: Project[];
  onNavigateTab?: (tab: string) => void;
}

export function WorkspaceCompletion({
  client,
  documents = [],
  deliverables = [],
  invoices = [],
  projects = [],
  onNavigateTab
}: WorkspaceCompletionProps) {
  const isClientActive = client.status === 'active' || client.status === 'invited';

  const verifiedDocsCount = documents.filter(d => d.status === 'verified').length;
  const docsPercent = documents.length > 0 ? Math.round((verifiedDocsCount / documents.length) * 100) : (documents.length === 0 ? 100 : 0);
  const isDocsComplete = documents.length === 0 || verifiedDocsCount === documents.length;

  const approvedDeliverablesCount = deliverables.filter(d => d.status === 'approved').length;
  const delivsPercent = deliverables.length > 0 ? Math.round((approvedDeliverablesCount / deliverables.length) * 100) : 0;
  const isDelivsComplete = deliverables.length > 0 && approvedDeliverablesCount > 0;

  const paidInvoicesCount = invoices.filter(i => i.paymentStatus === 'paid' || i.status === 'paid').length;
  const invoicesPercent = invoices.length > 0 ? Math.round((paidInvoicesCount / invoices.length) * 100) : 0;
  const isInvoicesComplete = invoices.length > 0 && paidInvoicesCount === invoices.length;

  const stages = [
    {
      id: 'invited',
      label: 'Client Onboarded',
      completed: isClientActive,
      percent: isClientActive ? 100 : 0,
      targetTab: 'overview'
    },
    {
      id: 'documents',
      label: 'Documents Received',
      completed: isDocsComplete,
      percent: docsPercent,
      targetTab: 'documents'
    },
    {
      id: 'deliverables',
      label: 'Deliverable Approved',
      completed: isDelivsComplete,
      percent: delivsPercent,
      targetTab: 'deliverables'
    },
    {
      id: 'invoices',
      label: 'Invoice Paid',
      completed: isInvoicesComplete,
      percent: invoicesPercent,
      targetTab: 'invoices'
    }
  ];

  const completedStagesCount = stages.filter(s => s.completed).length;
  const overallPercent = Math.round((completedStagesCount / stages.length) * 100);

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl border border-black/5 p-6 space-y-5 shadow-2xs font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider">Client Journey & Completion</h3>
          <p className="text-xs font-semibold text-gray-400">Milestone progression across the engagement lifecycle.</p>
        </div>
        <div className="text-right">
          <span className="text-xl font-black text-gray-950 font-mono">{overallPercent}%</span>
          <span className="text-[10px] font-bold text-gray-400 block uppercase">Overall Progress</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-emerald-600 rounded-full transition-all duration-500"
          style={{ width: `${overallPercent}%` }}
        />
      </div>

      {/* Stages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {stages.map((stage, idx) => (
          <div
            key={stage.id}
            onClick={() => onNavigateTab && onNavigateTab(stage.targetTab)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              stage.completed 
                ? 'bg-emerald-50/40 border-emerald-200/60' 
                : 'bg-white border-black/5 hover:border-black/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Stage 0{idx + 1}</span>
              {stage.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300" />
              )}
            </div>

            <p className={`text-xs font-extrabold ${stage.completed ? 'text-emerald-950' : 'text-gray-900'}`}>
              {stage.label}
            </p>

            <div className="mt-3 flex items-center justify-between text-[10px] font-bold">
              <span className={stage.completed ? 'text-emerald-700' : 'text-gray-400'}>
                {stage.percent}% Done
              </span>
              {onNavigateTab && (
                <span className="text-gray-400 hover:text-gray-950 flex items-center gap-0.5">
                  View <ArrowRight className="w-3 h-3" />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
