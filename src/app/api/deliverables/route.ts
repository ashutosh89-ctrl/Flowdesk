import { NextResponse } from 'next/server';
import { getSession } from '@/lib/utils/session';
import { readAll } from '@/lib/services/dataService';
import { createDeliverable, approveDeliverable, requestRevision, getDeliverables } from '@/lib/services/deliverableService';
import { Deliverable } from '@/lib/types';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  
  if (projectId) {
    const list = await getDeliverables(projectId);
    return NextResponse.json(list);
  }

  const all = await readAll<Deliverable>('deliverables');
  return NextResponse.json(all);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  try {
    if (body.action === 'approve') {
      const updated = await approveDeliverable(body.id, body.clientId);
      return NextResponse.json(updated);
    } else if (body.action === 'revision') {
      const updated = await requestRevision(body.id, body.comment);
      return NextResponse.json(updated);
    } else {
      const del = await createDeliverable(body);
      return NextResponse.json(del, { status: 201 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error processing deliverable request' }, { status: 400 });
  }
}
