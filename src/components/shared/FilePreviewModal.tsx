'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, FileIcon, Eye } from 'lucide-react';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl?: string;
  fileName: string;
  fileType?: string;
}

export function FilePreviewModal({ isOpen, onClose, fileUrl, fileName, fileType }: FilePreviewModalProps) {
  const [previewError, setPreviewError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setPreviewError(false);
  }, [fileUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleDownload = async () => {
    if (!fileUrl || fileUrl === '#') return;
    setIsDownloading(true);
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      // Fallback: open in new tab
      window.open(fileUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const isImage = fileType?.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(fileName);
  const isPdf = fileType === 'application/pdf' || /\.pdf$/i.test(fileName);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="fixed inset-0" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-600 shrink-0">
                  <FileIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 truncate">{fileName}</h3>
                  <p className="text-xs text-gray-500 font-medium">
                    {fileType || (isImage ? 'Image' : isPdf ? 'PDF' : 'Document')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {fileUrl && fileUrl !== '#' && (
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    {isDownloading ? 'Downloading...' : 'Download'}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-auto bg-gray-50/50 flex items-center justify-center min-h-[300px] p-6">
              {!fileUrl || fileUrl === '#' ? (
                <div className="text-center py-12">
                  <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-500">Preview not available</p>
                  <p className="text-xs text-gray-400 mt-1">No file URL provided for this item.</p>
                </div>
              ) : previewError ? (
                <div className="text-center py-12">
                  <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-500">Preview not available</p>
                  <p className="text-xs text-gray-400 mt-1">Unable to load this file type.</p>
                  <button
                    onClick={handleDownload}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </button>
                </div>
              ) : isImage ? (
                <img
                  src={fileUrl}
                  alt={fileName}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  onError={() => setPreviewError(true)}
                />
              ) : isPdf ? (
                <iframe
                  src={fileUrl}
                  className="w-full h-[70vh] rounded-lg border border-gray-200"
                  title={fileName}
                  onError={() => setPreviewError(true)}
                />
              ) : (
                <div className="text-center py-12">
                  <FileIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-500">Preview not available</p>
                  <p className="text-xs text-gray-400 mt-1">
                    This file type ({fileType || 'unknown'}) cannot be previewed.
                  </p>
                  <button
                    onClick={handleDownload}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
