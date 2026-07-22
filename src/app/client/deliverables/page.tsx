import { getSession } from '@/lib/utils/session';
import { readAll } from '@/lib/services/dataService';
import { ClientDeliverablesClient } from '@/components/deliverables/ClientDeliverablesClient';
import { redirect } from 'next/navigation';
import { Client, Project, Deliverable } from '@/lib/types';

export default async function ClientDeliverablesPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const clients = await readAll<Client>('clients');
  const client = clients.find(c => c.email.toLowerCase() === session.email.toLowerCase());
  if (!client) {
    redirect('/login');
  }

  const projs = await readAll<Project>('projects');
  const project = projs.find(p => p.clientId === client.id) || null;

  let deliverables: Deliverable[] = [];

  if (project) {
    const allDels = await readAll<Deliverable>('deliverables');
    deliverables = allDels.filter(d => d.projectId === project.id);
  }

  return (
    <ClientDeliverablesClient 
      initialData={{
        client,
        project,
        deliverables
      }}
    />
  );
}
