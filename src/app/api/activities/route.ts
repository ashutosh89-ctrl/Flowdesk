import { NextResponse } from 'next/server';
import { getSession } from '@/lib/utils/session';
import { getActivities, getAllActivities } from '@/lib/services/activityService';
import { readAll } from '@/lib/services/dataService';
import { ClientWorkspace, Client } from '@/lib/types';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspaceId');

  if (workspaceId) {
    if (session.role === 'client') {
      const workspaces = await readAll<ClientWorkspace>('workspaces');
      const ws = workspaces.find(w => w.id === workspaceId);
      const clients = await readAll<Client>('clients');
      const client = clients.find(c => c.email.toLowerCase() === session.email.toLowerCase());
      if (!ws || !client || ws.clientId !== client.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    const list = await getActivities(workspaceId);
    return NextResponse.json(list);
  }

  if (session.role === 'freelancer') {
    const list = await getAllActivities();
    return NextResponse.json(list);
  } else {
    const clients = await readAll<Client>('clients');
    const client = clients.find(c => c.email.toLowerCase() === session.email.toLowerCase());
    if (!client) return NextResponse.json([]);
    
    const workspaces = await readAll<ClientWorkspace>('workspaces');
    const ws = workspaces.find(w => w.clientId === client.id);
    if (!ws) return NextResponse.json([]);

    const list = await getActivities(ws.id);
    return NextResponse.json(list);
  }
}
