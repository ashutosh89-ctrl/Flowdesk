"use client";
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { uploadDocument } from '../../lib/services/documentService';
import { Client, Document, ClientWorkspace } from '../../lib/types';
import { FileText, UploadCloud, X, Loader2, Eye, Download } from 'lucide-react';
import { FilePreviewModal } from '@/components/shared/FilePreviewModal';
import { handleFileDownload } from '@/lib/utils/fileUtils';
import { motion, AnimatePresence } from 'motion/react';

interface ClientDocumentsClientProps {
  initialData: {
    client: Client;
    workspace: ClientWorkspace;
    documents: Document[];
  };
}

export function ClientDocumentsClient({ initialData }: ClientDocumentsClientProps) {
  const { addToast } = useApp();
  
  const [client] = useState<Client>(initialData.client);
  const [workspace] = useState<ClientWorkspace>(initialData.workspace);
  const [documents, setDocuments] = useState<Document[]>(initialData.documents);
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadType, setUploadType] = useState<'pdf' | 'png' | 'docx'>('pdf');
  const [loading, setLoading] = useState(false);
  const [previewItem, setPreviewItem] = useState<Document | null>(null);

  const handleDownload = (fileUrl: string | undefined, fileName: string) => {
    handleFileDownload(fileUrl, fileName);
  };

  const loadData = async () => {
    try {
      const docsRes = await fetch(`/api/documents?workspaceId=${workspace.id}`);
      setDocuments(await docsRes.json());
    } catch (e) {}
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName) return;

    setLoading(true);
    const tempId = `temp_${Math.random()}`;
    const newDoc: Document = {
      id: tempId,
      workspaceId: workspace.id,
      name: uploadName,
      type: uploadType,
      status: 'uploaded',
      uploadedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const prevDocs = [...documents];
    
    // 1. Optimistic UI update
    setDocuments(prev => [...prev, newDoc]);
    setShowUploadModal(false);
    setUploadName('');
    addToast(`Document "${uploadName}" uploaded!`, 'success');

    // 2. Background API call
    try {
      const doc = await uploadDocument({
        workspaceId: workspace.id,
        name: uploadName,
        type: uploadType,
        fileUrl: '#'
      });
      setDocuments(prev => prev.map(d => d.id === tempId ? doc : d));
    } catch (e) {
      // 3. Rollback
      setDocuments(prevDocs);
      addToast('Upload failed. Rolled back.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full min-h-0 flex-1 overflow-y-auto p-4 md:p-8 space-y-6 font-sans">
      <div className="flex justify-between items-center border-b border-black/5 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-950">Shared Documents</h2>
          <p className="text-xs text-gray-550 font-semibold mt-0.5">Upload required documents and files for verification.</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-gray-950 hover:bg-gray-800 text-white font-bold text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <UploadCloud className="w-4 h-4" />
          Upload File
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/5 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4">Document Title</th>
              <th className="px-6 py-4">Format</th>
              <th className="px-6 py-4">Uploaded At</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150/40">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-xs font-semibold text-gray-400">
                  No documents found.
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-gray-950 flex items-center gap-2">
                    <FileText className="w-4.5 h-4.5 text-gray-400 shrink-0" />
                    {doc.name}
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                    {doc.type}
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                    {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('en-US') : 'Pending'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {/* Preview & Download buttons (Priority 6) */}
                      {doc.fileUrl && doc.fileUrl !== '#' && (
                        <div className="flex gap-1 mr-2">
                          <button onClick={() => setPreviewItem(doc)} className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" title="Preview">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDownload(doc.fileUrl, doc.name)} className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" title="Download">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                        doc.status === 'verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        doc.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
                <h3 className="text-xs font-bold text-gray-950 uppercase tracking-wide">Upload Required Document</h3>
                <button onClick={() => setShowUploadModal(false)} className="p-1">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
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
                      Document Name / Description
                    </label>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Format</label>
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
                    disabled={loading}
                    className="flex-grow py-2.5 bg-gray-950 text-white text-xs font-bold rounded-full cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload File'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* File Preview Modal (Priority 6) */}
      <FilePreviewModal
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        fileUrl={previewItem?.fileUrl}
        fileName={previewItem?.name || 'Document'}
        fileType={previewItem?.fileType}
      />
    </div>
  );
}
