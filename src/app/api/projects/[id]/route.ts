import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/utils/session';
import { readAll, update, remove } from '@/lib/services/dataService';
import { Project } from '@/lib/types';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { id } = await params;
  const projects = await readAll<Project>('projects');
  const project = projects.find(p => p.id === id);
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  return NextResponse.json(project);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { id } = await params;
  const body = await request.json();
  const updated = await update<Project>('projects', id, body);
  
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { id } = await params;
  await remove('projects', id);
  
  return NextResponse.json({ success: true });
}
