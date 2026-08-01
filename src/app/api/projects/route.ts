import { NextResponse } from 'next/server';
import { getSession } from '@/lib/supabase/server';
import { readAll } from '@/lib/services/dataService';
import { Project, Client } from '@/lib/types';
import { createProject } from '@/lib/services/projectService';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allProjects = await readAll<Project>('projects');
  
  if (session.role === 'freelancer') {
    const clients = await readAll<Client>('clients', session.id);
    const clientIds = clients.map(c => c.id);
    const filtered = allProjects.filter(p => clientIds.includes(p.clientId));
    return NextResponse.json(filtered);
  } else {
    const clients = await readAll<Client>('clients');
    const client = clients.find(c => c.email.toLowerCase() === session.email.toLowerCase());
    if (!client) {
      return NextResponse.json([]);
    }
    const filtered = allProjects.filter(p => p.clientId === client.id);
    return NextResponse.json(filtered);
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  try {
    const project = await createProject(body);
    return NextResponse.json(project, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error creating project' }, { status: 400 });
  }
}
