'use client';
import React from 'react';
import { Document } from '@/lib/types';
import { FileText, UploadCloud, CheckSquare, Square } from 'lucide-react';

interface DocumentsTabProps {
  documents: Document[];
  dragOver: boolean;
  setDragOver: (val: boolean) => void;
  setShowUploadModal: (val: boolean) => void;
  onChecklistToggle: (docId: string, currentStatus: Document['status']) => void;
}

export function DocumentsTab({
  documents,
  dragOver,
  setDragOver,
  setShowUploadModal,
  onChecklistToggle
}: DocumentsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-gray-950">Documents & Assets</h3>
          <p className="text-xs font-bold text-gray-400">Manage client documents, contracts, and design briefs.</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-gray-950 text-white rounded-full font-bold text-xs hover:bg-gray-800 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" /> Upload Asset
        </button>
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
        <div className="space-y-2">
          {documents.map((doc) => {
            const isVerified = doc.status !== 'pending';
            return (
              <div key={doc.id} className="flex items-center justify-between p-3.5 rounded-xl border border-black/5 bg-gray-50/40">
                <div className="flex items-center gap-3">
                  <button onClick={() => onChecklistToggle(doc.id, doc.status)} className="cursor-pointer text-gray-700 hover:text-gray-950">
                    {isVerified ? <CheckSquare className="w-4.5 h-4.5 text-emerald-600" /> : <Square className="w-4.5 h-4.5 text-gray-400" />}
                  </button>
                  <FileText className="w-4 h-4 text-gray-400" />
                  <div>
                    <span className={`text-xs font-bold ${isVerified ? 'line-through text-gray-400' : 'text-gray-900'}`}>{doc.title}</span>
                    <span className="text-[10px] font-semibold text-gray-400 block">{(doc.fileType || doc.type || 'PDF').toUpperCase()} • {doc.fileSize || '1.2 MB'}</span>
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase ${
                  isVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  {doc.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
