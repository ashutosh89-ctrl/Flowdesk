import { getSession } from '@/lib/supabase/server';
import { readAll } from '@/lib/services/dataService';
import { ClientDocumentsClient } from '@/components/documents/ClientDocumentsClient';
import { redirect } from 'next/navigation';
import { Client, Document, ClientWorkspace } from '@/lib/types';

export default async function ClientDocumentsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const clients = await readAll<Client>('clients');
  let client = clients.find(c => c.email.toLowerCase() === session.email.toLowerCase());
  
  if (!client) {
    client = {
      id: `cl_${session.id || 'demo'}`,
      userId: 'usr_ann',
      name: session.email.split('@')[0] || 'Client Demo',
      company: 'Client Workspace',
      email: session.email,
      status: 'active',
      createdAt: new Date().toISOString()
    };
  }

  const wss = await readAll<ClientWorkspace>('workspaces');
  let workspace = wss.find(w => w.clientId === client.id);
  if (!workspace) {
    workspace = {
      id: `ws_${client.id}`,
      clientId: client.id,
      status: 'in_progress',
      progress: 60,
      createdAt: new Date().toISOString()
    };
  }

  const docs = await readAll<Document>('documents');
  const documents = docs.filter(d => d.workspaceId === workspace.id);

  return (
    <ClientDocumentsClient 
      initialData={{
        client,
        workspace,
        documents
      }}
    />
  );
}
