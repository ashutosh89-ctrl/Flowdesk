import { Document } from '../types';
import { create, read, readAll, update, isPlaceholder } from './dataService';
import { logActivity } from './activityService';
import { getDataClient } from '../supabase/data';

export interface UploadDocumentInput {
  workspaceId: string;
  name: string;
  type: Document['type'];
  fileUrl?: string;
  file?: File;
}

export async function uploadDocumentToStorage(file: File, path: string): Promise<string> {
  if (isPlaceholder) {
    return '#';
  }
  const supabase = getDataClient();
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(path);
    
  return publicUrl;
}

export async function requestDocuments(workspaceId: string, documents: string[]): Promise<void> {
  for (const docName of documents) {
    const ext = docName.split('.').pop() as Document['type'] || 'pdf';
    const newDoc: Document = {
      id: `doc_${Math.random().toString(36).substring(2, 9)}`,
      workspaceId,
      name: docName,
      type: ext,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    await create<Document>('documents', newDoc);
  }

  await logActivity({
    workspaceId,
    type: 'status_changed',
    description: `Requested ${documents.length} new documents from client`
  });
}

export async function uploadDocument(data: UploadDocumentInput): Promise<Document> {
  let finalFileUrl = data.fileUrl || '#';

  if (data.file && !isPlaceholder) {
    try {
      const path = `${data.workspaceId}/${Date.now()}_${data.file.name}`;
      finalFileUrl = await uploadDocumentToStorage(data.file, path);
    } catch (e) {
      console.error('Failed to upload file to storage, using placeholder url:', e);
    }
  }

  const docs = await readAll<Document>('documents');
  const pending = docs.find(d => d.workspaceId === data.workspaceId && d.name.toLowerCase() === data.name.toLowerCase() && d.status === 'pending');

  if (pending) {
    const updated = await update<Document>('documents', pending.id, {
      status: 'uploaded',
      fileUrl: finalFileUrl,
      uploadedAt: new Date().toISOString()
    });
    
    await logActivity({
      workspaceId: data.workspaceId,
      type: 'document_uploaded',
      description: `Document ${data.name} uploaded by client`
    });
    return updated;
  }

  const newDoc: Document = {
    id: `doc_${Math.random().toString(36).substring(2, 9)}`,
    workspaceId: data.workspaceId,
    name: data.name,
    type: data.type,
    status: 'uploaded',
    fileUrl: finalFileUrl,
    uploadedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  const saved = await create<Document>('documents', newDoc);

  await logActivity({
    workspaceId: data.workspaceId,
    type: 'document_uploaded',
    description: `Document ${data.name} uploaded`
  });

  return saved;
}

export async function verifyDocument(id: string, status: Document['status']): Promise<Document> {
  const doc = await read<Document>('documents', id);
  if (!doc) throw new Error('Document not found');

  const updated = await update<Document>('documents', id, { status });

  await logActivity({
    workspaceId: doc.workspaceId,
    type: 'status_changed',
    description: `Document "${doc.name}" status updated to ${status}`
  });

  return updated;
}
