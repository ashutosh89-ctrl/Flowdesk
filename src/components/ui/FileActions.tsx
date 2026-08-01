'use client';

import React, { useState } from 'react';
import { Eye, Download } from 'lucide-react';
import { FilePreviewModal } from './FilePreviewModal';
import { downloadFile } from '@/lib/services/fileService';

interface FileActionsProps {
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

export function FileActions({ fileUrl, fileName = 'file', fileType, fileSize }: FileActionsProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!fileUrl || fileUrl === '#') return null;

  const isImage = fileType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);
  const isPDF = fileType === 'application/pdf' || /\.pdf$/i.test(fileName);

  return (
    <>
      <div className="flex items-center gap-1">
        {(isImage || isPDF) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewOpen(true);
            }}
            className="p-1.5 rounded-lg hover:bg-black/5 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
            title="Preview"
            aria-label="Preview file"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            downloadFile(fileUrl, fileName);
          }}
          className="p-1.5 rounded-lg hover:bg-black/5 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
          title="Download"
          aria-label="Download file"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      <FilePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        file={{
          url: fileUrl,
          name: fileName,
          type: fileType,
          size: fileSize
        }}
      />
    </>
  );
}
