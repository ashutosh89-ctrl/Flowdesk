'use client';
import React, { useState } from 'react';
import { Document } from '@/lib/types';
import { FileText, UploadCloud, CheckSquare, Square, Eye, Download, Plus, FileCode, Image as ImageIcon, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { FilePreviewModal } from '@/components/shared/FilePreviewModal';
import { handleFileDownload } from '@/lib/utils/fileUtils';

interface DocumentsTabProps {
  documents: Document[];
  dragOver: boolean;
  setDragOver: (val: boolean) => void;
  setShowUploadModal: (val: boolean) => void;
  onChecklistToggle: (docId: string, currentStatus: Document['status']) => void;
  onRequestDocument?: (title: string, type: string) => void;
  onVerifyDocument?: (docId: string) => void;
  onRejectDocument?: (docId: string, reason: string) => void;
}

export function DocumentsTab({
  documents,
  dragOver,
  setDragOver,
  setShowUploadModal,
  onChecklistToggle,
  onRequestDocument,
  onVerifyDocument,
  onRejectDocument
}: DocumentsTabProps) {
  const [previewItem, setPreviewItem] = useState<Document | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestTitle, setRequestTitle] = useState('');
  const [requestType, setRequestType] = useState('pdf');
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState('');

  const getFileIcon = (type?: string, name?: string) => {
    const ext = (name || type || '').toLowerCase();
    if (ext.includes('png') || ext.includes('jpg') || ext.includes('jpeg') || ext.includes('logo')) {
      return <ImageIcon className="w-4 h-4 text-blue-500 shrink-0" />;
    }
    if (ext.includes('docx') || ext.includes('doc')) {
      return <FileText className="w-4 h-4 text-indigo-500 shrink-0" />;
    }
    if (ext.includes('xlsx') || ext.includes('csv')) {
      return <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />;
    }
    return <FileCode className="w-4 h-4 text-red-500 shrink-0" />;
  };

  const getStatusBadge = (status: Document['status']) => {
    switch (status) {
      case 'verified':
      case 'approved':
        return <span className="text-[9px] font-bold px-2.5 py-1 rounded-full uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">Verified</span>;
      case 'uploaded':
        return <span className="text-[9px] font-bold px-2.5 py-1 rounded-full uppercase bg-blue-50 text-blue-700 border border-blue-100">Uploaded</span>;
      case 'rejected':
        return <span className="text-[9px] font-bold px-2.5 py-1 rounded-full uppercase bg-red-50 text-red-700 border border-red-100">Rejected</span>;
      default:
        return <span className="text-[9px] font-bold px-2.5 py-1 rounded-full uppercase bg-amber-50 text-amber-700 border border-amber-100">Pending</span>;
    }
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTitle.trim()) return;
    if (onRequestDocument) {
      onRequestDocument(requestTitle, requestType);
    }
    setShowRequestModal(false);
    setRequestTitle('');
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingDocId) return;
    if (onRejectDocument) {
      onRejectDocument(rejectingDocId, rejectReasonText || 'File does not meet requirements');
    }
    setRejectingDocId(null);
    setRejectReasonText('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-gray-950">Documents & Assets</h3>
          <p className="text-xs font-bold text-gray-400">Manage client documents, contracts, and design briefs.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-3.5 py-2 bg-white border border-black/10 text-gray-800 rounded-full font-bold text-xs hover:bg-gray-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4 text-gray-500" /> Request Document
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-gray-950 text-white rounded-full font-bold text-xs hover:bg-gray-800 transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <UploadCloud className="w-4 h-4" /> Upload Asset
          </button>
        </div>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); setShowUploadModal(true); }}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
          dragOver ? 'border-gray-950 bg-gray-50/80' : 'border-black/10 bg-white/40'
        }`}
      >
        <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-xs font-bold text-gray-800">Drag and drop document files here to upload</p>
        <p className="text-[10px] font-semibold text-gray-400 mt-1">Supports PDF, PNG, DOCX up to 25MB</p>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm space-y-4">
        <h4 className="text-xs font-extrabold text-gray-950 uppercase tracking-wider">Document Checklist</h4>
        
        {documents.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <FileText className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-xs font-bold text-gray-700">No documents requested or uploaded yet.</p>
            <button
              onClick={() => setShowRequestModal(true)}
              className="text-xs font-bold text-gray-950 underline hover:text-black cursor-pointer"
            >
              Request your first document →
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {documents.map((doc) => {
              const isVerified = doc.status === 'verified' || doc.status === 'approved';
              return (
                <div key={doc.id} className="p-3.5 rounded-xl border border-black/5 bg-gray-50/40 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button onClick={() => onChecklistToggle(doc.id, doc.status)} className="cursor-pointer text-gray-700 hover:text-gray-950 shrink-0">
                        {isVerified ? <CheckSquare className="w-4.5 h-4.5 text-emerald-600" /> : <Square className="w-4.5 h-4.5 text-gray-400" />}
                      </button>
                      {getFileIcon(doc.type, doc.fileName || doc.name)}
                      <div className="min-w-0">
                        <span className={`text-xs font-bold ${isVerified ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          {doc.title || doc.name}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-400 block">
                          {(doc.fileType || doc.type || 'PDF').toUpperCase()} • {doc.fileSize || '1.2 MB'}
                          {doc.uploadedBy && ` • Uploaded by ${doc.uploadedBy}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Verify / Reject actions */}
                      {doc.status === 'uploaded' && (
                        <>
                          <button
                            onClick={() => onVerifyDocument?.(doc.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Verify Document"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRejectingDocId(doc.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Reject Document"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Preview & Download */}
                      {doc.fileUrl && doc.fileUrl !== '#' && (
                        <>
                          <button
                            onClick={() => setPreviewItem(doc)}
                            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleFileDownload(doc.fileUrl, doc.fileName || doc.title || doc.name || 'document')}
                            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {getStatusBadge(doc.status)}
                    </div>
                  </div>

                  {/* Reject Reason Banner */}
                  {doc.status === 'rejected' && doc.rejectReason && (
                    <div className="text-[11px] text-red-700 bg-red-50 p-2 rounded-lg border border-red-100 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span><strong>Reason for rejection:</strong> {doc.rejectReason}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Request Document Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 border border-black/10">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Request Document from Client</h3>
              <button onClick={() => setShowRequestModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Document Title</label>
                <input
                  type="text"
                  value={requestTitle}
                  onChange={(e) => setRequestTitle(e.target.value)}
                  placeholder="e.g., Brand Guidelines PDF, Business PAN, Tax GST Certificate"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-gray-950"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Document Format</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="png">PNG / JPG Image</option>
                  <option value="docx">Word Document (DOCX)</option>
                  <option value="logo">Logo File</option>
                  <option value="contract">Signed Contract</option>
                  <option value="reference">Reference Material</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-xs font-bold rounded-full hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gray-950 text-white text-xs font-bold rounded-full hover:bg-gray-800"
                >
                  Request File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4 border border-black/10">
            <h3 className="text-sm font-bold text-gray-900">Reject Document</h3>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Reason for Rejection</label>
                <textarea
                  rows={3}
                  value={rejectReasonText}
                  onChange={(e) => setRejectReasonText(e.target.value)}
                  placeholder="Explain why this document needs re-uploading (e.g., Blur text, Expired ID)..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none resize-none"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingDocId(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-xs font-bold rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 text-white text-xs font-bold rounded-full hover:bg-red-700"
                >
                  Confirm Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        fileUrl={previewItem?.fileUrl}
        fileName={previewItem?.title || previewItem?.name || 'Document'}
        fileType={previewItem?.fileType || previewItem?.type}
      />
    </div>
  );
}
