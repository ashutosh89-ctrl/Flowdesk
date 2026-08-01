'use client';

import React, { useState, useRef } from 'react';
import { Upload, File, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { uploadFile, formatFileSize } from '@/lib/services/fileService';

interface FileUploadZoneProps {
  onUploadComplete: (uploaded: { url: string; name: string; size: number; type: string }[]) => void;
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
}

export function FileUploadZone({ 
  onUploadComplete, 
  accept = '.pdf,.png,.jpg,.jpeg,.doc,.docx,.zip', 
  maxSizeMB = 25,
  multiple = false 
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    setErrorMessage(null);
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.size > maxSizeMB * 1024 * 1024) {
        setErrorMessage(`File "${f.name}" exceeds maximum allowed size of ${maxSizeMB}MB.`);
        return;
      }
      validFiles.push(f);
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    try {
      const results = await Promise.all(validFiles.map(file => uploadFile(file)));
      onUploadComplete(results);
    } catch (err: any) {
      setErrorMessage(err.message || 'File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="w-full space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer select-none flex flex-col items-center justify-center gap-3 ${
          isDragging 
            ? 'border-gray-950 bg-gray-100/80 scale-[0.99]' 
            : 'border-black/10 bg-white/50 hover:bg-gray-50/80 hover:border-black/20'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-2">
            <Loader2 className="w-8 h-8 text-gray-950 animate-spin mx-auto" />
            <p className="text-xs font-bold text-gray-950">Uploading file(s)...</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-gray-950 text-white flex items-center justify-center shadow-md">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black text-gray-950">
                Click to upload or drag & drop
              </p>
              <p className="text-xs font-semibold text-gray-400 mt-0.5">
                PDF, Images, DOC up to {maxSizeMB}MB
              </p>
            </div>
          </>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 text-red-600 text-xs font-bold border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
