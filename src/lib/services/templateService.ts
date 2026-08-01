import { Template } from '../types';

const STORAGE_KEY = 'flowdesk_templates';

const DEFAULT_TEMPLATES: Template[] = [
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

export async function getTemplates(type?: Template['type']): Promise<Template[]> {
  try {
    const res = await fetch(`/api/templates${type ? `?type=${type}` : ''}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.templates) && data.templates.length > 0) {
        return data.templates;
      }
    }
  } catch (e) {}

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: Template[] = JSON.parse(stored);
      return type ? parsed.filter(t => t.type === type) : parsed;
    }
  } catch (e) {}

  return type ? DEFAULT_TEMPLATES.filter(t => t.type === type) : DEFAULT_TEMPLATES;
}

export async function createTemplate(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<Template> {
  const newTmpl: Template = {
    ...template,
    id: `tmpl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const all = await getTemplates();
  const updated = [newTmpl, ...all];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {}

  try {
    await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTmpl)
    });
  } catch (e) {}

  return newTmpl;
}
