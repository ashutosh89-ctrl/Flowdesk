import { supabase } from '../lib/supabase/client';
import { keysToSnake } from '../lib/services/dataService';

const SEED_DATA = {
  profiles: [
    {
      id: 'usr_ann',
      email: 'ann.k@flowdesk.com',
      name: 'Ann Kowalski',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfyQMh7YDLdS4DNFFIrBR32RuY8F9lNA8BvQ6ZWKGr29ibB3BcWaSy9SrXqKCPYBVB--r3qPxt5RTbd0SZ-sZRTM8Xt6Kh8pG4SYwJZ74-Qi_EB_2v_iJ1ON28qaaePZjrHYC9diaY1x7ar25MBlJy-htNlqzQHgo6Tf7FFTlXmLrm2jmrK4EBVzv24OLqImh76DHBcLJFVpbyoSAYSBCeFNUH5A3TpFRRInmdu5W0Il9OAMCfXQkX0tf4PDOPsE3QA-ya1tuEPGj-',
      role: 'freelancer',
      plan: 'pro',
      createdAt: new Date('2025-01-01').toISOString(),
    },
    {
      id: 'usr_marta',
      email: 'marta.adams@globallogistics.com',
      name: 'Marta Adams',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATeJv1t6XJNyYNrmhUXbKhHfgbMLvuAxQzIuCGT3UkU8vsK5sQLA54YJ029_DmkQpOtJxXQI192sWDLIsIqW2jC8K0ewpU4RABrEVUOOjQmNPH93uk4umNhFS26QTmXfI0U5NYfMBEPpBl9tuxs-fFPu_fqP0Dv-dMK7pBroV2tlHT-JksFt0iENX9owk8EY4PB6ZiTpfKukzWbBAGwDs32vnxdVfYey3JeKddFCmnXaXcxHlnyzZ9VT1VXpmlRzHwDfuDJ4jVyFEk',
      role: 'client',
      plan: 'free',
      createdAt: new Date('2025-02-01').toISOString(),
    }
  ],
  clients: [
    {
      id: 'cl_david',
      userId: 'usr_ann',
      name: 'David Stern',
      company: 'Axiom Global',
      email: 'david.stern@axiom.co',
      phone: '+1 (555) 012-3456',
      status: 'active',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxR8bwfr9JWXSyZimF5A8hrg3qhWBFfvzW63M3JtvvGfkywqFrIh5D4I5BFyoHPkB47CxH78KI9X2F8HHhfk6YGxcYwJ8x7hW1WTMDVyECHrvwOpBkgBh7r3-kkDd5ZXb2jMOdOrwUSck7xkY8rNUUGbPrvBYdn2v-UEM9FsBXdZJbvJKhPSeO4vyviua86uiHVnF5AWy3wGRCPZ6GUAXKOgAhydyUEjOQcfasXt1-Mi8ONRW_BRuhVVeAtBYQNm8ssP62ucz4WKhz',
      createdAt: new Date('2025-01-10').toISOString(),
    },
    {
      id: 'cl_marta',
      userId: 'usr_ann',
      name: 'Marta Adams',
      company: 'Global Logistics Inc.',
      email: 'marta.adams@globallogistics.com',
      phone: '+1 (555) 789-0123',
      status: 'active',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATeJv1t6XJNyYNrmhUXbKhHfgbMLvuAxQzIuCGT3UkU8vsK5sQLA54YJ029_DmkQpOtJxXQI192sWDLIsIqW2jC8K0ewpU4RABrEVUOOjQmNPH93uk4umNhFS26QTmXfI0U5NYfMBEPpBl9tuxs-fFPu_fqP0Dv-dMK7pBroV2tlHT-JksFt0iENX9owk8EY4PB6ZiTpfKukzWbBAGwDs32vnxdVfYey3JeKddFCmnXaXcxHlnyzZ9VT1VXpmlRzHwDfuDJ4jVyFEk',
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
      userId: 'usr_ann',
      userName: 'Alex Chen',
      userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAA-jMq2HElW6g6rd_J5SctmX5RLoXk3TpOqbSNrnwLhMMMwhpl5HqdfpTe2rPG9RjofEeZWP8m7hDncuA-4w9HKJ_8yoBvPL0Z8nl6YKmdmdTeZOOV5TPi4PIobqO8MfwoOemqI0yDaQ1BA2yHCl3rIuOFBXd1iT7e6ziSmXB6jD733TO9Ho7YAIhsp-oARHUkZeO2wuEByla2KbfoQz05gXeHXyHMRBjJeaxoWWgkZbH_SIRFDEy4TW30nARJ3qWuqSb0baIL7sSX',
      content: "Marta, I've updated the fluid animation in the hero concept based on your feedback about the transparency levels. Let me know if the iridescent effect feels balanced now.",
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
  
  for (const [table, rows] of Object.entries(SEED_DATA)) {
    console.log(`Migrating table ${table} (${rows.length} rows)...`);
    
    // Format keys to snake_case for DB compatibility
    const formattedRows = rows.map(r => keysToSnake(r));
    
    const { error } = await supabase
      .from(table)
      .upsert(formattedRows, { onConflict: 'id' });
      
    if (error) {
      console.error(`Error migrating table ${table}:`, error.message);
    } else {
      console.log(`Table ${table} migrated successfully.`);
    }
  }
  
  console.log('Migration completed.');
}
