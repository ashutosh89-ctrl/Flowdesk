import { Project } from '../types';
import { create, read, readAll, update } from './dataService';
import { logActivity } from './activityService';

export interface CreateProjectInput {
  clientId: string;
  name: string;
  description?: string;
  status?: string;
  dueDate?: string;
  milestones?: any[];
}

export async function createProject(data: CreateProjectInput): Promise<Project> {
  const status = (data.status as Project['status']) || 'planning';
  const progressMap: Record<string, number> = { planning: 0, in_progress: 33, review: 66, completed: 100 };
  const initialProgress = progressMap[status] ?? 0;

  const newProject: Project = {
    id: `proj_${Math.random().toString(36).substring(2, 9)}`,
    clientId: data.clientId,
    name: data.name,
    description: data.description,
    status: status,
    dueDate: data.dueDate,
    progress: initialProgress,
    milestones: data.milestones || [],
    createdAt: new Date().toISOString()
  };

  const savedProject = await create<Project>('projects', newProject);

  // Find workspace to log activity
  const workspaces = await readAll<any>('workspaces');
  const ws = workspaces.find(w => w.clientId === data.clientId);
  if (ws) {
    await logActivity({
      workspaceId: ws.id,
      type: 'status_changed',
      description: `New project created: ${data.name}`
    });
  }

  return savedProject;
}

export async function getProjects(clientId: string, userId: string): Promise<Project[]> {
  // Enforce access control
  const clients = await readAll<any>('clients', userId);
  const belongs = clients.some(c => c.id === clientId);
  if (!belongs) {
    throw new Error('Unauthorized access to client projects');
  }

  const allProj = await readAll<Project>('projects');
  return allProj.filter(p => p.clientId === clientId);
}

export async function updateProjectStatus(id: string, status: Project['status']): Promise<Project> {
  const project = await read<Project>('projects', id);
  if (!project) throw new Error('Project not found');

  const updatedProject = await update<Project>('projects', id, { 
    status,
    progress: status === 'planning' ? 10 : status === 'in_progress' ? 50 : status === 'review' ? 85 : 100
  });

  // Log activity
  const workspaces = await readAll<any>('workspaces');
  const ws = workspaces.find(w => w.clientId === project.clientId);
  if (ws) {
    await logActivity({
      workspaceId: ws.id,
      type: 'status_changed',
      description: `Project "${project.name}" status updated to ${status}`
    });
  }

  return updatedProject;
}
