import { NextResponse } from 'next/server';
import { getSession } from '@/lib/supabase/server';
import { readAll } from '@/lib/services/dataService';
import { uploadDocument, requestDocuments } from '@/lib/services/documentService';
import { Document } from '@/lib/types';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspaceId');
  const allDocs = await readAll<Document>('documents');

  if (workspaceId) {
    const filtered = allDocs.filter(d => d.workspaceId === workspaceId);
    return NextResponse.json(filtered);
  }

  return NextResponse.json(allDocs);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  try {
    if (body.documents && Array.isArray(body.documents)) {
      await requestDocuments(body.workspaceId, body.documents);
      return NextResponse.json({ success: true });
    } else {
      const doc = await uploadDocument(body);
      return NextResponse.json(doc, { status: 201 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error processing document request' }, { status: 400 });
  }
}
