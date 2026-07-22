import { getSession } from '@/lib/utils/session';
import { readAll } from '@/lib/services/dataService';
import { ClientInvoicesClient } from '@/components/invoices/ClientInvoicesClient';
import { redirect } from 'next/navigation';
import { Client, Project, Invoice } from '@/lib/types';

export default async function ClientInvoicesPage() {
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

  let invoices: Invoice[] = [];

  if (project) {
    const allInvs = await readAll<Invoice>('invoices');
    invoices = allInvs.filter(i => i.projectId === project.id);
  }

  return (
    <ClientInvoicesClient 
      initialData={{
        client,
        project,
        invoices
      }}
    />
  );
}
