import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/utils/session';
import { readAll } from '@/lib/services/dataService';
import { FreelancerWorkspaceClient } from '@/components/workspace/FreelancerWorkspaceClient';
import { Client, ClientWorkspace, Project, Document as AppDocument, Deliverable, Invoice, Activity, Comment as AppComment } from '@/lib/types';

export default async function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionCookie = (await cookies()).get('session')?.value;
  
  const user = sessionCookie ? await verifySession(sessionCookie) : null;
  if (!user) redirect('/login');

  const workspaces = await readAll<ClientWorkspace>('workspaces');
  const workspace = workspaces.find(w => w.id === id) || workspaces[0];
  const clients = await readAll<Client>('clients');
  const client = clients.find(c => c.id === workspace?.clientId) || clients[0];
  const projects = await readAll<Project>('projects');
  const project = projects.find(p => p.clientId === client?.id) || null;
  const documents = await readAll<AppDocument>('documents');
  const deliverables = await readAll<Deliverable>('deliverables');
  const invoices = await readAll<Invoice>('invoices');
  const activities = await readAll<Activity>('activities');
  const comments = await readAll<AppComment>('comments');

  return (
    <FreelancerWorkspaceClient 
      initialData={{
        client,
        workspace,
        project,
        documents: documents.filter(d => d.workspaceId === workspace?.id),
        deliverables: project ? deliverables.filter(d => d.projectId === project.id) : [],
        invoices: project ? invoices.filter(i => i.projectId === project.id) : [],
        activities,
        comments: project ? comments.filter(c => c.projectId === project.id) : [],
        action: null
      }} 
    />
  );
}
