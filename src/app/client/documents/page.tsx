import { getSession } from '@/lib/utils/session';
import { readAll } from '@/lib/services/dataService';
import { ClientDocumentsClient } from '@/components/documents/ClientDocumentsClient';
import { redirect } from 'next/navigation';
import { Client, Document, ClientWorkspace } from '@/lib/types';

export default async function ClientDocumentsPage() {
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

  return (
    <ClientDocumentsClient 
      initialData={{
        client,
        workspace,
        documents
      }}
    />
  );
}
