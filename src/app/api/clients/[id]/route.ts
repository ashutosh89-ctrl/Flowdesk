import { NextResponse } from 'next/server';
import { getSession } from '@/lib/supabase/server';
import { getClient, updateClient, archiveClient } from '@/lib/services/clientService';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = await params;
  try {
    const client = await getClient(id, session.id);
    if (!client) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }
    return NextResponse.json(client);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error fetching client' }, { status: 403 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = await params;
  const body = await request.json();
  try {
    const client = await getClient(id, session.id);
    if (!client) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }
    const updated = await updateClient(id, body);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error updating client' }, { status: 403 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id } = await params;
  try {
    await archiveClient(id, session.id);
    return new Response(null, { status: 204 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error archiving client' }, { status: 403 });
  }
}
