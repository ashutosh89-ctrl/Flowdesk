import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/utils/session';

// Memory cache for notifications across requests
let notificationsCache: any[] = [
  {
    id: 'notif_1',
    userId: 'usr_ann',
    type: 'invoice_paid',
    title: 'Payment Received',
    message: 'David Stern (Axiom Global) paid Invoice #INV-2026-0001 ($5,310.00).',
    link: '/freelancer/invoices',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'notif_2',
    userId: 'usr_ann',
    type: 'deliverable_approved',
    title: 'Deliverable Approved',
    message: 'Marta Adams approved "Homepage Wireframe & Design Specs v2.0".',
    link: '/freelancer/workspace/cl_marta',
    read: false,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'notif_3',
    userId: 'usr_ann',
    type: 'document_uploaded',
    title: 'Document Uploaded',
    message: 'Elena Rodriguez uploaded "Brand Guidelines PDF" for verification.',
    link: '/freelancer/workspace/cl_elena',
    read: true,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  }
];

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ notifications: notificationsCache });
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  if (Array.isArray(body.notifications)) {
    notificationsCache = body.notifications;
  }

  return NextResponse.json({ success: true, notifications: notificationsCache });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const newNotif = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: session.id || 'usr_ann',
    type: body.type || 'invoice_paid',
    title: body.title || 'New Notification',
    message: body.message || '',
    link: body.link,
    read: false,
    createdAt: new Date().toISOString()
  };

  notificationsCache = [newNotif, ...notificationsCache];
  return NextResponse.json({ success: true, notification: newNotif });
}
