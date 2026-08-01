import { NextResponse } from 'next/server';
import { getSession } from '@/lib/supabase/server';
import { getClients, createClient } from '@/lib/services/clientService';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const clients = await getClients(session.id);
  return NextResponse.json(clients);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  const client = await createClient({ ...body, userId: session.id });
  return NextResponse.json(client, { status: 201 });
}
