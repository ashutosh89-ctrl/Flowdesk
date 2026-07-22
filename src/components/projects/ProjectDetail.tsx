"use client";
import React, { useState, useEffect } from 'react';
import { Project, Client, Deliverable, Invoice, Comment } from '../../lib/types';
import { useApp } from '../AppContext';
import { updateProjectStatus, getProjects } from '../../lib/services/projectService';
import { readAll, update, create } from '../../lib/services/dataService';
import { addComment, getComments } from '../../lib/services/commentService';
import { X, Calendar, CheckSquare, MessageSquare, CreditCard, Layers, Plus, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ProjectDetailProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProjectDetail({ project, isOpen, onClose, onSuccess }: ProjectDetailProps) {
  const { user, addToast } = useApp();
  
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

  // Milestones checklist: we can store milestones in localStorage or use a hardcoded state persisted on project metadata
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

      // Initialize Milestones mock state (based on status)
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
      addToast(`Status updated to: ${newStatus}`, 'success');
      
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

    let computedStatus: Project['status'] = 'planning';
    if (computedProgress === 100) computedStatus = 'completed';
    else if (computedProgress >= 75) computedStatus = 'review';
    else if (computedProgress >= 25) computedStatus = 'in_progress';

    try {
      await update('projects', project.id, { 
        progress: computedProgress,
        status: computedStatus
      });
      setStatus(computedStatus);
      onSuccess();
    } catch (e) {}
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !user) return;

    setCommentLoading(true);
    try {
      const newComm = await addComment({
        projectId: project.id,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content: newCommentText
      });

      setComments([...comments, newComm]);
      setNewCommentText('');
      addToast('Comment added!', 'success');
    } catch (e) {
      addToast('Failed to add comment', 'warning');
    } finally {
      setCommentLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/25 backdrop-blur-xs select-none">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative z-50 w-full max-w-lg h-full bg-[#F5F5F3] shadow-2xl p-6 flex flex-col justify-between border-l border-black/5"
      >
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-black/5">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Project Details</span>
              <h2 className="text-lg font-extrabold text-gray-900 truncate max-w-sm mt-0.5">{project.name}</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-gray-200/50 rounded-full cursor-pointer text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Properties */}
          <div className="grid grid-cols-2 gap-4 py-4 border-b border-black/5 text-xs">
            {/* Status Selector */}
            <div className="space-y-1">
              <span className="font-semibold text-gray-400 block">Status</span>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as Project['status'])}
                className="w-full h-9 px-3 bg-white border border-black/5 rounded-xl text-gray-800 font-bold focus:outline-none focus:ring-1 focus:ring-gray-950/10 text-xs appearance-none"
              >
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Due Date Picker */}
            <div className="space-y-1">
              <span className="font-semibold text-gray-400 block">Due Date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => handleDueDateChange(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-black/5 rounded-xl text-gray-800 font-bold focus:outline-none focus:ring-1 focus:ring-gray-950/10 text-xs"
              />
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-black/5 mt-4">
            {[
              { id: 'milestones', label: 'Milestones', icon: CheckSquare },
              { id: 'deliverables', label: 'Deliverables', icon: Layers },
              { id: 'invoices', label: 'Invoices', icon: CreditCard },
              { id: 'comments', label: 'Comments', icon: MessageSquare }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isActive 
                      ? 'border-gray-900 text-gray-900' 
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-auto py-6">
            {activeTab === 'milestones' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Milestone Checklist</h4>
                <div className="space-y-3 bg-white border border-black/5 rounded-2xl p-4 shadow-sm">
                  {[
                    { key: 'planning', label: 'Planning & Setup Complete' },
                    { key: 'design', label: 'Interface Design Approved' },
                    { key: 'development', label: 'System Development Complete' },
                    { key: 'testing', label: 'Q&A System Testing Approved' },
                    { key: 'launch', label: 'Project Launch Ready' },
                  ].map((m) => {
                    const checked = milestones[m.key as keyof typeof milestones];
                    return (
                      <label key={m.key} className="flex items-center gap-3 cursor-pointer py-1">
                        <div className="relative w-5 h-5">
                          <input 
                            type="checkbox" 
                            className="peer sr-only" 
                            checked={checked} 
                            onChange={() => handleToggleMilestone(m.key as keyof typeof milestones)}
                          />
                          <div className="w-5 h-5 rounded border-2 border-gray-300 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 transition-all flex items-center justify-center">
                            {checked && (
                              <svg className="w-3 h-3 text-emerald-500 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className={`text-xs font-semibold ${checked ? 'text-gray-450 line-through' : 'text-gray-800'}`}>
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
                <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Project Deliverables</h4>
                {deliverables.length === 0 ? (
                  <p className="text-xs text-gray-400 font-semibold py-8 text-center bg-white border border-black/5 rounded-2xl">No deliverables uploaded for this project.</p>
                ) : (
                  <div className="space-y-3">
                    {deliverables.map((del) => (
                      <div key={del.id} className="bg-white border border-black/5 rounded-xl p-4 flex items-center justify-between shadow-sm">
                        <div>
                          <h5 className="text-xs font-bold text-gray-900">{del.name}</h5>
                          <span className="text-[10px] text-gray-400 font-semibold">Version {del.version}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                          del.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          del.status === 'revision_requested' ? 'bg-red-50 text-red-700 border-red-100' :
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {del.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Project Invoices</h4>
                {invoices.length === 0 ? (
                  <p className="text-xs text-gray-400 font-semibold py-8 text-center bg-white border border-black/5 rounded-2xl">No invoices billed to this project.</p>
                ) : (
                  <div className="space-y-3">
                    {invoices.map((inv) => (
                      <div key={inv.id} className="bg-white border border-black/5 rounded-xl p-4 flex items-center justify-between shadow-sm">
                        <div>
                          <h5 className="text-xs font-bold text-gray-900">{inv.invoiceNumber}</h5>
                          <span className="text-[10px] text-gray-400 font-semibold">Due {new Date(inv.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-gray-950 block">₹{inv.total.toLocaleString()}</span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full border uppercase tracking-wider inline-block mt-1 ${
                            inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            inv.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-100' :
                            'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="space-y-4 h-full flex flex-col justify-between">
                <div className="flex-1 overflow-auto space-y-4 pr-1 max-h-[300px]">
                  {comments.length === 0 ? (
                    <p className="text-xs text-gray-400 font-semibold py-8 text-center bg-white border border-black/5 rounded-2xl">No comments recorded. Start the thread!</p>
                  ) : (
                    comments.map((comm) => (
                      <div key={comm.id} className="flex gap-3 bg-white border border-black/5 rounded-xl p-3 shadow-sm">
                        <img 
                          src={comm.userAvatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + comm.userName} 
                          alt="avatar" 
                          className="w-8 h-8 rounded-full border object-cover shrink-0" 
                        />
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-gray-950 truncate">{comm.userName}</span>
                            <span className="text-[9px] text-gray-400 font-semibold">
                              {new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-650 leading-relaxed font-medium">{comm.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2 pt-4 border-t border-black/5 shrink-0">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Ask a question or leave a note..."
                    className="flex-1 h-10 px-3 bg-white border border-black/10 rounded-full text-xs font-medium focus:outline-none focus:border-gray-900 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={commentLoading || !newCommentText.trim()}
                    className="h-10 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center"
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
            className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-full transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </motion.div>
    </div>
  );
}
