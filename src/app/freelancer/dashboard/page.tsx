import { getSession } from '@/lib/supabase/server';
import { readAll } from '@/lib/services/dataService';
import { getNextBestActions } from '@/lib/services/nextBestActionService';
import { FreelancerDashboardClient } from '@/components/dashboard/FreelancerDashboardClient';
import { redirect } from 'next/navigation';
import { Client, ClientWorkspace, Project, Invoice, Activity } from '@/lib/types';

export default async function FreelancerDashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const clients = await readAll<Client>('clients', session.id);
  const workspaces = await readAll<ClientWorkspace>('workspaces', session.id);
  const projects = await readAll<Project>('projects', session.id);
  const invoices = await readAll<Invoice>('invoices', session.id);
  
  const allActs = await readAll<Activity>('activities', session.id);
  const activities = allActs
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);
  const actions = await getNextBestActions(session.id);


  return (
    <FreelancerDashboardClient 
      initialData={{
        clients,
        workspaces,
        projects,
        invoices,
        activities,
        actions
      }}
    />
  );
}
