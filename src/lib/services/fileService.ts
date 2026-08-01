export interface FileUploadResult {
  url: string;
  name: string;
  size: number;
  type: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function getFileExtensionLabel(filename: string): string {
  if (!filename) return 'FILE';
  const parts = filename.split('.');
  if (parts.length > 1) return parts.pop()!.toUpperCase();
  return 'FILE';
}

export async function uploadFile(file: File, folder = 'documents'): Promise<FileUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  try {
    const res = await fetch('/api/files/upload', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      return {
        url: data.url,
        name: file.name,
        size: file.size,
        type: file.type
      };
    }
  } catch (e) {
    console.warn('API file upload failed, using fallback object URL:', e);
  }

  // Fallback for offline/preview mode
  const objectUrl = URL.createObjectURL(file);
  return {
    url: objectUrl,
    name: file.name,
    size: file.size,
    type: file.type
  };
}

export function downloadFile(url: string, filename: string): void {
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (e) {
    console.error('Download failed:', e);
    window.open(url, '_blank');
  }
}

export function calculateStorageUsage(documents: any[] = [], deliverables: any[] = []) {
  const totalLimitBytes = 10 * 1024 * 1024 * 1024; // 10 GB limit
  
  const docsSize = documents.reduce((sum, d) => sum + (d.size || 1024 * 1024 * 2.5), 0);
  const delivsSize = deliverables.reduce((sum, d) => sum + (d.size || 1024 * 1024 * 5), 0);
  
  const totalUsedBytes = docsSize + delivsSize;
  const percentage = Math.min(100, Math.round((totalUsedBytes / totalLimitBytes) * 100));

  return {
    usedBytes: totalUsedBytes,
    limitBytes: totalLimitBytes,
    usedFormatted: formatFileSize(totalUsedBytes),
    limitFormatted: formatFileSize(totalLimitBytes),
    percentage
  };
}
