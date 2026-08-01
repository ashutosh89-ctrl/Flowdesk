import { Deliverable, Project } from '../types';
import { create, read, readAll, update, isPlaceholder } from './dataService';
import { logActivity } from './activityService';
import { getDataClient } from '../supabase/data';

export interface CreateDeliverableInput {
  projectId: string;
  name: string;
  fileUrl?: string;
  version: string;
  file?: File;
}

export async function uploadDeliverableToStorage(file: File, path: string): Promise<string> {
  if (isPlaceholder) {
    return '#';
  }
  const supabase = getDataClient();
  const { data, error } = await supabase.storage
    .from('deliverables')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('deliverables')
    .getPublicUrl(path);
    
  return publicUrl;
}

export async function createDeliverable(data: CreateDeliverableInput): Promise<Deliverable> {
  let finalFileUrl = data.fileUrl || '#';

  if (data.file && !isPlaceholder) {
    try {
      const path = `${data.projectId}/${Date.now()}_${data.file.name}`;
      finalFileUrl = await uploadDeliverableToStorage(data.file, path);
    } catch (e) {
      console.error('Failed to upload deliverable to storage, using placeholder url:', e);
    }
  }

  const newDel: Deliverable = {
    id: `del_${Math.random().toString(36).substring(2, 9)}`,
    projectId: data.projectId,
    name: data.name,
    fileUrl: finalFileUrl,
    version: data.version,
    status: 'pending_approval',
    createdAt: new Date().toISOString()
  };

  const saved = await create<Deliverable>('deliverables', newDel);

  // Log activity
  const projects = await readAll<Project>('projects');
  const proj = projects.find(p => p.id === data.projectId);
  if (proj) {
    const workspaces = await readAll<any>('workspaces');
    const ws = workspaces.find(w => w.clientId === proj.clientId);
    if (ws) {
      await logActivity({
        workspaceId: ws.id,
        type: 'status_changed',
        description: `New deliverable uploaded: ${data.name} (${data.version})`
      });
    }
  }

  return saved;
}

export async function approveDeliverable(id: string, clientId: string): Promise<Deliverable> {
  const deliverable = await read<Deliverable>('deliverables', id);
  if (!deliverable) throw new Error('Deliverable not found');

  // Verify client ownership
  const projects = await readAll<Project>('projects');
  const proj = projects.find(p => p.id === deliverable.projectId);
  if (!proj || proj.clientId !== clientId) {
    throw new Error('Unauthorized');
  }

  const updated = await update<Deliverable>('deliverables', id, { 
    status: 'approved',
    revisionComment: undefined
  });

  // Log activity
  const workspaces = await readAll<any>('workspaces');
  const ws = workspaces.find(w => w.clientId === clientId);
  if (ws) {
    await logActivity({
      workspaceId: ws.id,
      type: 'deliverable_approved',
      description: `Deliverable "${deliverable.name}" approved by client`
    });
  }

  return updated;
}

export async function requestRevision(id: string, comment: string): Promise<Deliverable> {
  const deliverable = await read<Deliverable>('deliverables', id);
  if (!deliverable) throw new Error('Deliverable not found');

  const updated = await update<Deliverable>('deliverables', id, {
    status: 'revision_requested',
    revisionComment: comment
  });

  // Log activity
  const projects = await readAll<Project>('projects');
  const proj = projects.find(p => p.id === deliverable.projectId);
  if (proj) {
    const workspaces = await readAll<any>('workspaces');
    const ws = workspaces.find(w => w.clientId === proj.clientId);
    if (ws) {
      await logActivity({
        workspaceId: ws.id,
        type: 'status_changed',
        description: `Revision requested for deliverable "${deliverable.name}": "${comment}"`
      });
    }
  }

  return updated;
}

export async function getDeliverables(projectId: string): Promise<Deliverable[]> {
  const allDel = await readAll<Deliverable>('deliverables');
  return allDel.filter(d => d.projectId === projectId);
}
