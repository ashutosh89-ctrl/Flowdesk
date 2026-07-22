"use client";
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { approveDeliverable, requestRevision } from '../../lib/services/deliverableService';
import { Client, Project, Deliverable } from '../../lib/types';
import { Layers, X, Play, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ClientDeliverablesClientProps {
  initialData: {
    client: Client;
    project: Project | null;
    deliverables: Deliverable[];
  };
}

export function ClientDeliverablesClient({ initialData }: ClientDeliverablesClientProps) {
  const { addToast } = useApp();
  
  const [client] = useState<Client>(initialData.client);
  const [project] = useState<Project | null>(initialData.project);
  const [deliverables, setDeliverables] = useState<Deliverable[]>(initialData.deliverables);
  
  const [showRevisionModal, setShowRevisionModal] = useState<string | null>(null);
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    if (!project) return;
    try {
      const delsRes = await fetch(`/api/deliverables?projectId=${project.id}`);
      setDeliverables(await delsRes.json());
    } catch (e) {}
  };

  // Optimistic UI for deliverable sign-off/approval
  const handleApprove = async (delId: string) => {
    const prevDels = [...deliverables];
    setDeliverables(prev => prev.map(d => d.id === delId ? { ...d, status: 'approved' as const } : d));
    addToast('Deliverable approved! Ann has been notified.', 'success');

    try {
      await approveDeliverable(delId, client.id);
      await loadData();
    } catch (e) {
      setDeliverables(prevDels);
      addToast('Failed to approve deliverable. Rolled back.', 'warning');
    }
  };

  const handleRevisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRevisionModal || !revisionFeedback.trim()) return;

    setSubmitting(true);
    try {
      await requestRevision(showRevisionModal, revisionFeedback);
      addToast('Revision feedback sent! Freelancer is on it.', 'info');
      setShowRevisionModal(null);
      setRevisionFeedback('');
      await loadData();
    } catch (e) {
      addToast('Failed to submit revision request', 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      <div className="border-b border-black/5 pb-4">
        <h2 className="text-xl font-bold text-gray-950">Deliverables</h2>
        <p className="text-xs text-gray-550 font-semibold mt-0.5">Review current deliverables, request modifications, or sign off assets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-450">Deliverable Statuses</h3>
          <div className="space-y-3">
            {deliverables.length === 0 ? (
              <p className="text-xs text-gray-455 font-semibold text-center py-6">No deliverables to display.</p>
            ) : (
              deliverables.map((del) => (
                <div key={del.id} className="p-3 border border-black/5 rounded-xl bg-gray-50/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-gray-900">{del.name}</h4>
                    <span className="text-[9px] font-bold text-gray-400">Ver {del.version}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider inline-block ${
                    del.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    del.status === 'revision_requested' ? 'bg-red-50 text-red-750 border-red-150/30' :
                    'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {del.status.replace('_', ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {deliverables.map((del) => (
            <div key={del.id} className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-950">{del.name}</h3>
                  <p className="text-xs text-gray-400 font-semibold mt-1">Version {del.version} • Published by Freelancer</p>
                </div>
                <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                  del.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  del.status === 'revision_requested' ? 'bg-red-50 text-red-750 border-red-150/30' :
                  'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {del.status.replace('_', ' ')}
                </span>
              </div>

              <div className="aspect-video bg-gray-950 rounded-xl flex flex-col items-center justify-center p-6 text-center text-white relative overflow-hidden group">
                <div className="absolute inset-0 bg-black/45" />
                <Play className="w-12 h-12 text-gray-950 bg-white p-3.5 rounded-full shadow-lg cursor-pointer group-hover:scale-105 transition-all z-10" />
                <div className="z-10 mt-3">
                  <p className="text-xs font-bold">{del.name}</p>
                  <p className="text-[9px] text-white/60 mt-1 font-semibold uppercase">Review UI/UX workflow</p>
                </div>
              </div>

              {del.status === 'pending_approval' && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowRevisionModal(del.id)}
                    className="flex-grow py-2.5 border border-black/10 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-full transition-colors cursor-pointer"
                  >
                    Request Revision
                  </button>
                  <button
                    onClick={() => handleApprove(del.id)}
                    className="flex-grow py-2.5 bg-gray-950 hover:bg-gray-800 text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
                  >
                    Approve & Sign Off
                  </button>
                </div>
              )}
            </div>
          ))}

          {deliverables.length === 0 && (
            <div className="bg-white rounded-2xl border border-black/5 p-12 text-center text-xs font-semibold text-gray-400 shadow-sm">
              No deliverables have been uploaded for review yet.
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showRevisionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-xs p-4">
            <div className="fixed inset-0" onClick={() => setShowRevisionModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-sm bg-white border border-black/5 rounded-[24px] shadow-2xl p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-black/5 pb-2">
                <h3 className="text-xs font-bold text-gray-950 uppercase tracking-wide">Request Asset Revision</h3>
                <button onClick={() => setShowRevisionModal(null)} className="p-1">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleRevisionSubmit} className="space-y-4">
                <textarea
                  rows={4}
                  value={revisionFeedback}
                  onChange={(e) => setRevisionFeedback(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-black/10 rounded-xl text-xs font-semibold focus:outline-none focus:border-gray-950 resize-none"
                  placeholder="Specify layout changes, styling adjustments, or edits requested..."
                  required
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRevisionModal(null)}
                    className="flex-grow py-2.5 border border-black/10 text-gray-700 text-xs font-bold rounded-full cursor-pointer hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-grow py-2.5 bg-gray-950 text-white text-xs font-bold rounded-full cursor-pointer flex items-center justify-center"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Feedback'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
