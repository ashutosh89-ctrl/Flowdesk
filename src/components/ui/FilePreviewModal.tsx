'use client';

import React, { useEffect } from 'react';
import { X, Download, FileText, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { downloadFile, formatFileSize } from '@/lib/services/fileService';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    name: string;
    url: string;
    type?: string;
    size?: number;
  } | null;
}

export function FilePreviewModal({ isOpen, onClose, file }: FilePreviewModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !file) return null;

  const isImage = file.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name || '');
  const isPdf = file.type === 'application/pdf' || file.name?.endsWith('.pdf');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md select-none">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative z-10 w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 bg-gray-50/50">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold shrink-0">
                {isImage ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-gray-950 truncate">{file.name}</h3>
                {file.size && (
                  <span className="text-[10px] font-bold text-gray-400 block">{formatFileSize(file.size)}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => downloadFile(file.url, file.name)}
                className="px-3.5 py-1.5 rounded-full bg-gray-950 text-white hover:bg-gray-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-950 hover:bg-black/5 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-gray-100/50 min-h-[300px]">
            {isImage ? (
              <img
                src={file.url}
                alt={file.name}
                className="max-h-[70vh] max-w-full object-contain rounded-2xl shadow-lg border border-black/5"
              />
            ) : isPdf ? (
              <iframe
                src={file.url}
                title={file.name}
                className="w-full h-[70vh] rounded-2xl border border-black/5 shadow-inner"
              />
            ) : (
              <div className="text-center p-8 max-w-md space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-gray-950">Preview Not Available</h4>
                  <p className="text-xs font-semibold text-gray-500 mt-1">
                    Direct browser preview is not supported for this file type. Please download the file to view its contents.
                  </p>
                </div>
                <button
                  onClick={() => downloadFile(file.url, file.name)}
                  className="px-5 py-2.5 rounded-full bg-gray-950 text-white hover:bg-gray-800 text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download File ({formatFileSize(file.size || 0)})
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
