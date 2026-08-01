'use client';

import React, { useState } from 'react';
import { Document, Deliverable, Client } from '@/lib/types';
import { FileText, Image as ImageIcon, Download, Eye, FileSpreadsheet } from 'lucide-react';
import { downloadFile, formatFileSize } from '@/lib/services/fileService';
import { FilePreviewModal } from '@/components/ui/FilePreviewModal';

interface RecentFilesProps {
  documents?: Document[];
  deliverables?: Deliverable[];
  clients?: Client[];
}

export function RecentFiles({ documents = [], deliverables = [], clients = [] }: RecentFilesProps) {
  const [selectedFile, setSelectedFile] = useState<{ name: string; url: string; type?: string; size?: number } | null>(null);

  // Combine and sort files by creation date
  const allFiles = React.useMemo(() => {
    const items: { id: string; name: string; url: string; clientName: string; size?: number; type?: string; date: string }[] = [];

    documents.forEach(d => {
      items.push({
        id: `doc_${d.id}`,
        name: d.name,
        url: d.fileUrl || (d as any).url || '',
        clientName: 'Document File',
        size: (d as any).size,
        type: d.type,
        date: d.createdAt
      });
    });

    deliverables.forEach(d => {
      items.push({
        id: `deliv_${d.id}`,
        name: d.title || (d as any).name || 'Deliverable File',
        url: d.fileUrl || (d as any).previewUrl || '',
        clientName: 'Deliverable File',
        size: (d as any).size,
        type: (d as any).type,
        date: d.createdAt
      });
    });

    return items
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [documents, deliverables]);

  if (allFiles.length === 0) return null;

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-black/5 p-6 space-y-4 shadow-2xs font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider">Recent Workspace Files</h3>
          <p className="text-xs font-semibold text-gray-400">Quick access to recently uploaded deliverables & documents.</p>
        </div>
        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
          {allFiles.length} Recent
        </span>
      </div>

      {/* Horizontal Scroll Row */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {allFiles.map(file => {
          const isImg = file.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name);
          const Icon = isImg ? ImageIcon : FileText;

          return (
            <div
              key={file.id}
              onClick={() => setSelectedFile(file)}
              className="w-44 shrink-0 bg-white p-3.5 rounded-2xl border border-black/5 hover:border-black/20 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-gray-950 text-white flex items-center justify-center font-bold">
                  <Icon className="w-4 h-4" />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadFile(file.url, file.name);
                  }}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-950 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Download"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <p className="text-xs font-extrabold text-gray-950 truncate">{file.name}</p>
                <p className="text-[10px] font-semibold text-gray-400 truncate mt-0.5">{file.clientName}</p>
              </div>
            </div>
          );
        })}
      </div>

      <FilePreviewModal
        isOpen={!!selectedFile}
        onClose={() => setSelectedFile(null)}
        file={selectedFile}
      />
    </div>
  );
}
