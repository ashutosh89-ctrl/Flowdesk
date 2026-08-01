import { getSession, createClient } from '@/lib/supabase/server';
import { readAll } from '@/lib/services/dataService';
import { mapInviteToInvitation } from '@/lib/services/invitationService';
import { ClientsClient } from '@/components/clients/ClientsClient';
import { redirect } from 'next/navigation';
import { Client } from '@/lib/types';

export default async function FreelancerClientsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const clients = await readAll<Client>('clients', session.id);

  // Fetch invites with the server (cookie-authenticated) client — the browser
  // service uses a client-only client and would fail during RSC.
  const supabase = await createClient();
  const { data: inviteRows } = await supabase
    .from('client_invites')
    .select('*')
    .eq('freelancer_id', session.id)
    .order('created_at', { ascending: false });
  const invitations = (inviteRows || []).map((r: any) => mapInviteToInvitation(r, r.client_record_id || ''));

  return (
    <ClientsClient
      initialClients={clients}
      initialInvitations={invitations}
    />
  );
}
