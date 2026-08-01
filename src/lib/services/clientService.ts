import { Client, ClientWorkspace } from '../types';
import { create, read, readAll, update } from './dataService';
import { logActivity } from './activityService';

export interface CreateClientInput {
  userId: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  avatar?: string;
  status?: string;
}

export async function createClient(data: CreateClientInput): Promise<Client & { workspaceId?: string }> {
  const newClient: Client = {
    id: `cl_${Math.random().toString(36).substring(2, 9)}`,
    userId: data.userId,
    name: data.name,
    company: data.company,
    email: data.email,
    phone: data.phone,
    status: data.status || 'active',
    avatar: data.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
    createdAt: new Date().toISOString()
  };

  const savedClient = await create<Client>('clients', newClient);

  // Automatically create a ClientWorkspace for them
  const newWorkspace: ClientWorkspace = {
    id: `ws_${Math.random().toString(36).substring(2, 9)}`,
    clientId: savedClient.id,
    status: 'planning',
    progress: 10,
    createdAt: new Date().toISOString()
  };
  const savedWorkspace = await create<ClientWorkspace>('workspaces', newWorkspace);

  // Log the activity
  await logActivity({
    workspaceId: savedWorkspace.id,
    type: 'client_created',
    description: `Client ${savedClient.name} (${savedClient.company}) created`
  });

  return {
    ...savedClient,
    workspaceId: savedWorkspace.id
  };
}

export async function getClient(id: string, userId: string): Promise<Client | null> {
  const client = await read<Client>('clients', id);
  if (client && client.userId !== userId) {
    throw new Error('Unauthorized');
  }
  return client;
}

export async function getClients(userId: string): Promise<Client[]> {
  return await readAll<Client>('clients', userId);
}

export async function updateClient(id: string, data: Partial<Client>): Promise<Client> {
  return await update<Client>('clients', id, data);
}

export async function archiveClient(id: string, userId: string): Promise<Client> {
  const client = await getClient(id, userId);
  if (!client) throw new Error('Client not found');
  
  const updated = await update<Client>('clients', id, { status: 'archived' });
  
  // Find workspace to log activity
  const workspaces = await readAll<ClientWorkspace>('workspaces');
  const ws = workspaces.find(w => w.clientId === id);
  if (ws) {
    await logActivity({
      workspaceId: ws.id,
      type: 'client_archived',
      description: `Client ${client.name} archived`
    });
  }

  return updated;
}

export async function unarchiveClient(id: string, userId: string): Promise<Client> {
  const client = await getClient(id, userId);
  if (!client) throw new Error('Client not found');
  return await update<Client>('clients', id, { status: 'active' });
}
