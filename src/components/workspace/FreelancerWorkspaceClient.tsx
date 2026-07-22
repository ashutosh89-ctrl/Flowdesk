"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../AppContext';
import { update } from '../../lib/services/dataService';
import { addComment } from '../../lib/services/commentService';
import { uploadDocument, verifyDocument } from '../../lib/services/documentService';
import { approveDeliverable, requestRevision } from '../../lib/services/deliverableService';
import { Client, ClientWorkspace, Project, Document, Deliverable, Activity, Comment, Invoice } from '../../lib/types';
import { TimelineTab } from './TimelineTab';
import { ActivityTab } from './ActivityTab';
import { 
  Briefcase, CheckCircle2, FileText, 
  Layers, MessageSquare, Phone, Mail, Building, MapPin, 
  Clock, ArrowUpRight, UploadCloud, 
  Play, AlertCircle, Send, Sparkles, X, CheckSquare, Square, CreditCard, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FreelancerWorkspaceClientProps {
  initialData: {
    client: Client;
    workspace: ClientWorkspace;
    project: Project | null;
    documents: Document[];
    deliverables: Deliverable[];
    invoices: Invoice[];
    activities: Activity[];
    comments: Comment[];
    action: any;
  };
}

export function FreelancerWorkspaceClient({ initialData }: FreelancerWorkspaceClientProps) {
  const router = useRouter();
  const { user, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'documents' | 'deliverables' | 'comments' | 'invoices' | 'activity'>('overview');
  const [client, setClient] = useState<Client>(initialData.client);
  const [workspace, setWorkspace] = useState<ClientWorkspace>(initialData.workspace);
  const [project, setProject] = useState<Project | null>(initialData.project);
  
  const [documents, setDocuments] = useState<Document[]>(initialData.documents);
  const [deliverables, setDeliverables] = useState<Deliverable[]>(initialData.deliverables);
  const [invoices, setInvoices] = useState<Invoice[]>(initialData.invoices);
  const [comments, setComments] = useState<Comment[]>(initialData.comments);
  
  const [newCommentText, setNewCommentText] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState<string | null>(null);
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [uploadType, setUploadType] = useState<'pdf' | 'png' | 'docx'>('pdf');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  const loadWorkspaceData = async () => {
    try {
      const docsRes = await fetch(`/api/documents?workspaceId=${workspace.id}`);
      setDocuments(await docsRes.json());

      if (project) {
        const delsRes = await fetch(`/api/deliverables?projectId=${project.id}`);
        setDeliverables(await delsRes.json());

        const commsRes = await fetch(`/api/comments?projectId=${project.id}`);
        setComments(await commsRes.json());

        const invsRes = await fetch(`/api/invoices`);
        const allInvs = await invsRes.json();
        setInvoices(allInvs.filter((i: any) => i.projectId === project.id));
      }
    } catch (e) {}
  };

  // Optimistic UI toggle for document checklist status
  const handleChecklistToggle = async (docId: string, currentStatus: Document['status']) => {
    const nextStatus: Document['status'] = currentStatus === 'verified' ? 'pending' : 'verified';
    const prevDocuments = [...documents];
    
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: nextStatus } : d));
    addToast(`Document status updated to ${nextStatus}!`, 'success');

    try {
      await verifyDocument(docId, nextStatus);
      await loadWorkspaceData();
    } catch (e) {
      setDocuments(prevDocuments);
      addToast('Failed to update status. Rolled back.', 'warning');
    }
  };

  // Optimistic UI for deliverable approvals
  const handleApproveDeliverable = async (delId: string) => {
    const prevDels = [...deliverables];
    setDeliverables(prev => prev.map(d => d.id === delId ? { ...d, status: 'approved' as const } : d));
    addToast('Deliverable approved!', 'success');

    try {
      await approveDeliverable(delId, client.id);
      await loadWorkspaceData();
    } catch (e: any) {
      setDeliverables(prevDels);
      addToast(e.message || 'Approval failed', 'warning');
    }
  };

  const handleRequestRevisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRevisionModal || !revisionFeedback) return;
    try {
      await requestRevision(showRevisionModal, revisionFeedback);
      addToast('Revision feedback logged and sent to client!', 'info');
      setShowRevisionModal(null);
      setRevisionFeedback('');
      await loadWorkspaceData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMockUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName) return;
    try {
      await uploadDocument({
        workspaceId: workspace.id,
        name: uploadName,
        type: uploadType,
        fileUrl: '#'
      });
      addToast(`Document "${uploadName}" uploaded!`, 'success');
      setUploadName('');
      setShowUploadModal(false);
      await loadWorkspaceData();
    } catch (e) {
      console.error(e);
    }
  };

  // Optimistic UI for comment posting
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !newCommentText) return;
    
    const tempId = `temp_${Math.random()}`;
    const newComm: Comment = {
      id: tempId,
      projectId: project.id,
      userId: user?.id || 'usr_ann',
      userName: user?.name || 'Ann Kowalski',
      userAvatar: user?.avatar,
      content: newCommentText,
      createdAt: new Date().toISOString()
    };
    
    const prevComments = [...comments];
    setComments(prev => [...prev, newComm]);
    setNewCommentText('');
    addToast('Comment posted', 'success');

    try {
      const added = await addComment({
        projectId: project.id,
        userId: user?.id || 'usr_ann',
        userName: user?.name || 'Ann Kowalski',
        userAvatar: user?.avatar,
        content: newComm.content
      });
      setComments(prev => prev.map(c => c.id === tempId ? added : c));
    } catch (e) {
      setComments(prevComments);
      addToast('Failed to post comment. Rolled back.', 'warning');
    }
  };

  // Optimistic UI for invoice payment status
  const handleMarkPaid = async (invoiceId: string) => {
    const prevInvoices = [...invoices];
    setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, status: 'paid' as const } : i));
    addToast('Invoice marked as Paid!', 'success');

    try {
      await update('invoices', invoiceId, { status: 'paid' });
      await loadWorkspaceData();
    } catch (e) {
      setInvoices(prevInvoices);
      addToast('Failed to update invoice status. Rolled back.', 'warning');
    }
  };

  const checklistDocs = documents.filter(d => ['signed', 'approved', 'verified', 'reviewed'].includes(d.status) || d.status === 'pending');
  const completedChecklistDocs = checklistDocs.filter(d => d.status !== 'pending');
  const checklistProgress = checklistDocs.length > 0 
    ? Math.round((completedChecklistDocs.length / checklistDocs.length) * 100) 
    : 0;

  // Retrieve workspace NBA action
  const action = initialData.action;

  return (
    <div className="flex-grow flex flex-col overflow-hidden font-sans h-full bg-[#F5F5F3]">
      <div className="px-6 py-5 border-b border-black/5 bg-white/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <img 
            src={client.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(client.name)}`}
            alt={client.name} 
            className="w-11 h-11 rounded-full border border-black/5 object-cover bg-gray-50 shrink-0"
            referrerPolicy="no-referrer"
          />
          <div>
            <h2 className="text-base font-extrabold text-gray-950 flex items-center gap-1.5">
              {client.name}
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                client.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                client.status === 'onboarding' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                'bg-gray-50 text-gray-500'
              }`}>
                {client.status}
              </span>
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">{client.company} Workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {action && (
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              action.priority === 'critical' ? 'bg-red-50 text-red-700 border-red-100' :
              action.priority === 'high' ? 'bg-amber-50 text-amber-700 border-amber-100' :
              action.priority === 'medium' ? 'bg-blue-50 text-blue-700 border-blue-100' :
              'bg-gray-50 text-gray-700 border-gray-105'
            }`}>
              Action Needed: {action.message}
            </div>
          )}

          <button 
            onClick={() => router.push('/freelancer/clients')}
            className="px-4 py-2 border border-black/10 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-full cursor-pointer transition-colors"
          >
            Registry
          </button>
        </div>
      </div>

      <div className="flex border-b border-black/5 bg-white/10 shrink-0 px-6 overflow-x-auto select-none">
        {[
          { id: 'overview', name: 'Overview', icon: Briefcase },
          { id: 'timeline', name: 'Timeline', icon: Clock },
          { id: 'documents', name: 'Documents', icon: FileText },
          { id: 'deliverables', name: 'Deliverables', icon: Layers },
          { id: 'invoices', name: 'Invoices', icon: CreditCard },
          { id: 'comments', name: 'Comments', icon: MessageSquare },
          { id: 'activity', name: 'Activity', icon: Clock }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive 
                  ? 'border-gray-900 text-gray-950' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    Contact Details
                  </h3>
                  <div className="space-y-3 pt-1 text-xs font-bold text-gray-600">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>Remote Workspace</span>
                    </div>
                  </div>
                </div>

                {project && (
                  <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm space-y-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Project Progress</span>
                    <h4 className="text-sm font-bold text-gray-900">{project.name}</h4>
                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex-grow bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-gray-950 h-full rounded-full transition-all duration-300" style={{ width: `${project.progress}%` }} />
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
                          <div className="bg-gray-900 h-full rounded-full transition-all" style={{ width: `${checklistProgress}%` }} />
                        </div>
                        <span className="text-xs font-extrabold text-gray-900">{checklistProgress}%</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mt-1">
                        {completedChecklistDocs.length} of {checklistDocs.length} Verified
                      </span>
                    </div>

                    <div className="border border-black/5 rounded-xl p-4 bg-gray-50/50 space-y-2">
                      <h4 className="text-xs font-bold text-gray-800">Deliverables Status</h4>
                      <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                        {deliverables.length === 0 ? "No active design assets uploaded yet." : `Currently tracking ${deliverables.length} assets with ${deliverables.filter(d => d.status === 'approved').length} approvals.`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <TimelineTab workspaceId={workspace.id} />
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-950">Onboarding Verification Checklist</h3>
                    <p className="text-xs font-bold text-gray-400 mt-1">Check and signoff required files uploaded by the client.</p>
                  </div>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Upload File
                  </button>
                </div>

                <div className="space-y-3 pt-2">
                  {checklistDocs.map((doc) => (
                    <div 
                      key={doc.id}
                      onClick={() => handleChecklistToggle(doc.id, doc.status)}
                      className="p-4 border border-black/5 rounded-xl hover:bg-gray-50/50 transition-colors flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                          <FileText className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-gray-900 leading-tight">{doc.name}</h4>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mt-0.5">
                            Status: <span className={doc.status === 'verified' ? 'text-emerald-700' : 'text-amber-600'}>{doc.status}</span>
                          </span>
                        </div>
                      </div>
                      <div className="p-1 hover:bg-black/5 rounded-full text-gray-400 group-hover:text-gray-800 transition-colors">
                        {doc.status === 'verified' ? (
                          <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-black/10 flex items-center justify-center shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}

                  {checklistDocs.length === 0 && (
                    <p className="text-xs text-gray-450 font-bold text-center py-8">No document requirements provisioned for this workspace.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'deliverables' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-950">Active Design Deliverables</h3>
                  <p className="text-xs font-bold text-gray-400 mt-1">Deliverables submitted for review, feedback, or approval sign-off.</p>
                </div>

                <div className="space-y-4 pt-2">
                  {deliverables.map((del) => (
                    <div key={del.id} className="border border-black/5 rounded-xl p-4 bg-gray-50/50 space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-xs font-extrabold text-gray-900 leading-tight">{del.name}</h4>
                          <span className="text-[10px] font-bold text-gray-400 block mt-1 uppercase tracking-wide">Version {del.version}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                          del.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          del.status === 'revision_requested' ? 'bg-red-50 text-red-750 border-red-150/30' :
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {del.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="aspect-video bg-gray-950 rounded-lg flex items-center justify-center p-6 text-center text-white relative overflow-hidden group">
                        <div className="absolute inset-0 bg-black/45" />
                        <Play className="w-12 h-12 text-gray-950 bg-white p-3.5 rounded-full shadow-lg cursor-pointer group-hover:scale-105 transition-all z-10" />
                        <div className="z-10 mt-3">
                          <p className="text-xs font-bold">{del.name}</p>
                          <p className="text-[9px] text-white/60 mt-1 font-semibold uppercase">Review UI/UX workflow</p>
                        </div>
                      </div>

                      {del.status === 'pending_approval' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => setShowRevisionModal(del.id)}
                            className="flex-grow py-2.5 border border-black/10 hover:bg-white text-gray-700 text-xs font-bold rounded-full transition-colors cursor-pointer"
                          >
                            Request Revision
                          </button>
                          <button
                            onClick={() => handleApproveDeliverable(del.id)}
                            className="flex-grow py-2.5 bg-gray-950 hover:bg-gray-800 text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
                          >
                            Sign Off Asset
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {deliverables.length === 0 && (
                    <p className="text-xs text-gray-455 font-bold text-center py-8">No deliverables uploaded for this project.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'invoices' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-950">Project Invoices</h3>
                  <p className="text-xs font-bold text-gray-400 mt-1">Outstanding bills, invoices, and payments details.</p>
                </div>

                <div className="space-y-3 pt-2">
                  {invoices.map((inv) => (
                    <div key={inv.id} className="p-4 border border-black/5 rounded-xl bg-gray-50/50 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg text-gray-500 border border-black/5">
                          <CreditCard className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-gray-900 leading-tight">{inv.invoiceNumber}</h4>
                          <span className="text-[10px] text-gray-400 font-bold block mt-0.5">Due {new Date(inv.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-extrabold text-gray-900">₹{inv.total.toLocaleString()}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                          inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {inv.status}
                        </span>
                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => handleMarkPaid(inv.id)}
                            className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-[10px] font-bold cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {invoices.length === 0 && (
                    <p className="text-xs text-gray-455 font-bold text-center py-8">No invoices created for this project.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'comments' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col h-[480px] bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm"
            >
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {comments.map((comm) => (
                  <div key={comm.id} className="flex gap-3 text-xs leading-normal">
                    <img
                      src={comm.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(comm.userName)}`}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full border border-black/5 object-cover bg-gray-50 shrink-0"
                    />
                    <div className="bg-gray-50 border border-black/5 p-3 rounded-2xl max-w-lg shadow-sm">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-bold text-gray-950">{comm.userName}</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase">
                          {new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-gray-750 font-medium">{comm.content}</p>
                    </div>
                  </div>
                ))}

                {comments.length === 0 && (
                  <p className="text-xs text-gray-400 font-bold text-center py-12">No comments posted yet.</p>
                )}
              </div>

              <form onSubmit={handleCommentSubmit} className="p-4 border-t border-black/5 bg-gray-50/50 flex gap-3">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Post comments or questions..."
                  className="flex-1 h-10 px-4 bg-white border border-black/10 rounded-full text-xs font-semibold focus:outline-none focus:border-gray-900"
                  required
                />
                <button
                  type="submit"
                  disabled={commentLoading || !newCommentText.trim()}
                  className="px-4 h-10 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center justify-center"
                >
                  {commentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <ActivityTab workspaceId={workspace.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-xs p-4">
            <div className="fixed inset-0" onClick={() => setShowUploadModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-sm bg-white border border-black/5 rounded-[24px] shadow-2xl p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-black/5 pb-2">
                <h3 className="text-xs font-bold text-gray-950 uppercase tracking-wide">Upload Required File</h3>
                <button onClick={() => setShowUploadModal(false)} className="p-1">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleMockUpload} className="space-y-4">
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={uploadName}
                      onChange={(e) => setUploadName(e.target.value)}
                      className="peer w-full h-12 px-4 pt-5 pb-1 bg-white border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 transition-all text-xs font-semibold"
                      placeholder=" "
                      required
                    />
                    <label className="absolute left-4 top-3.5 text-gray-400 text-xs transition-all pointer-events-none peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-gray-950 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-[10px]">
                      File Name / Description
                    </label>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">File Type</label>
                    <select
                      value={uploadType}
                      onChange={(e: any) => setUploadType(e.target.value)}
                      className="w-full h-11 px-3 bg-white border border-black/10 rounded-xl text-xs font-semibold focus:outline-none focus:border-gray-900"
                    >
                      <option value="pdf">PDF Document</option>
                      <option value="png">PNG Image</option>
                      <option value="docx">Word DOCX</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-grow py-2.5 border border-black/10 text-gray-700 text-xs font-bold rounded-full cursor-pointer hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-grow py-2.5 bg-gray-950 text-white text-xs font-bold rounded-full cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Upload File
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                <h3 className="text-xs font-bold text-gray-950 uppercase tracking-wide">Request Revision</h3>
                <button onClick={() => setShowRevisionModal(null)} className="p-1">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleRequestRevisionSubmit} className="space-y-4">
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
                    className="flex-grow py-2.5 bg-gray-950 text-white text-xs font-bold rounded-full cursor-pointer"
                  >
                    Submit Revision
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
