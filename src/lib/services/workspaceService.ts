import { readAll } from './dataService';
import { ClientWorkspace } from '../types';

export async function getWorkspaceByClientId(clientId: string): Promise<ClientWorkspace | null> {
  const workspaces = await readAll<ClientWorkspace>('workspaces');
  return workspaces.find(w => w.clientId === clientId) || null;
}
