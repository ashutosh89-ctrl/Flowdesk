import { getSession } from '@/lib/supabase/server';
import { readAll } from '@/lib/services/dataService';
import { ClientWorkspaceDashboardClient } from '@/components/workspace/ClientWorkspaceDashboardClient';
import { redirect } from 'next/navigation';
import { Client, Project, Document, Deliverable, Invoice, ClientWorkspace } from '@/lib/types';

export default async function ClientWorkspacePage() {
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

  const projs = await readAll<Project>('projects');
  const project = projs.find(p => p.clientId === client.id) || null;

  let deliverables: Deliverable[] = [];
  let invoices: Invoice[] = [];

  if (project) {
    const dels = await readAll<Deliverable>('deliverables');
    deliverables = dels.filter(d => d.projectId === project.id);

    const invs = await readAll<Invoice>('invoices');
    invoices = invs.filter(i => i.projectId === project.id);
  }

  return (
    <ClientWorkspaceDashboardClient 
      initialData={{
        client,
        workspace,
        project,
        documents,
        deliverables,
        invoices
      }}
    />
  );
}
