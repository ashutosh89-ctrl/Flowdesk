'use client';
import React from 'react';
import { Deliverable } from '@/lib/types';
import { Layers, CheckCircle2, AlertCircle } from 'lucide-react';

interface DeliverablesTabProps {
  deliverables: Deliverable[];
  onApprove: (delId: string) => void;
  onRequestRevisionModal: (delId: string) => void;
}

export function DeliverablesTab({
  deliverables,
  onApprove,
  onRequestRevisionModal
}: DeliverablesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-gray-950">Project Deliverables</h3>
          <p className="text-xs font-bold text-gray-400">Track client sign-offs and requested revisions.</p>
        </div>
      </div>

      <div className="space-y-4">
        {deliverables.length === 0 ? (
          <div className="bg-white rounded-2xl border border-black/5 p-8 text-center">
            <p className="text-xs font-bold text-gray-400">No deliverables generated yet.</p>
          </div>
        ) : (
          deliverables.map((del) => (
            <div key={del.id} className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 font-bold shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-gray-950">{del.title}</h4>
                    <p className="text-xs text-gray-500 font-medium">{del.description}</p>
                  </div>
                </div>

                <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase border ${
                  del.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  del.status === 'revision_requested' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                  'bg-gray-50 text-gray-700 border-gray-100'
                }`}>
                  {del.status.replace('_', ' ')}
                </span>
              </div>

              {del.status !== 'approved' && (
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-black/5">
                  <button
                    onClick={() => onRequestRevisionModal(del.id)}
                    className="px-3.5 py-1.5 border border-black/10 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-full flex items-center gap-1.5 cursor-pointer"
                  >
                    <AlertCircle className="w-3.5 h-3.5" /> Request Revision
                  </button>
                  <button
                    onClick={() => onApprove(del.id)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
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
