import { Activity } from '../types';
import { create, readAll } from './dataService';

export interface LogActivityInput {
  workspaceId: string;
  type: Activity['type'];
  description: string;
  metadata?: Record<string, any>;
}

export async function logActivity(data: LogActivityInput): Promise<Activity> {
  const newActivity: Activity = {
    id: `act_${Math.random().toString(36).substring(2, 9)}`,
    workspaceId: data.workspaceId,
    type: data.type,
    description: data.description,
    metadata: data.metadata,
    createdAt: new Date().toISOString()
  };

  return await create<Activity>('activities', newActivity);
}

export async function getActivities(workspaceId: string): Promise<Activity[]> {
  const allActivities = await readAll<Activity>('activities');
  return allActivities.filter(a => a.workspaceId === workspaceId);
}

export async function getAllActivities(): Promise<Activity[]> {
  return await readAll<Activity>('activities');
}
