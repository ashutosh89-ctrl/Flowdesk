"use client";
import React, { useState, useEffect } from 'react';
import { Project, Client, Deliverable, Invoice, Comment } from '../../lib/types';
import { useApp } from '../AppContext';
import { updateProjectStatus, getProjects } from '../../lib/services/projectService';
import { readAll, update, create } from '../../lib/services/dataService';
import { addComment, getComments } from '../../lib/services/commentService';
import { X, Calendar, CheckSquare, MessageSquare, CreditCard, Layers, Plus, Loader2, UploadCloud, Receipt } from 'lucide-react';
import { motion } from 'motion/react';
import { getCurrencySymbol } from '@/lib/utils/currency';

interface ProjectDetailProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProjectDetail({ project, isOpen, onClose, onSuccess }: ProjectDetailProps) {
  const { user, addToast, setCreateInvoiceOpen, setActiveClientId, setActiveProjectId } = useApp();
  
  const [status, setStatus] = useState<Project['status']>(project.status);
  const [dueDate, setDueDate] = useState(project.dueDate || '');
  const [client, setClient] = useState<Client | null>(null);

  // Tabs: 'milestones' | 'deliverables' | 'invoices' | 'comments'
  const [activeTab, setActiveTab] = useState<'milestones' | 'deliverables' | 'invoices' | 'comments'>('milestones');

  // Sub-items states
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const [milestones, setMilestones] = useState({
    planning: false,
    design: false,
    development: false,
    testing: false,
    launch: false
  });

  const loadProjectRelations = async () => {
    try {
      const cls = await readAll<Client>('clients');
      const foundClient = cls.find(c => c.id === project.clientId);
      if (foundClient) setClient(foundClient);

      // Load deliverables
      const allDels = await readAll<Deliverable>('deliverables');
      setDeliverables(allDels.filter(d => d.projectId === project.id));

      // Load invoices
      const allInvs = await readAll<Invoice>('invoices');
      setInvoices(allInvs.filter(i => i.projectId === project.id));

      // Load comments
      const comms = await getComments(project.id);
      setComments(comms.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));

      // Initialize Milestones state (based on status or saved progress)
      setMilestones({
        planning: project.progress >= 25,
        design: project.progress >= 50,
        development: project.progress >= 75,
        testing: project.progress >= 90,
        launch: project.progress === 100
      });
    } catch (e) {}
  };

  useEffect(() => {
    if (isOpen) {
      loadProjectRelations();
      setStatus(project.status);
      setDueDate(project.dueDate || '');
    }
  }, [project, isOpen]);

  const handleStatusChange = async (newStatus: Project['status']) => {
    setStatus(newStatus);
    try {
      const updated = await updateProjectStatus(project.id, newStatus);
      addToast(`Status updated to: ${newStatus.replace('_', ' ')}`, 'success');
      
      // Sync milestone state immediately
      setMilestones({
        planning: updated.progress >= 25,
        design: updated.progress >= 50,
        development: updated.progress >= 75,
        testing: updated.progress >= 90,
        launch: updated.progress === 100
      });

      onSuccess();
    } catch (e) {
      addToast('Failed to update status', 'warning');
    }
  };

  const handleDueDateChange = async (dateStr: string) => {
    setDueDate(dateStr);
    try {
      await update('projects', project.id, { dueDate: dateStr });
      addToast('Project due date updated', 'success');
      onSuccess();
    } catch (e) {
      addToast('Failed to update due date', 'warning');
    }
  };

  const handleToggleMilestone = async (key: keyof typeof milestones) => {
    const updatedMilestones = { ...milestones, [key]: !milestones[key] };
    setMilestones(updatedMilestones);

    // Compute progress % based on checked items
    const checkedCount = Object.values(updatedMilestones).filter(Boolean).length;
    const computedProgress = checkedCount * 20; // 5 items total -> 20% each

    try {
      await update('projects', project.id, { progress: computedProgress });
      addToast(`Progress updated to ${computedProgress}%`, 'info');
      onSuccess();
    } catch (e) {
      addToast('Failed to update milestone progress', 'warning');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setCommentLoading(true);
    try {
      const added = await addComment({
        projectId: project.id,
        userId: user?.id || 'usr_ann',
        userName: user?.name || 'Freelancer',
        userAvatar: user?.avatar,
        content: newCommentText.trim()
      });
      setComments(prev => [...prev, added]);
      setNewCommentText('');
      addToast('Comment posted', 'success');
    } catch (e) {
      addToast('Failed to post comment', 'warning');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleCreateInvoiceClick = () => {
    setActiveClientId(project.clientId);
    setActiveProjectId?.(project.id);
    setCreateInvoiceOpen(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-xs p-4 font-sans">
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative z-50 w-full max-w-2xl max-h-[90vh] bg-[#F5F5F3] border border-black/5 rounded-[24px] shadow-2xl p-6 flex flex-col justify-between overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-black/5 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  {client ? `${client.name} (${client.company})` : 'Client Workspace'}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-gray-950 mt-1">{project.name}</h2>
              {project.description && (
                <p className="text-xs text-gray-550 font-medium mt-1 leading-relaxed">{project.description}</p>
              )}
            </div>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-full cursor-pointer text-gray-400 hover:text-gray-900 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Settings: Status & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-black/5 shadow-xs">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Status Workflow</label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as Project['status'])}
                className="w-full h-10 px-3 bg-gray-50 border border-black/10 rounded-xl text-xs font-bold text-gray-900 focus:outline-none cursor-pointer"
              >
                <option value="planning">Planning (0%)</option>
                <option value="in_progress">In Progress (33%)</option>
                <option value="review">Review (66%)</option>
                <option value="completed">Completed (100%)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Due Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => handleDueDateChange(e.target.value)}
                  className="w-full h-10 px-3 bg-gray-50 border border-black/10 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none cursor-pointer"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-black/5">
            {[
              { key: 'milestones', label: 'Milestones', icon: CheckSquare, count: 5 },
              { key: 'deliverables', label: 'Deliverables', icon: Layers, count: deliverables.length },
              { key: 'invoices', label: 'Invoices', icon: CreditCard, count: invoices.length },
              { key: 'comments', label: 'Discussion', icon: MessageSquare, count: comments.length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.key 
                    ? 'border-gray-950 text-gray-950' 
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-gray-100 font-bold">{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="min-h-[220px]">
            {activeTab === 'milestones' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Milestone Checklist</h4>
                  <span className="text-xs font-extrabold text-gray-950">Overall Progress: {project.progress}%</span>
                </div>
                <div className="space-y-2 bg-white border border-black/5 rounded-2xl p-4 shadow-sm">
                  {[
                    { key: 'planning', label: '1. Project Scope & Architecture Setup' },
                    { key: 'design', label: '2. UI/UX Wireframes & Design System' },
                    { key: 'development', label: '3. Core Feature & API Implementation' },
                    { key: 'testing', label: '4. System QA & Client Review' },
                    { key: 'launch', label: '5. Production Deployment & Handover' },
                  ].map((m) => {
                    const checked = milestones[m.key as keyof typeof milestones];
                    return (
                      <label key={m.key} className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="relative w-5 h-5">
                          <input 
                            type="checkbox" 
                            className="peer sr-only" 
                            checked={checked} 
                            onChange={() => handleToggleMilestone(m.key as keyof typeof milestones)}
                          />
                          <div className="w-5 h-5 rounded-md border-2 border-gray-300 peer-checked:border-emerald-600 peer-checked:bg-emerald-500 transition-all flex items-center justify-center">
                            {checked && (
                              <svg className="w-3.5 h-3.5 text-white stroke-current stroke-3 fill-none" viewBox="0 0 24 24">
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className={`text-xs font-bold ${checked ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {m.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'deliverables' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Project Deliverables</h4>
                </div>
                {deliverables.length === 0 ? (
                  <div className="text-center py-10 bg-white border border-black/5 rounded-2xl space-y-2">
                    <Layers className="w-8 h-8 text-gray-300 mx-auto" />
                    <p className="text-xs text-gray-400 font-semibold">No deliverables uploaded for this project yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {deliverables.map((del) => (
                      <div key={del.id} className="bg-white border border-black/5 rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
                        <div>
                          <h5 className="text-xs font-extrabold text-gray-950">{del.title || del.name}</h5>
                          <span className="text-[10px] text-gray-400 font-semibold">Version {del.version}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                          del.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          del.status === 'revision_requested' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-gray-50 text-gray-700 border-gray-100'
                        }`}>
                          {del.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Project Invoices</h4>
                  <button
                    onClick={handleCreateInvoiceClick}
                    className="px-3 py-1.5 bg-gray-950 text-white rounded-full text-[11px] font-bold hover:bg-gray-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Invoice
                  </button>
                </div>
                {invoices.length === 0 ? (
                  <div className="text-center py-10 bg-white border border-black/5 rounded-2xl space-y-3">
                    <Receipt className="w-8 h-8 text-gray-300 mx-auto" />
                    <p className="text-xs text-gray-400 font-semibold">No invoices billed to this project yet.</p>
                    <button
                      onClick={handleCreateInvoiceClick}
                      className="px-3.5 py-1.5 bg-gray-950 text-white rounded-full text-xs font-bold hover:bg-gray-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create First Invoice
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {invoices.map((inv) => {
                      const currencySymbol = getCurrencySymbol(inv.currency);
                      return (
                        <div key={inv.id} className="bg-white border border-black/5 rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
                          <div>
                            <h5 className="text-xs font-extrabold text-gray-950">{inv.invoiceNumber || `#INV-${inv.id.substring(0, 6)}`}</h5>
                            <span className="text-[10px] text-gray-400 font-semibold">Due {new Date(inv.dueDate).toLocaleDateString('en-US')}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-extrabold text-gray-950 font-mono">
                              {currencySymbol}{(inv.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                            <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider block mt-0.5 ${
                              inv.paymentStatus === 'paid' || inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              inv.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-100' :
                              'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                              {inv.paymentStatus === 'paid' || inv.status === 'paid' ? 'Paid' : (inv.workflowStatus || inv.status || 'Pending')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-3 pr-1 max-h-[250px] overflow-y-auto">
                  {comments.length === 0 ? (
                    <p className="text-xs text-gray-400 font-semibold py-8 text-center bg-white border border-black/5 rounded-2xl">No discussion notes yet. Start the thread!</p>
                  ) : (
                    comments.map((comm) => (
                      <div key={comm.id} className="flex gap-3 bg-white border border-black/5 rounded-xl p-3 shadow-2xs">
                        <img 
                          src={comm.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(comm.userName || 'User')}`} 
                          alt="avatar" 
                          className="w-7 h-7 rounded-full border object-cover shrink-0 mt-0.5" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-gray-950 truncate">{comm.userName || 'User'}</span>
                            <span className="text-[9px] text-gray-400 font-semibold">
                              {new Date(comm.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed font-medium">{comm.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2 pt-3 border-t border-black/5 shrink-0">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Ask a question or leave a note..."
                    className="flex-1 h-10 px-3.5 bg-white border border-black/10 rounded-full text-xs font-semibold focus:outline-none focus:border-gray-950 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={commentLoading || !newCommentText.trim()}
                    className="h-10 px-4 bg-gray-950 hover:bg-gray-800 text-white rounded-full text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center shadow-2xs"
                  >
                    {commentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-black/5 pt-4">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-950 hover:bg-gray-800 text-white font-bold text-xs rounded-full transition-colors cursor-pointer shadow-2xs"
          >
            Close Details
          </button>
        </div>
      </motion.div>
    </div>
  );
}
