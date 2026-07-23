'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/AppContext';
import { update } from '@/lib/services/dataService';
import { addComment } from '@/lib/services/commentService';
import { verifyDocument } from '@/lib/services/documentService';
import { approveDeliverable, requestRevision } from '@/lib/services/deliverableService';
import { Client, ClientWorkspace, Project, Document as AppDocument, Deliverable, Activity, Comment as AppComment, Invoice } from '@/lib/types';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/shared/Skeleton';

const OverviewTab = dynamic(() => import('./tabs/OverviewTab').then(m => m.OverviewTab), {
  loading: () => <Skeleton variant="card" className="h-96 w-full" />,
});
const TimelineTab = dynamic(() => import('./tabs/TimelineTab').then(m => m.TimelineTab), {
  loading: () => <Skeleton variant="card" className="h-96 w-full" />,
});
const DocumentsTab = dynamic(() => import('./tabs/DocumentsTab').then(m => m.DocumentsTab), {
  loading: () => <Skeleton variant="card" className="h-96 w-full" />,
});
const DeliverablesTab = dynamic(() => import('./tabs/DeliverablesTab').then(m => m.DeliverablesTab), {
  loading: () => <Skeleton variant="card" className="h-96 w-full" />,
});
const CommentsTab = dynamic(() => import('./tabs/CommentsTab').then(m => m.CommentsTab), {
  loading: () => <Skeleton variant="card" className="h-96 w-full" />,
});
const InvoicesTab = dynamic(() => import('./tabs/InvoicesTab').then(m => m.InvoicesTab), {
  loading: () => <Skeleton variant="card" className="h-96 w-full" />,
});
const ActivityTab = dynamic(() => import('./tabs/ActivityTab').then(m => m.ActivityTab), {
  loading: () => <Skeleton variant="card" className="h-96 w-full" />,
});

import { Briefcase, FileText, Layers, MessageSquare, Clock, CreditCard, Sparkles } from 'lucide-react';

interface FreelancerWorkspaceClientProps {
  initialData: {
    client: Client;
    workspace: ClientWorkspace;
    project: Project | null;
    documents: AppDocument[];
    deliverables: Deliverable[];
    invoices: Invoice[];
    activities: Activity[];
    comments: AppComment[];
    action: any;
  };
}

export function FreelancerWorkspaceClient({ initialData }: FreelancerWorkspaceClientProps) {
  const router = useRouter();
  const { user, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'documents' | 'deliverables' | 'comments' | 'invoices' | 'activity'>('overview');
  const [client] = useState<Client>(initialData.client);
  const [workspace] = useState<ClientWorkspace>(initialData.workspace);
  const [project] = useState<Project | null>(initialData.project);
  
  const [documents, setDocuments] = useState<AppDocument[]>(initialData.documents);
  const [deliverables, setDeliverables] = useState<Deliverable[]>(initialData.deliverables);
  const [invoices, setInvoices] = useState<Invoice[]>(initialData.invoices);
  const [comments, setComments] = useState<AppComment[]>(initialData.comments);
  
  const [newCommentText, setNewCommentText] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState<string | null>(null);
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  const handleChecklistToggle = async (docId: string, currentStatus: AppDocument['status']) => {
    const nextStatus: AppDocument['status'] = currentStatus === 'verified' ? 'pending' : 'verified';
    const prevDocuments = [...documents];
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: nextStatus } : d));
    addToast(`Document status updated to ${nextStatus}!`, 'success');

    try {
      await verifyDocument(docId, nextStatus);
    } catch {
      setDocuments(prevDocuments);
      addToast('Failed to update status. Rolled back.', 'warning');
    }
  };

  const handleApproveDeliverable = async (delId: string) => {
    const prevDels = [...deliverables];
    setDeliverables(prev => prev.map(d => d.id === delId ? { ...d, status: 'approved' as const } : d));
    addToast('Deliverable approved!', 'success');

    try {
      await approveDeliverable(delId, client.id);
    } catch {
      setDeliverables(prevDels);
      addToast('Failed to approve deliverable.', 'warning');
    }
  };

  const handleRequestRevision = async () => {
    if (!showRevisionModal || !revisionFeedback.trim()) return;
    const delId = showRevisionModal;
    const prevDels = [...deliverables];

    setDeliverables(prev => prev.map(d => d.id === delId ? { ...d, status: 'revision_requested' as const } : d));
    setShowRevisionModal(null);
    setRevisionFeedback('');
    addToast('Revision requested!', 'info');

    try {
      await requestRevision(delId, revisionFeedback);
    } catch {
      setDeliverables(prevDels);
      addToast('Failed to send revision request.', 'warning');
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !project) return;

    const tempId = `comm_${Math.random().toString(36).substring(2, 9)}`;
    const newComm: AppComment = {
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
    setCommentLoading(true);

    try {
      const added = await addComment({
        projectId: project.id,
        userId: user?.id || 'usr_ann',
        userName: user?.name || 'Ann Kowalski',
        userAvatar: user?.avatar,
        content: newComm.content
      });
      setComments(prev => prev.map(c => c.id === tempId ? added : c));
    } catch {
      setComments(prevComments);
      addToast('Failed to post comment.', 'warning');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleMarkPaid = async (invoiceId: string) => {
    const prevInvoices = [...invoices];
    setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, status: 'paid' as const } : i));
    addToast('Invoice marked as Paid!', 'success');

    try {
      await update('invoices', invoiceId, { status: 'paid' });
    } catch {
      setInvoices(prevInvoices);
      addToast('Failed to update invoice status.', 'warning');
    }
  };

  const checklistDocs = documents.filter(d => ['signed', 'approved', 'verified', 'reviewed'].includes(d.status) || d.status === 'pending');
  const completedChecklistDocs = checklistDocs.filter(d => d.status !== 'pending');
  const checklistProgress = checklistDocs.length > 0 ? Math.round((completedChecklistDocs.length / checklistDocs.length) * 100) : 0;

  return (
    <div className="flex-grow flex flex-col overflow-hidden font-sans h-full bg-[#F5F5F3]">
      <div className="px-6 py-5 border-b border-black/5 bg-white/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <img src={client.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(client.name)}`} alt={client.name} className="w-11 h-11 rounded-full border border-black/5 object-cover bg-gray-50 shrink-0" referrerPolicy="no-referrer" />
          <div>
            <h2 className="text-base font-extrabold text-gray-950 flex items-center gap-1.5">{client.name}</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">{client.company} Workspace</p>
          </div>
        </div>
        <button onClick={() => router.push('/freelancer/clients')} className="px-4 py-2 border border-black/10 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-full cursor-pointer transition-colors">Registry</button>
      </div>

      <div className="flex border-b border-black/5 bg-white/10 shrink-0 px-6 overflow-x-auto select-none">
        {[
          { id: 'overview', name: 'Overview', icon: Briefcase },
          { id: 'timeline', name: 'Timeline', icon: Clock },
          { id: 'documents', name: 'Documents', icon: FileText, count: documents.length },
          { id: 'deliverables', name: 'Deliverables', icon: Layers, count: deliverables.length },
          { id: 'comments', name: 'Comments', icon: MessageSquare, count: comments.length },
          { id: 'invoices', name: 'Invoices', icon: CreditCard, count: invoices.length },
          { id: 'activity', name: 'Activity', icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs cursor-pointer transition-colors ${isActive ? 'border-gray-950 text-gray-950' : 'border-transparent text-gray-400 hover:text-gray-700'}`}>
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
              {tab.count !== undefined && <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] bg-gray-100 font-bold text-gray-600">{tab.count}</span>}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && <OverviewTab client={client} project={project} documents={documents} checklistProgress={checklistProgress} completedChecklistDocs={completedChecklistDocs} checklistDocs={checklistDocs} onChecklistToggle={handleChecklistToggle} />}
        {activeTab === 'timeline' && <TimelineTab activities={initialData.activities} />}
        {activeTab === 'documents' && <DocumentsTab documents={documents} dragOver={dragOver} setDragOver={setDragOver} setShowUploadModal={setShowUploadModal} onChecklistToggle={handleChecklistToggle} />}
        {activeTab === 'deliverables' && <DeliverablesTab deliverables={deliverables} onApprove={handleApproveDeliverable} onRequestRevisionModal={setShowRevisionModal} />}
        {activeTab === 'comments' && <CommentsTab comments={comments} user={user} newCommentText={newCommentText} setNewCommentText={setNewCommentText} commentLoading={commentLoading} onSendComment={handleSendComment} />}
        {activeTab === 'invoices' && <InvoicesTab invoices={invoices} onMarkPaid={handleMarkPaid} />}
        {activeTab === 'activity' && <ActivityTab activities={initialData.activities} />}
      </div>
    </div>
  );
}
