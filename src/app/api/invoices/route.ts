import { NextResponse } from 'next/server';
import { getSession } from '@/lib/utils/session';
import { getInvoices, createInvoice } from '@/lib/services/invoiceService';
import { readAll } from '@/lib/services/dataService';
import { Client, Project, Invoice } from '@/lib/types';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.role === 'freelancer') {
    const invoices = await getInvoices(session.id);
    return NextResponse.json(invoices);
  } else {
    const clients = await readAll<Client>('clients');
    const client = clients.find(c => c.email.toLowerCase() === session.email.toLowerCase());
    if (!client) return NextResponse.json([]);

    const projects = await readAll<Project>('projects');
    const clientProjects = projects.filter(p => p.clientId === client.id).map(p => p.id);
    
    const allInvoices = await readAll<Invoice>('invoices');
    const filtered = allInvoices.filter(inv => clientProjects.includes(inv.projectId));
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
    const invoice = await createInvoice(body);
    return NextResponse.json(invoice, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error creating invoice' }, { status: 400 });
  }
}
