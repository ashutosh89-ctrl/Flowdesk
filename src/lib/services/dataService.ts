import { Client, ClientWorkspace, Project, Document, Deliverable, Invoice, Comment, Activity, User } from '../types';
import { supabase } from '../supabase/client';

const DB_KEY = 'flowdesk_db';

interface Database {
  users: User[];
  clients: Client[];
  workspaces: ClientWorkspace[];
  projects: Project[];
  documents: Document[];
  deliverables: Deliverable[];
  invoices: Invoice[];
  comments: Comment[];
  activities: Activity[];
}

const DEFAULT_DB: Database = {
  users: [
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
    },
    {
      id: 'cl_marcus',
      userId: 'usr_ann',
      name: 'Marcus Thorne',
      company: 'Horizon Tech',
      email: 'm.thorne@horizon.io',
      phone: '+1 (555) 123-4567',
      status: 'active',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1cW0vZmuP24Z5CAm7Cf8Os9zo3pE279yVGP4_PGa8kqukR2XP-McaWcfcjWHYI4nktCXWNGuWGLcJUs0JYnhFTTqhW3KoNRWLWcHVzR2i0ZyPt1wKJ5qUmFN0PPtbADJF7XC6_8Ams_a6Ck1i13Q8Ef7WcW4p_rFv6utsIijEcG-IAYeodBTTBoChYuruGA5AiU4vmUjEGuDJ-5OvXsAMpLSlpeuRzDEJ6zDxYpXM0o00Pil0pHbOqCQZAL-W14iBy7IPn-Y8EZ4p',
      createdAt: new Date('2025-01-20').toISOString(),
    },
    {
      id: 'cl_elena',
      userId: 'usr_ann',
      name: 'Elena Rodriguez',
      company: 'Lumina Creative',
      email: 'elena@lumina.design',
      phone: '+1 (555) 234-5678',
      status: 'onboarding',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpOUfLukrXe_DfEzGsq1iLh_zzfZQzWDEQSiJs7O3UCqDNUbiSGyAa64Ss3vgFOOQgEDRXfYuBHv0ASt1tuXd_8McWB0Kd0_PWu1NUq1uwTpnReyjkFUsE59Mo849sinBrdiL7HGUQzrzFmUHa7qkWzoH_IZvFTecwBSAN_ujuIXSPC_LKi3b1s1sA7Yb7-bmGszOpvDI4Im3STNphtwKbE0UCiNVJCUYVtn8nTKcSA9QqqbV3bjuIo_Vq2ZYYawK8w6KvZnMg2CT1',
      createdAt: new Date('2025-02-05').toISOString(),
    },
    {
      id: 'cl_sarah',
      userId: 'usr_ann',
      name: 'Sarah Jenkins',
      company: 'Peak Finance',
      email: 's.jenkins@peak.com',
      phone: '+1 (555) 345-6789',
      status: 'active',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRfHuwSveXNe4m_tBPYMrk2KwnF4mtahR2-N5hvLq55T48-1oZnzyrhpFmyQI6qszxcPBBQkUxa4uECqP1cIahbWCE5c4ivGAMMtmOboE68zpqFc7sM-MgfvX_TZI0WL1JPTRJ5FoOUhvJQ4JeCR77e3QSepkc8Fh_l0JrFx2R_n1FlDAfZXOF_78VXrFlhi6EI42deZUbjoj79KgXQ9qmeMD3UmUG51BmwosEcb8CtHc69TDofexdfnAE5A3re61bbI2lowf_KiG9',
      createdAt: new Date('2025-02-10').toISOString(),
    },
    {
      id: 'cl_wei',
      userId: 'usr_ann',
      name: 'Chen Wei',
      company: 'Velocity Apps',
      email: 'wei@velocity.co',
      phone: '+1 (555) 456-7890',
      status: 'active',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC44qbRlnsm-D0q7hkL-IjryiLk261ymYTRDiuu1pR45jr-F-sejkPVFJEDbjftaUcAvZxzIaBphjQPYeVss5Gy0nxAzlxDb76f6oTNZUBzT_Y-m41EpUEUOlBCXIC-Idqf_-8aNSHwbDX8d8VPh6SZnZ7VKVMarveeH_CXkTkm224cjBQwkZLaEwG-5Tmhd0yIJfBTrh1NqGgW143NSXBsKMUcRUBXpzK1goOTuqo-eL4FCKrD73Rmv62hcBTPcymgb0rH8LrspxXq',
      createdAt: new Date('2025-02-12').toISOString(),
    },
    {
      id: 'cl_amara',
      userId: 'usr_ann',
      name: 'Amara Okafor',
      company: 'Echo Sound',
      email: 'amara@echosound.io',
      phone: '+1 (555) 567-8901',
      status: 'active',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUWwIHm_AtE-Y0Qt1qaZrZP5HL1_zq3C8yXM8f0gkCZ1JrM4OClFTAZ9_qzvoVa6UV_tAtlGNdQzr_XJGAIBI60_JpkP2HdWpZuP1gA-LEcjMblc26J_vXNxNEflXS9kNLfUSYZ6v9PHfESap9XJ_kTWSrHem8ZP6Jioj9BC6-sb-I-hj0XbN6ALnkT4n05tiVzFwKnmwxRjPlq2px6EGPLzIQhgARcWEuAwSCX60w-7-OkEFQFS3v5yGxq2dfD4ZMlhEWtZxDa-Cu',
      createdAt: new Date('2025-02-14').toISOString(),
    }
  ],
  workspaces: [
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
    },
    {
      id: 'doc_3',
      workspaceId: 'ws_david',
      name: 'Product_Specifications_v2.docx',
      type: 'docx',
      status: 'draft',
      fileUrl: '#',
      uploadedAt: new Date('2026-07-17T14:30:00').toISOString(),
      createdAt: new Date('2026-07-17T14:30:00').toISOString(),
    },
    {
      id: 'doc_4',
      workspaceId: 'ws_david',
      name: 'Campaign_Moodboard_Concept.zip',
      type: 'jpg',
      status: 'approved',
      fileUrl: '#',
      uploadedAt: new Date('2026-07-13T09:15:00').toISOString(),
      createdAt: new Date('2026-07-13T09:15:00').toISOString(),
    },
    {
      id: 'doc_5',
      workspaceId: 'ws_david',
      name: 'Analytics_Report_Q4.xlsx',
      type: 'pdf',
      status: 'archived',
      fileUrl: '#',
      uploadedAt: new Date('2026-07-08T16:00:00').toISOString(),
      createdAt: new Date('2026-07-08T16:00:00').toISOString(),
    },
    {
      id: 'doc_marta_1',
      workspaceId: 'ws_marta',
      name: 'Style_Guide_V2.pdf',
      type: 'pdf',
      status: 'uploaded',
      fileUrl: '#',
      uploadedAt: new Date('2026-07-20T06:12:00').toISOString(),
      createdAt: new Date('2026-07-20T06:12:00').toISOString(),
    },
    {
      id: 'doc_marta_2',
      workspaceId: 'ws_marta',
      name: 'Asset_Package.zip',
      type: 'png',
      status: 'uploaded',
      fileUrl: '#',
      uploadedAt: new Date('2026-07-20T06:13:00').toISOString(),
      createdAt: new Date('2026-07-20T06:13:00').toISOString(),
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
    },
    {
      id: 'del_2',
      projectId: 'proj_axiom',
      name: 'Asset Pack: Fluid Shapes',
      version: 'v1.0',
      status: 'pending_approval',
      createdAt: new Date('2026-07-19').toISOString(),
    },
    {
      id: 'del_3',
      projectId: 'proj_axiom',
      name: 'Information Architecture',
      version: 'v3.1',
      status: 'approved',
      createdAt: new Date('2026-07-15').toISOString(),
    },
    {
      id: 'del_marta_1',
      projectId: 'proj_alpha',
      name: 'Hero Concept Animation',
      version: 'v3.4',
      status: 'pending_approval',
      createdAt: new Date('2026-07-20').toISOString(),
    },
    {
      id: 'del_marta_2',
      projectId: 'proj_alpha',
      name: 'Design System Core',
      version: 'v1.0',
      status: 'pending_approval',
      createdAt: new Date('2026-07-19').toISOString(),
    }
  ],
  invoices: [
    {
      id: 'inv_david',
      projectId: 'proj_axiom',
      invoiceNumber: 'INV-2023-8902',
      items: [
        { description: 'UX/UI Design - Phase 2', quantity: 45.0, rate: 150.00, amount: 6750.00 },
        { description: 'Mobile App Development', quantity: 30.0, rate: 170.00, amount: 5100.00 },
        { description: 'API Integration', quantity: 4.0, rate: 150.00, amount: 600.00 }
      ],
      subtotal: 12450.00,
      taxRate: 0,
      taxAmount: 0,
      total: 12450.00,
      status: 'overdue',
      dueDate: '2026-07-16',
      createdAt: new Date('2026-07-01').toISOString(),
    },
    {
      id: 'inv_marta',
      projectId: 'proj_alpha',
      invoiceNumber: 'INV-2023-0042',
      items: [
        { description: 'Development Phase 1', quantity: 1.0, rate: 4250.00, amount: 4250.00 }
      ],
      subtotal: 4250.00,
      taxRate: 0,
      taxAmount: 0,
      total: 4250.00,
      status: 'pending',
      dueDate: '2026-07-24',
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
    },
    {
      id: 'comm_2',
      projectId: 'proj_alpha',
      userId: 'usr_marta',
      userName: 'Marta Adams',
      userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrmkp0ByunzFAYLgBZ_vwV4zRImeAlU-9NRiFCcDRpYYr0vEQngSlxfEZ_Ho5FVStih6puloyiB9j6wAHvrJiJ_eXLMlUpuWODxIro4hbIFIPH_HsPoc27StCl61TT79VMwIOSkij5L-67caI2skEWhaanW2Mhkou2Aj6VE6taLP0svb8pBwP-ySSkw3AXitTDiF-aLIXIZZDtMJDHp318yY76s5UlxpAoL6DxP8l9pGyuOm9jsGAyTlxJS3f-Jy4skwbRlZ4eh93N',
      content: "Looks fantastic, Alex! Much more aligned with our new identity. I'll get this approved in the morning after the board sync.",
      createdAt: new Date('2026-07-20T06:56:00').toISOString(),
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
    },
    {
      id: 'act_2',
      workspaceId: 'ws_david',
      type: 'deliverable_approved',
      description: 'Sarah Miller approved invoice',
      metadata: { comment: 'Great work on the last sprint!' },
      createdAt: new Date('2026-07-20T02:41:00').toISOString(),
    },
    {
      id: 'act_3',
      workspaceId: 'ws_david',
      type: 'status_changed',
      description: 'New Project: Quantum Leap',
      createdAt: new Date('2026-07-19T14:20:00').toISOString(),
    },
    {
      id: 'act_4',
      workspaceId: 'ws_david',
      type: 'comment_added',
      description: 'Mike Ross requested a call',
      createdAt: new Date('2026-07-19T09:15:00').toISOString(),
    }
  ]
};

// Check if we are in placeholder mode
export const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') || 
  process.env.NEXT_PUBLIC_SUPABASE_URL === '';

const tableMap: Record<string, string> = {
  'workspaces': 'client_workspaces',
  'users': 'profiles'
};

function camelToSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function snakeToCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function keysToSnake(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => keysToSnake(v));
  } else if (obj !== null && obj !== undefined && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      // Don't convert metadata sub-keys or invoice items items list to snake case to protect inner structure
      if (key === 'metadata' || key === 'items') {
        result[key] = obj[key];
      } else {
        const snakeKey = camelToSnakeCase(key);
        result[snakeKey] = keysToSnake(obj[key]);
      }
      return result;
    }, {} as any);
  }
  return obj;
}

export function keysToCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => keysToCamel(v));
  } else if (obj !== null && obj !== undefined && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      if (key === 'metadata' || key === 'items') {
        result[key] = obj[key];
      } else {
        const camelKey = snakeToCamelCase(key);
        result[camelKey] = keysToCamel(obj[key]);
      }
      return result;
    }, {} as any);
  }
  return obj;
}

async function loadDB(): Promise<Database> {
  if (typeof window === 'undefined') {
    // Server-side: use file-based persistence via dynamic import
    const { readDB: fileRead } = await import('@/lib/db');
    return await fileRead() as unknown as Database;
  }
  return DEFAULT_DB;
}

async function saveDB(db: Database) {
  if (typeof window === 'undefined') {
    // Server-side: use file-based persistence via dynamic import
    const { writeDB: fileWrite } = await import('@/lib/db');
    await fileWrite(db as any);
    return;
  }
}

export async function create<T>(table: string, data: any): Promise<T> {
  if (isPlaceholder) {
    const db = await loadDB();
    const list = (db as any)[table];
    if (!list) throw new Error(`Table ${table} not found`);
    
    const newItem = { ...data };
    if (!newItem.id) {
      newItem.id = `${table.substring(0, 3)}_${Math.random().toString(36).substring(2, 9)}`;
    }
    if (!newItem.createdAt) {
      newItem.createdAt = new Date().toISOString();
    }
    
    list.push(newItem);
    await saveDB(db);
    return newItem as T;
  }

  const dbTable = tableMap[table] || table;
  let row = keysToSnake(data);
  
  // Set default uuid if not exists and table uses UUID (or let database handle it)
  // For safety and compatibility with existing frontend math random strings,
  // we let the db insert.
  const { data: inserted, error } = await supabase
    .from(dbTable)
    .insert(row)
    .select()
    .single();
    
  if (error) {
    console.error(`Error inserting into ${dbTable}:`, error);
    throw error;
  }
  
  return keysToCamel(inserted) as T;
}

export async function read<T>(table: string, id: string): Promise<T | null> {
  if (isPlaceholder) {
    const db = await loadDB();
    const list = (db as any)[table];
    if (!list) return null;
    const item = list.find((x: any) => x.id === id);
    return item ? (item as T) : null;
  }

  const dbTable = tableMap[table] || table;
  const { data, error } = await supabase
    .from(dbTable)
    .select('*')
    .eq('id', id)
    .maybeSingle();
    
  if (error) {
    console.error(`Error reading from ${dbTable}:`, error);
    throw error;
  }
  
  return data ? (keysToCamel(data) as T) : null;
}

export async function readAll<T>(table: string, userId?: string): Promise<T[]> {
  if (isPlaceholder) {
    const db = await loadDB();
    const list = (db as any)[table];
    if (!list) return [];
    
    if (userId) {
      if (table === 'clients') {
        return list.filter((x: any) => x.userId === userId) as T[];
      }
      if (table === 'invoices') {
        const clients = db.clients.filter(c => c.userId === userId).map(c => c.id);
        return list.filter((inv: any) => {
          const proj = db.projects.find(p => p.id === inv.projectId);
          return proj && clients.includes(proj.clientId);
        }) as T[];
      }
    }
    return list as T[];
  }

  const dbTable = tableMap[table] || table;
  let query = supabase.from(dbTable).select('*');
  
  if (userId) {
    if (dbTable === 'clients') {
      query = query.eq('user_id', userId);
    } else if (dbTable === 'invoices') {
      const { data: clients } = await supabase.from('clients').select('id').eq('user_id', userId);
      const clientIds = clients?.map(c => c.id) || [];
      if (clientIds.length === 0) return [];
      
      const { data: projects } = await supabase.from('projects').select('id').in('client_id', clientIds);
      const projectIds = projects?.map(p => p.id) || [];
      if (projectIds.length === 0) return [];
      
      query = query.in('project_id', projectIds);
    } else if (dbTable === 'profiles') {
      query = query.eq('id', userId);
    } else if (dbTable === 'activities') {
      query = query.eq('user_id', userId);
    }
  }
  
  const { data, error } = await query;
  if (error) {
    console.error(`Error reading all from ${dbTable}:`, error);
    throw error;
  }
  
  return keysToCamel(data || []) as T[];
}

export async function update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
  if (isPlaceholder) {
    const db = await loadDB();
    const list = (db as any)[table];
    if (!list) throw new Error(`Table ${table} not found`);
    
    const idx = list.findIndex((x: any) => x.id === id);
    if (idx === -1) throw new Error(`Record with id ${id} not found in ${table}`);
    
    list[idx] = { ...list[idx], ...data };
    await saveDB(db);
    return list[idx] as T;
  }

  const dbTable = tableMap[table] || table;
  let row = keysToSnake(data);
  
  const { data: updated, error } = await supabase
    .from(dbTable)
    .update(row)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error(`Error updating ${dbTable}:`, error);
    throw error;
  }
  
  return keysToCamel(updated) as T;
}

export async function deleteRow(table: string, id: string): Promise<void> {
  if (isPlaceholder) {
    const db = await loadDB();
    const list = (db as any)[table];
    if (!list) throw new Error(`Table ${table} not found`);
    
    const idx = list.findIndex((x: any) => x.id === id);
    if (idx !== -1) {
      list.splice(idx, 1);
      await saveDB(db);
    }
    return;
  }

  const dbTable = tableMap[table] || table;
  const { error } = await supabase
    .from(dbTable)
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error(`Error deleting from ${dbTable}:`, error);
    throw error;
  }
}

export { deleteRow as remove };
