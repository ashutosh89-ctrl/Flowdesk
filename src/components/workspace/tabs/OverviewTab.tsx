'use client';
import React from 'react';
import { Client, Project, Document } from '@/lib/types';
import { Building, Mail, Phone, MapPin, CheckSquare, Square } from 'lucide-react';

interface OverviewTabProps {
  client: Client;
  project: Project | null;
  documents: Document[];
  checklistProgress: number;
  completedChecklistDocs: Document[];
  checklistDocs: Document[];
  onChecklistToggle: (docId: string, currentStatus: Document['status']) => void;
}

export function OverviewTab({
  client,
  project,
  checklistProgress,
  completedChecklistDocs,
  checklistDocs,
  onChecklistToggle
}: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-gray-950 uppercase tracking-wider">Client Profile</h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2.5 text-gray-600 font-semibold">
              <Building className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{client.company}</span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-600 font-semibold">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <a href={`mailto:${client.email}`} className="hover:underline text-gray-900">{client.email}</a>
            </div>
            <div className="flex items-center gap-2.5 text-gray-600 font-semibold">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{client.phone || '+1 (555) 019-2831'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-600 font-semibold">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <span>San Francisco, CA</span>
            </div>
          </div>
        </div>

        {project && (
          <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm space-y-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Project Progress</span>
            <h4 className="text-sm font-bold text-gray-900">{project.name}</h4>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex-grow bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-gray-950 h-full rounded-full transition-all duration-300 w-[var(--p)]" style={{ '--p': `${project.progress}%` } as React.CSSProperties} />
              </div>
              <span className="text-xs font-bold text-gray-900">{project.progress}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-extrabold text-gray-950">Workspace Overview</h3>
            <p className="text-xs font-bold text-gray-400 mt-1">Review onboarding checklist progress and recent deliverables signoffs.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="border border-black/5 rounded-xl p-4 bg-gray-50/50 space-y-3">
              <h4 className="text-xs font-bold text-gray-800">Checklist Documents</h4>
              <div className="flex items-center gap-3 pt-2">
                <div className="flex-grow bg-gray-150 h-2 rounded-full overflow-hidden">
                  <div className="bg-gray-900 h-full rounded-full transition-all w-[var(--p)]" style={{ '--p': `${checklistProgress}%` } as React.CSSProperties} />
                </div>
                <span className="text-xs font-extrabold text-gray-900">{checklistProgress}%</span>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mt-1">
                {completedChecklistDocs.length} of {checklistDocs.length} Verified
              </span>
            </div>

            <div className="border border-black/5 rounded-xl p-4 bg-gray-50/50 space-y-2">
              <h4 className="text-xs font-bold text-gray-800">Next Milestone Action</h4>
              <p className="text-xs text-gray-600 font-medium">Review and finalize contract terms before project kickoff phase.</p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-black/5">
            <h4 className="text-xs font-extrabold text-gray-950 uppercase tracking-wider">Required Onboarding Items</h4>
            <div className="space-y-2">
              {checklistDocs.map(doc => {
                const isVerified = doc.status !== 'pending';
                return (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-black/5 bg-gray-50/30 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <button onClick={() => onChecklistToggle(doc.id, doc.status)} className="cursor-pointer text-gray-700 hover:text-gray-950">
                        {isVerified ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                      </button>
                      <span className={`text-xs font-bold ${isVerified ? 'line-through text-gray-400' : 'text-gray-900'}`}>{doc.title}</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{doc.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
