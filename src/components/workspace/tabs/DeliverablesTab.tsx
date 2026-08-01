'use client';
import React, { useState } from 'react';
import { Deliverable } from '@/lib/types';
import { Layers, CheckCircle2, AlertCircle, Download, Eye, UploadCloud, RotateCcw } from 'lucide-react';
import { FilePreviewModal } from '@/components/shared/FilePreviewModal';
import { handleFileDownload } from '@/lib/utils/fileUtils';

interface DeliverablesTabProps {
  deliverables: Deliverable[];
  onApprove: (delId: string) => void;
  onRequestRevisionModal: (delId: string) => void;
  onUploadDeliverable?: () => void;
}

export function DeliverablesTab({
  deliverables,
  onApprove,
  onRequestRevisionModal,
  onUploadDeliverable
}: DeliverablesTabProps) {
  const [previewItem, setPreviewItem] = useState<Deliverable | null>(null);

  const formatVersion = (ver?: number | string) => {
    if (!ver) return 'v1.0';
    if (typeof ver === 'number') return `v${ver}.0`;
    if (!ver.startsWith('v')) return `v${ver}`;
    return ver;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-gray-950">Project Deliverables</h3>
          <p className="text-xs font-bold text-gray-400">Track client sign-offs, versions, and requested revisions.</p>
        </div>
        <button
          onClick={() => onUploadDeliverable?.()}
          className="px-4 py-2 bg-gray-950 text-white rounded-full font-bold text-xs hover:bg-gray-800 transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
        >
          <UploadCloud className="w-4 h-4" />
          Upload Deliverable
        </button>
      </div>

      <div className="space-y-4">
        {deliverables.length === 0 ? (
          <div className="bg-white rounded-2xl border border-black/5 p-12 text-center space-y-3">
            <Layers className="w-10 h-10 text-gray-300 mx-auto" />
            <div>
              <p className="text-sm font-bold text-gray-900">No deliverables uploaded yet</p>
              <p className="text-xs text-gray-400 font-semibold mt-1">Submit your first deliverable for client review and sign-off.</p>
            </div>
            <button
              onClick={() => onUploadDeliverable?.()}
              className="px-4 py-2 bg-gray-950 text-white rounded-full font-bold text-xs hover:bg-gray-800 transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Deliverable
            </button>
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
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-gray-950">{del.title || del.name}</h4>
                      <span className="text-[10px] font-mono font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {formatVersion(del.version)}
                      </span>
                    </div>
                    {del.description && (
                      <p className="text-xs text-gray-500 font-medium mt-0.5">{del.description}</p>
                    )}
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

              {/* Revision Feedback Comment if present */}
              {del.status === 'revision_requested' && del.revisionComment && (
                <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-amber-800 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Client Revision Feedback
                  </span>
                  <p className="text-xs text-amber-950 font-medium italic">"{del.revisionComment}"</p>
                </div>
              )}

              {/* File actions: Preview & Download */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {del.fileUrl && del.fileUrl !== '#' && (
                    <>
                      <button
                        onClick={() => setPreviewItem(del)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-black/10 hover:bg-gray-50 text-gray-700 font-bold text-[10px] rounded-full transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </button>
                      <button
                        onClick={() => handleFileDownload(del.fileUrl, del.fileName || del.title || del.name || 'deliverable')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-black/10 hover:bg-gray-50 text-gray-700 font-bold text-[10px] rounded-full transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    </>
                  )}
                </div>

                {del.status === 'revision_requested' && (
                  <button
                    onClick={() => onUploadDeliverable?.()}
                    className="px-3.5 py-1.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-full flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Re-upload New Version
                  </button>
                )}
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

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        fileUrl={previewItem?.fileUrl}
        fileName={previewItem?.title || previewItem?.name || 'Deliverable'}
        fileType=""
      />
    </div>
  );
}
