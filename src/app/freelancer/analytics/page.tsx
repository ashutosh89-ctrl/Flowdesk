import { getSession } from '@/lib/utils/session';
import { redirect } from 'next/navigation';
import { readAll } from '@/lib/services/dataService';
import { Client, Project, Invoice } from '@/lib/types';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const [clients, projects, invoices] = await Promise.all([
    readAll<Client>('clients'),
    readAll<Project>('projects'),
    readAll<Invoice>('invoices')
  ]);

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto">
      <AnalyticsDashboard clients={clients} projects={projects} invoices={invoices} />
    </div>
  );
}
