import { NextResponse } from 'next/server';
import { getSession } from '@/lib/supabase/server';
import { readAll } from '@/lib/services/dataService';
import { getComments, addComment } from '@/lib/services/commentService';
import { sanitizeInput } from '@/lib/utils/sanitize';
import { Comment } from '@/lib/types';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  
  if (projectId) {
    const list = await getComments(projectId);
    return NextResponse.json(list);
  }

  const all = await readAll<Comment>('comments');
  return NextResponse.json(all);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const sanitizedContent = sanitizeInput(body.content || '');
  
  if (!sanitizedContent || sanitizedContent.length > 5000) {
    return NextResponse.json({ error: 'Invalid comment content' }, { status: 400 });
  }

  try {
    const comm = await addComment({
      ...body,
      content: sanitizedContent,
      userId: session.id
    });
    return NextResponse.json(comm, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error adding comment' }, { status: 400 });
  }
}
