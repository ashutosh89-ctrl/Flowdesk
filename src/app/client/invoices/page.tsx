import { getSession } from '@/lib/supabase/server';
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
