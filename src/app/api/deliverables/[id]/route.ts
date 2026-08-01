import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/supabase/server';
import { readAll, update, remove } from '@/lib/services/dataService';
import { Deliverable } from '@/lib/types';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { id } = await params;
  const deliverables = await readAll<Deliverable>('deliverables');
  const deliverable = deliverables.find(d => d.id === id);
  if (!deliverable) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  return NextResponse.json(deliverable);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { id } = await params;
  const body = await request.json();
  const updated = await update<Deliverable>('deliverables', id, body);
  
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { id } = await params;
  await remove('deliverables', id);
  
  return NextResponse.json({ success: true });
}
