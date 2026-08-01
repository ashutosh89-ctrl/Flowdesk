import { getSession } from '@/lib/utils/session';
import { readAll, update } from '@/lib/services/dataService';
import { InvoicesClient } from '@/components/invoices/InvoicesClient';
import { redirect } from 'next/navigation';
import { Invoice, Project, Client } from '@/lib/types';

export default async function FreelancerInvoicesPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const allInvoices = await readAll<Invoice>('invoices', session.id);
  
  const invoices = await Promise.all(
    allInvoices.map(async (i) => {
      if (i.status === 'pending' && new Date(i.dueDate).getTime() < Date.now()) {
        const updated = { ...i, status: 'overdue' as const };
        await update('invoices', i.id, { status: 'overdue' });
        return updated;
      }
      return i;
    })
  );

  const projects = await readAll<Project>('projects', session.id);
  const clients = await readAll<Client>('clients', session.id);


  return (
    <InvoicesClient 
      initialInvoices={invoices}
      initialProjects={projects}
      initialClients={clients}
    />
  );
}
