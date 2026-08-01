import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/utils/session';

let templatesCache: any[] = [
  {
    id: 'tmpl_1',
    userId: 'usr_ann',
    type: 'document_request',
    name: 'Standard Brand Onboarding',
    content: JSON.stringify([
      { name: 'Brand Guidelines PDF', description: 'Vector logo files and color palettes' },
      { name: 'Tax Compliance Certificate', description: 'W-9 or GST registration details' }
    ]),
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tmpl_2',
    userId: 'usr_ann',
    type: 'invoice_note',
    name: 'Standard Payment Terms (Net 14)',
    content: 'Payment is due within 14 days of issue date. Please reference Invoice Number on bank transfers.',
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tmpl_3',
    userId: 'usr_ann',
    type: 'email_signature',
    name: 'Professional Studio Signature',
    content: 'Best regards,\nAlex Chen\nPrincipal Architect | FlowDesk Studio\nbilling@flowdesk.io',
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tmpl_4',
    userId: 'usr_ann',
    type: 'project_description',
    name: 'UI/UX Redesign Scope',
    content: 'Complete design audit, high-fidelity Figma mockups, interactive component prototypes, and developer handoff documentation.',
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  const filtered = type ? templatesCache.filter(t => t.type === type) : templatesCache;
  return NextResponse.json({ templates: filtered });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const newTmpl = {
    ...body,
    id: `tmpl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: session.id || 'usr_ann',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  templatesCache = [newTmpl, ...templatesCache];
  return NextResponse.json({ success: true, template: newTmpl });
}
