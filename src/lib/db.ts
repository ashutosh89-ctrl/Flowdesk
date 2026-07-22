// Dynamic fs/path imports to avoid errors on the client side

interface Database {
  users: any[];
  clients: any[];
  workspaces: any[];
  projects: any[];
  documents: any[];
  deliverables: any[];
  invoices: any[];
  comments: any[];
  activities: any[];
  invitations: any[];
  settings: any[];
}

const defaultDB: Database = {
  users: [],
  clients: [],
  workspaces: [],
  projects: [],
  documents: [],
  deliverables: [],
  invoices: [],
  comments: [],
  activities: [],
  invitations: [],
  settings: []
};

function seedDatabase(): Database {
  const db = JSON.parse(JSON.stringify(defaultDB));

  db.users.push({
    id: 'user-1',
    email: 'freelancer@flowdesk.app',
    name: 'Demo Freelancer',
    role: 'freelancer',
    plan: 'pro',
    avatar: null,
    onboarded: true,
    createdAt: new Date().toISOString()
  });

  db.clients.push(
    {
      id: 'client-1',
      userId: 'user-1',
      name: 'Acme Corp',
      company: 'Acme Corporation',
      email: 'client@acme.com',
      phone: '+1-555-0100',
      status: 'active',
      lifecycle: 'active',
      avatar: null,
      inviteToken: null,
      inviteStatus: null,
      createdAt: new Date().toISOString()
    },
    {
      id: 'client-2',
      userId: 'user-1',
      name: 'Beta LLC',
      company: 'Beta Solutions',
      email: 'client@beta.com',
      phone: null,
      status: 'onboarding',
      lifecycle: 'onboarding',
      avatar: null,
      inviteToken: 'invite-token-123',
      inviteStatus: 'pending',
      createdAt: new Date().toISOString()
    }
  );

  db.projects.push({
    id: 'project-1',
    clientId: 'client-1',
    name: 'Website Redesign',
    description: 'Complete overhaul of corporate website',
    status: 'in_progress',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 40,
    milestones: [
      { id: 'm1', title: 'Discovery', completed: true },
      { id: 'm2', title: 'Wireframes', completed: true },
      { id: 'm3', title: 'Design', completed: false },
      { id: 'm4', title: 'Development', completed: false },
      { id: 'm5', title: 'Launch', completed: false }
    ],
    createdAt: new Date().toISOString()
  });

  db.invoices.push({
    id: 'invoice-1',
    projectId: 'project-1',
    number: 'INV-001',
    items: [
      { description: 'Design Phase', quantity: 1, rate: 5000, amount: 5000 }
    ],
    subtotal: 5000,
    tax: 900,
    total: 5900,
    status: 'pending',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  });

  return db;
}

async function getFs() {
  return await import('fs');
}

async function getPath() {
  return await import('path');
}

export async function readDB(): Promise<Database> {
  const fs = await getFs();
  const path = await getPath();
  const dataDir = path.join(process.cwd(), 'data');
  const dbPath = path.join(dataDir, 'db.json');
  
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  
  if (!fs.existsSync(dbPath)) {
    const seeded = seedDatabase();
    fs.writeFileSync(dbPath, JSON.stringify(seeded, null, 2));
    return seeded;
  }
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  } catch {
    const seeded = seedDatabase();
    fs.writeFileSync(dbPath, JSON.stringify(seeded, null, 2));
    return seeded;
  }
}

export async function writeDB(data: Database) {
  const fs = await getFs();
  const path = await getPath();
  const dataDir = path.join(process.cwd(), 'data');
  const dbPath = path.join(dataDir, 'db.json');
  
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}
