"use client";
import React, { useState } from 'react';
import { Client, Project, Document, Deliverable, Invoice, ClientWorkspace } from '../../lib/types';
import { Briefcase, FileText, CheckCircle2, CreditCard, Mail } from 'lucide-react';

interface ClientWorkspaceDashboardClientProps {
  initialData: {
    client: Client;
    project: Project | null;
    documents: Document[];
    deliverables: Deliverable[];
    invoices: Invoice[];
    workspace: ClientWorkspace;
  };
}

export function ClientWorkspaceDashboardClient({ initialData }: ClientWorkspaceDashboardClientProps) {
  const [client] = useState<Client>(initialData.client);
  const [project] = useState<Project | null>(initialData.project);
  const [documents] = useState<Document[]>(initialData.documents);
  const [deliverables] = useState<Deliverable[]>(initialData.deliverables);
  const [invoices] = useState<Invoice[]>(initialData.invoices);

  const pendingDocsCount = documents.filter(d => d.status === 'pending').length;
  const pendingDelsCount = deliverables.filter(d => d.status === 'pending_approval' || d.status === 'pending').length;
  const unpaidInvsCount = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').length;

  return (
    <div className="p-6 space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-950">Welcome, {client.name}</h2>
          <p className="text-xs text-gray-550 font-semibold mt-0.5">Here is the status of your project workspace with Ann.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {project && (
          <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm space-y-3 col-span-2">
            <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wide">
              <span>Overall Project Progress</span>
              <span>{project.progress}%</span>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex-grow bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-gray-950 h-full rounded-full transition-all duration-300 w-[var(--p)]" style={{ '--p': `${project.progress}%` } as React.CSSProperties} />
              </div>
            </div>
            <p className="text-xs text-gray-500 font-semibold mt-2 font-sans">
              Current project phase is <span className="font-extrabold text-gray-805 uppercase">{project.status.replace('_', ' ')}</span>.
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm space-y-3">
          <span className="text-[10px] font-bold text-gray-450 uppercase tracking-wider block">Assigned Freelancer</span>
          <div className="flex items-center gap-3 pt-1">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfyQMh7YDLdS4DNFFIrBR32RuY8F9lNA8BvQ6ZWKGr29ibB3BcWaSy9SrXqKCPYBVB--r3qPxt5RTbd0SZ-sZRTM8Xt6Kh8pG4SYwJZ74-Qi_EB_2v_iJ1ON28qaaePZjrHYC9diaY1x7ar25MBlJy-htNlqzQHgo6Tf7FFTlXmLrm2jmrK4EBVzv24OLqImh76DHBcLJFVpbyoSAYSBCeFNUH5A3TpFRRInmdu5W0Il9OAMCfXQkX0tf4PDOPsE3QA-ya1tuEPGj-"
              alt="Ann"
              className="w-10 h-10 rounded-full border border-black/5 object-cover"
            />
            <div>
              <h4 className="text-xs font-bold text-gray-900">Ann Kowalski</h4>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Freelancer Admin</span>
            </div>
          </div>
          <div className="pt-2 text-[11px] font-bold text-gray-600 space-y-1">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              <span>ann.k@flowdesk.com</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Required Documents</span>
            <h4 className="text-sm font-extrabold text-gray-950">{pendingDocsCount} Pending</h4>
          </div>
          <div className={`p-3 rounded-full ${pendingDocsCount > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Deliverables</span>
            <h4 className="text-sm font-extrabold text-gray-950">{pendingDelsCount} To Review</h4>
          </div>
          <div className={`p-3 rounded-full ${pendingDelsCount > 0 ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Invoices</span>
            <h4 className="text-sm font-extrabold text-gray-950">{unpaidInvsCount} Unpaid</h4>
          </div>
          <div className={`p-3 rounded-full ${unpaidInvsCount > 0 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
