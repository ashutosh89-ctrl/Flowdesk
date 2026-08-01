import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/supabase/server';
import { readAll, update, remove } from '@/lib/services/dataService';
import { Invoice } from '@/lib/types';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { id } = await params;
  const invoices = await readAll<Invoice>('invoices');
  const invoice = invoices.find(i => i.id === id);
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  return NextResponse.json(invoice);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { id } = await params;
  const body = await request.json();
  const updated = await update<Invoice>('invoices', id, body);
  
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { id } = await params;
  await remove('invoices', id);
  
  return NextResponse.json({ success: true });
}
