import { getSession } from '@/lib/utils/session';
import { readAll } from '@/lib/services/dataService';
import { getInvitations } from '@/lib/services/invitationService';
import { ClientsClient } from '@/components/clients/ClientsClient';
import { redirect } from 'next/navigation';
import { Client } from '@/lib/types';

export default async function FreelancerClientsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const clients = await readAll<Client>('clients', session.id);
  const invitations = await getInvitations();

  return (
    <ClientsClient 
      initialClients={clients}
      initialInvitations={invitations}
    />
  );
}
