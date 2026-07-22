import { getSession } from '@/lib/utils/session';
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
  const client = clients.find(c => c.email.toLowerCase() === session.email.toLowerCase());
  if (!client) {
    redirect('/login');
  }

  const wss = await readAll<ClientWorkspace>('workspaces');
  const workspace = wss.find(w => w.clientId === client.id);
  if (!workspace) {
    redirect('/login');
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
