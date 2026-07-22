import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from './AppContext';
import { read, readAll } from '../lib/services/dataService';
import { payInvoice } from '../lib/services/paymentService';
import { addComment, getComments } from '../lib/services/commentService';
import { uploadDocument } from '../lib/services/documentService';
import { approveDeliverable, requestRevision } from '../lib/services/deliverableService';
import { Client, Project, Document, Deliverable, Invoice, Comment } from '../lib/types';
import { 
  Briefcase, CheckCircle2, ChevronRight, FileText, 
  MessageSquare, Play, RefreshCw, Send, Sparkles, X, 
  ArrowUpRight, AlertCircle, FileCheck2, CreditCard, DollarSign, 
  LogOut, UploadCloud 
} from 'lucide-react';

export default function ClientPortalScreen() {
  const { user, signOut, addToast } = useApp();
  const [activePortalTab, setActivePortalTab] = useState<'overview' | 'files' | 'invoices'>('overview');
  const [client, setClient] = useState<Client | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  
  // Interactive variables
  const [newComment, setNewComment] = useState('');
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const [showRevisionModal, setShowRevisionModal] = useState<string | null>(null); // deliverableId
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [fileUploadName, setFileUploadName] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const loadPortalData = async () => {
    try {
      // Find Marta's client identity
      const cls = await readAll<Client>('clients');
      const martaClient = cls.find(c => c.email.toLowerCase() === user?.email.toLowerCase());
      if (martaClient) {
        setClient(martaClient);

        // Find projects
        const projs = await readAll<Project>('projects');
        const proj = projs.find(p => p.clientId === martaClient.id);
        if (proj) {
          setProject(proj);

          // Find deliverables
          const dels = await readAll<Deliverable>('deliverables');
          setDeliverables(dels.filter(d => d.projectId === proj.id));

          // Find invoices
          const invs = await readAll<Invoice>('invoices');
          const pendingInv = invs.find(i => i.projectId === proj.id);
          setInvoice(pendingInv || null);

          // Find comments
          const comms = await getComments(proj.id);
          setComments(comms.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
        }

        // Find documents
        const wss = await readAll<any>('workspaces');
        const ws = wss.find((w: any) => w.clientId === martaClient.id);
        if (ws) {
          const docs = await readAll<Document>('documents');
          setDocuments(docs.filter(d => d.workspaceId === ws.id));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadPortalData();
  }, [user]);

  const handlePayInvoice = async (invoiceId: string) => {
    setPayingInvoiceId(invoiceId);
    try {
      await payInvoice(invoiceId, client?.id || '');
      addToast('Payment complete! Invoice marked as paid.', 'success');
      await loadPortalData();
    } catch (e) {
      console.error(e);
      addToast('Payment processing failed', 'warning');
    } finally {
      setPayingInvoiceId(null);
    }
  };

  const handleApproveAsset = async (delId: string) => {
    if (!client) return;
    try {
      await approveDeliverable(delId, client.id);
      addToast('Asset approved! Freelancer has been notified.', 'success');
      await loadPortalData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRevisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRevisionModal || !revisionFeedback) return;
    try {
      await requestRevision(showRevisionModal, revisionFeedback);
      addToast('Feedback logged! Freelancer is on it.', 'info');
      setShowRevisionModal(null);
      setRevisionFeedback('');
      await loadPortalData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !newComment || !user) return;

    try {
      const added = await addComment({
        projectId: project.id,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content: newComment
      }, () => {
        // AI callback to reload the portal logs on auto reply
        loadPortalData();
      });

      setComments(prev => [...prev, added]);
      setNewComment('');
      addToast('Comment sent!', 'success');

      // Reload in a few seconds to verify threaded replies
      setTimeout(loadPortalData, 1600);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUploadName) return;
    try {
      const wss = await readAll<any>('workspaces');
      const ws = wss.find((w: any) => w.clientId === client?.id);
      if (ws) {
        await uploadDocument({
          workspaceId: ws.id,
          name: fileUploadName,
          type: 'pdf',
          fileUrl: '#'
        });
        addToast(`Uploaded ${fileUploadName} successfully!`, 'success');
        setFileUploadName('');
        setShowUploadModal(false);
        await loadPortalData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!client || !project) {
    return (
      <div className="min-h-screen canvas-gradient flex flex-col items-center justify-center p-8 text-gray-500 font-medium">
        <p>Loading your client workspace portal...</p>
        <button onClick={signOut} className="mt-4 text-xs font-semibold text-rose-600 flex items-center gap-1">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen canvas-gradient flex flex-col justify-between p-6">
      
      {/* Upper Layout: Portal container with lateral layouts */}
      <div className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-4 gap-8">
        
        {/* Left column sidebar for client */}
        <div className="glass-window p-6 rounded-xl flex flex-col justify-between border-white/60">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8 px-2 border-b border-gray-200/20 pb-4">
              <div className="w-8 h-8 rounded-lg bg-gray-950 flex items-center justify-center text-white font-black text-lg">
                F
              </div>
              <span className="font-bold text-lg tracking-tight text-gray-900">
                Flow<span className="text-gray-400 font-light">Desk</span>
              </span>
            </div>

            <nav className="space-y-1">
              {[
                { id: 'overview', name: 'Active Overview', icon: Briefcase },
                { id: 'files', name: 'Shared Documents', icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activePortalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActivePortalTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-gray-900 text-white' 
                        : 'text-gray-600 hover:bg-black/5 hover:text-gray-950'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer of client side */}
          <div className="pt-6 border-t border-gray-200/30">
            <div className="flex items-center gap-3 mb-4 px-2">
              <img 
                src={client.avatar} 
                alt={client.name} 
                className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-gray-900 truncate">{client.name}</h4>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{client.company}</p>
              </div>
            </div>

            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Right column: Main contents */}
        <div className="col-span-3 flex flex-col gap-8">
          
          {/* Header row */}
          <header className="glass-card p-6 rounded-xl border border-white/80 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{project.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold text-gray-400">ACTIVE PHASE:</span>
                <span className="text-[9px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full uppercase tracking-wider">
                  {project.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setActivePortalTab('files');
                  setShowUploadModal(true);
                }}
                className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs rounded-full cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <UploadCloud className="w-4 h-4" />
                Upload Doc
              </button>
            </div>
          </header>

          <AnimatePresence mode="wait">
            
            {/* View 1: Active Overview dashboard */}
            {activePortalTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-3 gap-8"
              >
                {/* Left Column: pending deliverables & invoices */}
                <div className="space-y-6 col-span-2">
                  
                  {/* Pending deliverables for review */}
                  <div className="glass-card p-6 rounded-xl space-y-4">
                    <h3 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-4.5 h-4.5 text-gray-500" />
                      Deliverables for Review
                    </h3>

                    <div className="space-y-4">
                      {deliverables.filter(d => d.status === 'pending_approval').map((del) => (
                        <div key={del.id} className="p-4 border border-gray-100 rounded-lg bg-white/40 space-y-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-xs font-bold text-gray-900">{del.name}</h4>
                              <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Version: {del.version} • Video Mock</p>
                            </div>
                            <span className="text-[9px] font-bold px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100 uppercase">
                              PENDING REVIEW
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowRevisionModal(del.id)}
                              className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-[10px] rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1"
                            >
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                              Feedback
                            </button>
                            <button
                              onClick={() => handleApproveAsset(del.id)}
                              className="flex-1 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-[10px] rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              Approve Asset
                            </button>
                          </div>
                        </div>
                      ))}

                      {deliverables.filter(d => d.status === 'pending_approval').length === 0 && (
                        <div className="text-center py-8 text-xs font-medium text-gray-400">
                          All assets have been successfully reviewed and approved.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Project Discussions */}
                  <div className="glass-card rounded-xl overflow-hidden flex flex-col h-[320px]">
                    <div className="p-4 border-b border-gray-100 bg-white/40">
                      <h3 className="text-xs font-bold text-gray-900">Project Workspace discussion</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                      {comments.map((comm) => (
                        <div key={comm.id} className="flex gap-2.5 text-[11px] leading-relaxed">
                          <img 
                            src={comm.userAvatar || 'https://api.dicebear.com/7.x/initials/svg?seed=User'} 
                            alt={comm.userName} 
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="bg-white/70 p-3 rounded-lg border border-white/60 max-w-md">
                            <div className="flex items-center gap-1.5 mb-1 text-[10px]">
                              <span className="font-extrabold text-gray-950">{comm.userName}</span>
                              <span className="text-gray-400">
                                {new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-gray-700 font-semibold">{comm.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleCommentSubmit} className="p-3 border-t border-gray-100 bg-white/30 flex gap-2">
                      <input
                        type="text"
                        placeholder="Discuss feedback directly..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white/60 hover:bg-white rounded-lg border border-gray-200 outline-none text-[11px] font-semibold"
                      />
                      <button type="submit" className="px-3 bg-gray-900 text-white rounded-lg cursor-pointer">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>

                </div>

                {/* Right Column: Invoice payments */}
                <div className="space-y-6">
                  {invoice && (
                    <div className="glass-card p-6 rounded-xl space-y-4">
                      <h3 className="text-xs font-bold text-gray-900">Pending Invoices</h3>
                      
                      <div className="p-4 border border-indigo-100 bg-indigo-50/50 rounded-xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-gray-900">{invoice.invoiceNumber}</h4>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                          </div>

                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                            invoice.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}>
                            {invoice.status}
                          </span>
                        </div>

                        <div className="flex justify-between pt-2 border-t border-gray-200/30">
                          <span className="text-[11px] font-semibold text-gray-600">Total Amount</span>
                          <span className="text-xs font-extrabold text-gray-950">${invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>

                        {invoice.status !== 'paid' && (
                          <button
                            onClick={() => handlePayInvoice(invoice.id)}
                            disabled={payingInvoiceId === invoice.id}
                            className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            {payingInvoiceId === invoice.id ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Processing Gateway...
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4" />
                                Pay Now
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              </motion.div>
            )}

            {/* View 2: Shared files */}
            {activePortalTab === 'files' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-card rounded-xl border border-white/60 overflow-hidden"
              >
                <div className="p-5 border-b border-gray-100 bg-white/40 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-gray-900">Workspace Files Archive</h3>
                </div>

                <div className="divide-y divide-gray-100">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-white/40 transition-colors text-xs font-semibold">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <div>
                          <h4 className="text-xs font-bold text-gray-900">{doc.name}</h4>
                          <p className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">{doc.type}</p>
                        </div>
                      </div>

                      <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 uppercase">
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

      {/* Revision request feedback modal */}
      <AnimatePresence>
        {showRevisionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white p-6 rounded-xl border border-gray-200 shadow-xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-950">Specify Feedback Request</h3>
                <button onClick={() => setShowRevisionModal(null)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleRevisionSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2">Feedback Comment</label>
                  <textarea
                    rows={4}
                    value={revisionFeedback}
                    onChange={(e) => setRevisionFeedback(e.target.value)}
                    placeholder="Describe adjustments clearly to coordinate with Alex..."
                    className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100/70 focus:bg-white rounded-lg border border-gray-200 outline-none text-xs font-semibold transition-all"
                    required
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRevisionModal(null)}
                    className="px-4 py-2 border border-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Send Feedback
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Client file uploader */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white p-6 rounded-xl border border-gray-200 shadow-xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-950">Upload to Shared Folder</h3>
                <button onClick={() => setShowUploadModal(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2">File Name</label>
                  <input
                    type="text"
                    value={fileUploadName}
                    onChange={(e) => setFileUploadName(e.target.value)}
                    placeholder="Product_Specifications_v2.docx"
                    className="w-full px-3 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white rounded-lg border border-gray-200 outline-none text-xs font-semibold transition-all"
                    required
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Upload
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
