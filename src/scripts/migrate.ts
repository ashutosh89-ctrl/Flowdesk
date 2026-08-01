import { createClient } from '@supabase/supabase-js';
import { keysToSnake } from '../lib/services/dataService';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually so this script works outside Next's runtime
// (e.g. `npx tsx src/scripts/migrate.ts`).
(function loadLocalEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
})();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  process.exit(1);
}

// Service-role client (bypasses RLS) for seeding
const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const DEMO_USERS = [
  {
    email: 'demo-freelancer@flowdesk.io',
    password: 'demo-password-123',
    name: 'Demo Freelancer',
    role: 'freelancer',
    plan: 'pro',
  },
  {
    email: 'demo-client@flowdesk.io',
    password: 'demo-password-123',
    name: 'Demo Client',
    role: 'client',
    plan: 'free',
  },
];

const SEED_DATA: Record<string, any[]> = {
  clients: [
    {
      id: 'cl_david',
      userId: 'demo-freelancer',
      name: 'David Stern',
      company: 'Axiom Global',
      email: 'david.stern@axiom.co',
      phone: '+1 (555) 012-3456',
      status: 'active',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=David',
      createdAt: new Date('2025-01-10').toISOString(),
    },
    {
      id: 'cl_marta',
      userId: 'demo-freelancer',
      name: 'Marta Adams',
      company: 'Global Logistics Inc.',
      email: 'marta.adams@globallogistics.com',
      phone: '+1 (555) 789-0123',
      status: 'active',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Marta',
      createdAt: new Date('2025-01-15').toISOString(),
    }
  ],
  client_workspaces: [
    {
      id: 'ws_david',
      clientId: 'cl_david',
      status: 'in_progress',
      progress: 75,
      createdAt: new Date('2025-01-10').toISOString(),
    },
    {
      id: 'ws_marta',
      clientId: 'cl_marta',
      status: 'review',
      progress: 85,
      createdAt: new Date('2025-01-15').toISOString(),
    }
  ],
  projects: [
    {
      id: 'proj_axiom',
      clientId: 'cl_david',
      name: 'Coders Management Portal',
      description: 'Management & analytics portal for client operations.',
      status: 'in_progress',
      dueDate: '2026-08-15',
      progress: 75,
      createdAt: new Date('2025-01-10').toISOString(),
    },
    {
      id: 'proj_alpha',
      clientId: 'cl_marta',
      name: 'Project Alpha: Brand Refresh',
      description: 'Full identity design, assets production and guidelines revision.',
      status: 'review',
      dueDate: '2026-07-30',
      progress: 85,
      createdAt: new Date('2025-01-15').toISOString(),
    }
  ],
  documents: [
    {
      id: 'doc_1',
      workspaceId: 'ws_david',
      name: 'License_Agreement_2023.pdf',
      type: 'pdf',
      status: 'signed',
      fileUrl: '#',
      uploadedAt: new Date('2026-07-20T05:45:00').toISOString(),
      createdAt: new Date('2026-07-20T05:45:00').toISOString(),
    },
    {
      id: 'doc_2',
      workspaceId: 'ws_david',
      name: 'Devspire_UI_Kit_Final.fig',
      type: 'png',
      status: 'reviewed',
      fileUrl: '#',
      uploadedAt: new Date('2026-07-19T10:00:00').toISOString(),
      createdAt: new Date('2026-07-19T10:00:00').toISOString(),
    }
  ],
  deliverables: [
    {
      id: 'del_1',
      projectId: 'proj_axiom',
      name: 'Hero Section Wireframe',
      version: 'v2.4',
      status: 'pending_approval',
      createdAt: new Date('2026-07-18').toISOString(),
    }
  ],
  invoices: [
    {
      id: 'inv_david',
      projectId: 'proj_axiom',
      invoiceNumber: 'INV-2023-8902',
      items: [
        { description: 'UX/UI Design - Phase 2', quantity: 45.0, rate: 150.00, amount: 6750.00 }
      ],
      subtotal: 6750.00,
      taxRate: 0,
      taxAmount: 0,
      total: 6750.00,
      status: 'overdue',
      dueDate: '2026-07-16',
      createdAt: new Date('2026-07-01').toISOString(),
    }
  ],
  comments: [
    {
      id: 'comm_1',
      projectId: 'proj_alpha',
      userId: 'demo-freelancer',
      userName: 'Demo Freelancer',
      content: "Updated the hero animation based on your feedback. Let me know if the iridescent effect feels balanced now.",
      createdAt: new Date('2026-07-20T05:41:00').toISOString(),
    }
  ],
  activities: [
    {
      id: 'act_1',
      workspaceId: 'ws_david',
      type: 'document_uploaded',
      description: 'John Doe uploaded 3 files',
      metadata: { files: ['design_v2.fig', 'styleguide.pdf'] },
      createdAt: new Date('2026-07-20T05:41:00').toISOString(),
    }
  ]
};

export async function runMigration() {
  console.log('Starting Supabase migration...');

  // Maps demo email -> auth user id so seed rows reference real UUIDs
  const userIdByEmail = new Map<string, string>();

  // 1. Create demo auth users + profiles + default settings rows
  for (const demo of DEMO_USERS) {
    console.log(`Ensuring demo user ${demo.email}...`);

    let userId: string | null = null;

    const { data: existing, error: listError } = await admin.auth.admin.listUsers();
    if (!listError && existing) {
      const match = existing.users.find(u => u.email === demo.email);
      if (match) userId = match.id;
    }

    if (!userId) {
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email: demo.email,
        password: demo.password,
        email_confirm: true,
        user_metadata: { full_name: demo.name, role: demo.role },
      });
      if (createError) {
        console.error(`Could not create demo user ${demo.email}:`, createError.message);
        continue;
      }
      userId = created.user.id;
      console.log(`Created demo user ${demo.email} -> ${userId}`);
    }

    if (userId) userIdByEmail.set(demo.email, userId);

    // Profile
    const { error: profileError } = await admin.from('profiles').upsert({
      id: userId,
      email: demo.email,
      name: demo.name,
      role: demo.role,
      plan: demo.plan,
      onboarding_completed: true,
    });
    if (profileError) console.error(`Profile upsert failed for ${demo.email}:`, profileError.message);

    // Default settings rows (ignore conflicts)
    await admin.from('business_settings').upsert({ user_id: userId });
    await admin.from('notification_settings').upsert({ user_id: userId });
    await admin.from('workspace_preferences').upsert({ user_id: userId });
    await admin.from('subscriptions').upsert({ user_id: userId, plan: demo.plan, status: 'active' });
  }

  // 2. Seed data tables (remap placeholder demo ids -> real auth UUIDs)
  const remapIds = (row: any): any => {
    const next = { ...row };
    if (next.userId === 'demo-freelancer' || next.userId === 'demo-client') {
      const email = next.userId === 'demo-freelancer' ? 'demo-freelancer@flowdesk.io' : 'demo-client@flowdesk.io';
      const realId = userIdByEmail.get(email);
      if (realId) next.userId = realId;
    }
    return next;
  };

  for (const [table, rows] of Object.entries(SEED_DATA)) {
    console.log(`Migrating table ${table} (${rows.length} rows)...`);
    const formattedRows = rows.map(r => keysToSnake(remapIds(r)));
    const { error } = await admin.from(table).upsert(formattedRows, { onConflict: 'id' });
    if (error) {
      console.error(`Error migrating table ${table}:`, error.message);
    } else {
      console.log(`Table ${table} migrated successfully.`);
    }
  }

  console.log('Migration completed.');
}

// Allow running directly: npx tsx scripts/migrate.ts
if (require.main === module) {
  runMigration().then(() => process.exit(0)).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
