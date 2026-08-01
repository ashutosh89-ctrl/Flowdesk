import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from './AppContext';
import { read, readAll, update } from '../lib/services/dataService';
import { getComments, addComment } from '../lib/services/commentService';
import { getActivities } from '../lib/services/activityService';
import { uploadDocument, verifyDocument } from '../lib/services/documentService';
import { approveDeliverable, requestRevision, getDeliverables } from '../lib/services/deliverableService';
import { Client, ClientWorkspace, Project, Document, Deliverable, Activity, Comment } from '../lib/types';
import { 
  Briefcase, CheckCircle2, ChevronRight, FileText, 
  Layers, MessageSquare, Phone, Mail, Building, MapPin, 
  TrendingUp, Award, Clock, ArrowUpRight, UploadCloud, 
  Play, CheckCircle, AlertCircle, RefreshCw, Send, Sparkles, X, CheckSquare, Square
} from 'lucide-react';

export default function ClientWorkspaceContainer() {
  const { activeClientId, setScreen, addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'deliverables' | 'comments'>('overview');
  const [client, setClient] = useState<Client | null>(null);
  const [workspace, setWorkspace] = useState<ClientWorkspace | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  
  // Data lists
  const [documents, setDocuments] = useState<Document[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  
  // States for interaction
  const [newCommentText, setNewCommentText] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState<string | null>(null); // holds deliverableId
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [uploadType, setUploadType] = useState<'pdf' | 'png' | 'docx'>('pdf');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Load all Workspace Data
  const loadWorkspaceData = async () => {
    if (!activeClientId) return;
    try {
      // Find client
      const cl = await read<Client>('clients', activeClientId);
      setClient(cl);

      // Find workspace
      const wss = await readAll<ClientWorkspace>('workspaces');
      const ws = wss.find(w => w.clientId === activeClientId);
      if (ws) {
        setWorkspace(ws);
        
        // Find documents
        const docs = await readAll<Document>('documents');
        setDocuments(docs.filter(d => d.workspaceId === ws.id));

        // Find activities
        const acts = await getActivities(ws.id);
        setActivities(acts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }

      // Find projects
      const projs = await readAll<Project>('projects');
      const proj = projs.find(p => p.clientId === activeClientId);
      if (proj) {
        setProject(proj);

        // Find deliverables
        const dels = await getDeliverables(proj.id);
        setDeliverables(dels);

        // Find comments
        const comms = await getComments(proj.id);
        setComments(comms.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  }, [activeClientId]);

  if (!client) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white/10 text-gray-500 font-medium">
        <p>No active client selected. Select a client from the Client Registry.</p>
        <button 
              onClick={() => setScreen?.('clients')}
          className="mt-4 px-4 py-2 bg-gray-950 text-white rounded-lg text-sm cursor-pointer hover:bg-gray-800"
        >
          View Client List
        </button>
      </div>
    );
  }

  // Handle document checklist clicks
  const handleChecklistToggle = async (docId: string, currentStatus: Document['status']) => {
    const nextStatus: Document['status'] = currentStatus === 'signed' || currentStatus === 'approved' ? 'pending' : 'signed';
    try {
      await verifyDocument(docId, nextStatus);
      addToast(`Document status updated!`, 'success');
      await loadWorkspaceData();
    } catch (e) {
      console.error(e);
    }
  };

  // Handle deliverable actions
  const handleApproveDeliverable = async (delId: string) => {
    try {
      await approveDeliverable(delId, client.id);
      addToast('Deliverable approved!', 'success');
      await loadWorkspaceData();
    } catch (e: any) {
      addToast(e.message || 'Approval failed', 'warning');
    }
  };

  const handleRequestRevisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRevisionModal || !revisionFeedback) return;
    try {
      await requestRevision(showRevisionModal, revisionFeedback);
      addToast('Revision feedback logged!', 'info');
      setShowRevisionModal(null);
      setRevisionFeedback('');
      await loadWorkspaceData();
    } catch (e) {
      console.error(e);
    }
  };

  // Handle custom file upload triggers
  const handleMockUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace || !uploadName) return;
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

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !newCommentText) return;
    
    try {
      const added = await addComment({
        projectId: project.id,
        userId: 'usr_ann',
        userName: 'Ann Kowalski',
        userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfyQMh7YDLdS4DNFFIrBR32RuY8F9lNA8BvQ6ZWKGr29ibB3BcWaSy9SrXqKCPYBVB--r3qPxt5RTbd0SZ-sZRTM8Xt6Kh8pG4SYwJZ74-Qi_EB_2v_iJ1ON28qaaePZjrHYC9diaY1x7ar25MBlJy-htNlqzQHgo6Tf7FFTlXmLrm2jmrK4EBVzv24OLqImh76DHBcLJFVpbyoSAYSBCeFNUH5A3TpFRRInmdu5W0Il9OAMCfXQkX0tf4PDOPsE3QA-ya1tuEPGj-',
        content: newCommentText
      }, () => {
        // AI callback to refresh log on automatic replies
        loadWorkspaceData();
      });

      setComments(prev => [...prev, added]);
      setNewCommentText('');
      addToast('Comment added!', 'success');
      
      // Auto reload after short delay to capture AI responses
      setTimeout(loadWorkspaceData, 1600);
    } catch (e) {
      console.error(e);
    }
  };

  // Calculations
  const checklistDocs = documents.filter(d => ['signed', 'approved', 'verified', 'reviewed'].includes(d.status) || d.status === 'pending');
  const completedChecklistDocs = checklistDocs.filter(d => d.status !== 'pending');
  const checklistProgress = checklistDocs.length > 0 
    ? Math.round((completedChecklistDocs.length / checklistDocs.length) * 100) 
    : 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white/10">
      
      {/* Workspace Sub-Header / Client Details Banner */}
      <header className="px-8 py-6 border-b border-gray-200/50 bg-white/40 backdrop-blur-md flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={client.avatar} 
              alt={client.name} 
              className="w-12 h-12 rounded-full border border-gray-200 object-cover bg-gray-50"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{client.name}</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 uppercase tracking-wider">
                  ACTIVE CLIENT
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-400">{client.company} • Joined Jan 2025</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
                  onClick={() => setScreen?.('clients')}
              className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-xs rounded-full cursor-pointer transition-colors"
            >
              Back to Clients
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex gap-1 border-t border-gray-200/40 pt-4 mt-2">
          {[
            { id: 'overview', name: 'Overview', icon: Briefcase },
            { id: 'documents', name: 'Documents', icon: FileText },
            { id: 'deliverables', name: 'Deliverables', icon: Layers },
            { id: 'comments', name: 'Comments Board', icon: MessageSquare }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-gray-900 text-white shadow-xs' 
                    : 'text-gray-500 hover:bg-black/5 hover:text-gray-950'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>
      </header>

      {/* Primary Scrollable Workspace viewport */}
      <div className="flex-1 overflow-y-auto p-8">
        <AnimatePresence mode="wait">
          
          {/* Sub-tab 1: Overview Dashboard */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-3 gap-8"
            >
              {/* Left Column: Contact cards & Team */}
              <div className="space-y-6">
                
                {/* Contact details */}
                <div className="glass-card p-6 rounded-xl space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Building className="w-4.5 h-4.5 text-gray-500" />
                    Contact Details
                  </h3>
                  <div className="space-y-3 pt-2 text-xs font-semibold text-gray-600">
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
                      <span>San Francisco, CA</span>
                    </div>
                  </div>
                </div>

                {/* VIP card */}
                <div className="glass-card p-6 rounded-xl relative overflow-hidden bg-gradient-to-br from-white/90 to-gray-50/50">
                  <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Award className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Account Value</span>
                  <h3 className="text-3xl font-extrabold text-gray-900 mt-2">$124,500</h3>
                  <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3.5 h-3.5" /> High-Value Partner (VIP)
                  </p>
                </div>

                {/* Assigned Team */}
                <div className="glass-card p-6 rounded-xl space-y-3">
                  <h3 className="text-sm font-bold text-gray-900">Assigned Workspace Team</h3>
                  <div className="flex items-center gap-2 pt-2">
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfyQMh7YDLdS4DNFFIrBR32RuY8F9lNA8BvQ6ZWKGr29ibB3BcWaSy9SrXqKCPYBVB--r3qPxt5RTbd0SZ-sZRTM8Xt6Kh8pG4SYwJZ74-Qi_EB_2v_iJ1ON28qaaePZjrHYC9diaY1x7ar25MBlJy-htNlqzQHgo6Tf7FFTlXmLrm2jmrK4EBVzv24OLqImh76DHBcLJFVpbyoSAYSBCeFNUH5A3TpFRRInmdu5W0Il9OAMCfXQkX0tf4PDOPsE3QA-ya1tuEPGj-" 
                      alt="Ann" 
                      className="w-8 h-8 rounded-full border border-white"
                    />
                    <img 
                      src="https://api.dicebear.com/7.x/initials/svg?seed=Marcus" 
                      alt="Marcus" 
                      className="w-8 h-8 rounded-full border border-white"
                    />
                    <img 
                      src="https://api.dicebear.com/7.x/initials/svg?seed=Elena" 
                      alt="Elena" 
                      className="w-8 h-8 rounded-full border border-white"
                    />
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold border border-white">
                      +2
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Dynamic Project Stats & Workspace Activity */}
              <div className="col-span-2 space-y-6">
                
                {/* Visual Project Hours Metric Bar */}
                <div className="glass-card p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Current Project Resource Utilization</h3>
                      <p className="text-xs text-gray-500 font-semibold mt-1">Design vs. Development logged hours</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-bold text-gray-900">170 Total Hrs</span>
                    </div>
                  </div>

                  {/* SVG Bar Chart */}
                  <div className="space-y-4 pt-2">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5 text-gray-600">
                        <span>Creative & Design Phase</span>
                        <span>42 Hrs (25%)</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-900 rounded-full w-1/4"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5 text-gray-600">
                        <span>Technical Development Phase</span>
                        <span>128 Hrs (75%)</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Workspace Activity Feed */}
                <div className="glass-card p-6 rounded-xl space-y-4">
                  <h3 className="text-sm font-bold text-gray-900">Recent Workspace Log History</h3>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {activities.length === 0 ? (
                      <p className="text-xs text-gray-400 font-semibold py-6 text-center">No logs captured yet.</p>
                    ) : (
                      activities.map((act) => (
                        <div key={act.id} className="flex gap-3 text-xs leading-relaxed">
                          <div className="w-2 h-2 rounded-full bg-gray-900 mt-1.5 shrink-0"></div>
                          <div>
                            <span className="font-bold text-gray-800">{act.description}</span>
                            <span className="text-[10px] font-semibold text-gray-400 block mt-0.5">
                              {new Date(act.createdAt).toLocaleDateString('en-US')} at {new Date(act.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* Sub-tab 2: Documents Checklist & Drop Zone */}
          {activeTab === 'documents' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-3 gap-8"
            >
              {/* Left Column: Interactive checklist progress & drag zone */}
              <div className="space-y-6">
                
                {/* Document checklist */}
                <div className="glass-card p-6 rounded-xl space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Document Checklist Progress</h3>
                    <p className="text-xs text-gray-500 font-semibold mt-1">Checkboxes toggle client signoff verification</p>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-gray-900 h-full rounded-full transition-all duration-300 w-[var(--cp)]" style={{ '--cp': `${checklistProgress}%` } as React.CSSProperties}></div>
                    </div>
                    <span className="text-xs font-bold text-gray-900">{checklistProgress}%</span>
                  </div>

                  <div className="space-y-3 pt-3">
                    {checklistDocs.map((doc) => {
                      const isDone = doc.status !== 'pending';
                      return (
                        <button
                          key={doc.id}
                          onClick={() => handleChecklistToggle(doc.id, doc.status)}
                          className="w-full flex items-start gap-3 p-2.5 rounded-lg hover:bg-black/5 transition-colors text-left cursor-pointer"
                        >
                          {isDone ? (
                            <CheckSquare className="w-5 h-5 text-gray-900 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0">
                            <h4 className={`text-xs font-bold leading-tight ${isDone ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                              {doc.name}
                            </h4>
                            <span className="text-[10px] font-semibold text-gray-400 capitalize">{doc.status}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Drag and Drop Zone */}
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    dragOver 
                      ? 'border-gray-900 bg-gray-50' 
                      : 'border-gray-200/60 hover:border-gray-400 bg-white/20'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    setShowUploadModal(true);
                  }}
                  onClick={() => setShowUploadModal(true)}
                >
                  <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-xs font-bold text-gray-800">Drag or drop files here</h4>
                  <p className="text-[10px] text-gray-400 mt-1 font-semibold uppercase">PDF, PNG, JPG OR DOCX (MAX 50MB)</p>
                </div>

                {/* Video Campaign Preview Card */}
                <div className="glass-card rounded-xl overflow-hidden shadow-xs">
                  <div className="aspect-video bg-gray-900/10 flex items-center justify-center relative group cursor-pointer">
                    <Play className="w-12 h-12 text-gray-950 bg-white p-3.5 rounded-full shadow-md group-hover:scale-105 transition-all" />
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white">
                      0:45 Min
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="text-xs font-bold text-gray-900">V-Scope-Campaign.mp4</h4>
                    <p className="text-[10px] text-gray-400 font-semibold mt-1">23.6 MB • Video Asset Concept</p>
                  </div>
                </div>

              </div>

              {/* Right Column: Files listing */}
              <div className="col-span-2">
                <div className="glass-card rounded-xl border border-white/60 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900">All Workspace Files</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {documents.map((doc) => (
                      <div key={doc.id} className="p-4.5 flex items-center justify-between hover:bg-white/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <FileText className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900">{doc.name}</h4>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                              {doc.type.toUpperCase()} • {doc.uploadedAt ? `Uploaded ${new Date(doc.uploadedAt).toLocaleDateString('en-US')}` : 'Pending upload'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            doc.status === 'signed' || doc.status === 'approved' || doc.status === 'reviewed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : doc.status === 'uploaded'
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {doc.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Sub-tab 3: Deliverables reviews */}
          {activeTab === 'deliverables' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-3 gap-8"
            >
              {/* Left Column: Pending Assets / Deliverables list */}
              <div className="space-y-6">
                <div className="glass-card p-6 rounded-xl space-y-4">
                  <h3 className="text-sm font-bold text-gray-900">Project Deliverables Status</h3>
                  <div className="space-y-3 pt-2">
                    {deliverables.map((del) => (
                      <div key={del.id} className="p-3 border border-gray-100 rounded-lg bg-white/50 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-gray-900">{del.name}</h4>
                          <span className="text-[9px] font-bold text-gray-400">{del.version}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            del.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : del.status === 'revision_requested'
                              ? 'bg-rose-50 text-rose-700 border border-rose-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {del.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Approval Showcase panel */}
              <div className="col-span-2 space-y-6">
                <div className="glass-card p-6 rounded-xl border border-white/80 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Interactive Approval Showcase</h3>
                    <p className="text-xs text-gray-500 font-semibold mt-1">Review, approve, or coordinate client asset revision workflows.</p>
                  </div>

                  {/* Active Deliverable Focus */}
                  {deliverables.filter(d => d.status === 'pending_approval').map((del) => (
                    <div key={del.id} className="border border-gray-200/50 rounded-xl p-5 bg-white/40 space-y-4">
                      <div className="flex justify-between items-center border-b border-gray-200/30 pb-3">
                        <div>
                          <h4 className="text-xs font-extrabold text-gray-900">{del.name} ({del.version})</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">NEEDS CLIENT SIGN-OFF</p>
                        </div>
                        <span className="text-xs text-indigo-600 font-bold">Deadline: In 3 Days</span>
                      </div>

                      {/* Mock Video / Visual Canvas Container */}
                      <div className="aspect-video bg-gray-950 rounded-lg flex flex-col items-center justify-center p-6 text-center text-white relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30"></div>
                        
                        {/* Glass overlay asset header */}
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-[10px] font-bold tracking-wider uppercase text-white/80">
                          <span>MOTION_STUDY_V2.MP4</span>
                          <span>H.264 • 24fps</span>
                        </div>

                        <Play className="w-14 h-14 text-gray-950 bg-white p-4 rounded-full shadow-lg cursor-pointer group-hover:scale-105 transition-all z-10" />
                        
                        <div className="z-10 mt-4 max-w-xs">
                          <p className="text-xs font-bold">Product Vision & Micro-Interaction Design</p>
                          <p className="text-[10px] text-white/60 mt-1">Iridescent specular gradients rendering</p>
                        </div>
                      </div>

                      {/* Interactive Buttons */}
                      <div className="flex gap-4 pt-2">
                        <button
                          onClick={() => setShowRevisionModal(del.id)}
                          className="flex-1 py-3 border border-gray-200 hover:border-gray-300 text-gray-700 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          Request Revision
                        </button>
                        <button
                          onClick={() => handleApproveDeliverable(del.id)}
                          className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          Approve Deliverable
                        </button>
                      </div>
                    </div>
                  ))}

                  {deliverables.filter(d => d.status === 'pending_approval').length === 0 && (
                    <div className="text-center py-12 text-xs font-medium text-gray-400">
                      All current deliverables have been reviewed.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Sub-tab 4: Comments Board Discussion Thread */}
          {activeTab === 'comments' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl mx-auto glass-card rounded-xl overflow-hidden border border-white/60 shadow-xs flex flex-col h-[520px]"
            >
              <div className="p-5 border-b border-gray-100 bg-white/40 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">Project Workspace Thread</h3>
                  <p className="text-[11px] text-gray-500 font-bold uppercase mt-1">AI-REPLY ENABLED (1.5S DELAY)</p>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {comments.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-12">No discussion started yet.</p>
                ) : (
                  comments.map((comm) => (
                    <div key={comm.id} className="flex gap-3 text-xs leading-relaxed">
                      <img 
                        src={comm.userAvatar || 'https://api.dicebear.com/7.x/initials/svg?seed=User'} 
                        alt={comm.userName} 
                        className="w-8 h-8 rounded-full border border-gray-100 shrink-0 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="bg-white/60 p-3.5 rounded-xl border border-white max-w-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-extrabold text-gray-950">{comm.userName}</span>
                          <span className="text-[10px] font-semibold text-gray-400">
                            {new Date(comm.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{comm.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleCommentSubmit} className="p-4 border-t border-gray-100 bg-white/40 flex gap-3">
                <input
                  type="text"
                  placeholder="Write a message to discuss project deliverables..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white/60 hover:bg-white focus:bg-white rounded-lg border border-gray-200 outline-none text-xs font-semibold transition-all"
                />
                <button
                  type="submit"
                  className="px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Revision request feedback modal popup */}
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
                <h3 className="text-sm font-bold text-gray-950">Specify Revision Feedback</h3>
                <button onClick={() => setShowRevisionModal(null)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleRequestRevisionSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2">Revision Comment</label>
                  <textarea
                    rows={4}
                    value={revisionFeedback}
                    onChange={(e) => setRevisionFeedback(e.target.value)}
                    placeholder="Provide detailed visual or structural feedback to guide improvements..."
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

      {/* Manual document upload modal */}
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
                <h3 className="text-sm font-bold text-gray-950">Upload New Document</h3>
                <button onClick={() => setShowUploadModal(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleMockUpload} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2">Document Name</label>
                  <input
                    type="text"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    placeholder="Product_Specifications_v3.docx"
                    className="w-full px-3 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white rounded-lg border border-gray-200 outline-none text-xs font-semibold transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2">Document Format</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200 outline-none text-xs font-semibold"
                  >
                    <option value="pdf">PDF File</option>
                    <option value="png">PNG / Image Graphic</option>
                    <option value="docx">Microsoft Word Docx</option>
                  </select>
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
                    Upload File
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
