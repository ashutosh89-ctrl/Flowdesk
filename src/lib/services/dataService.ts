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
  users: [],
  clients: [],
  workspaces: [],
  projects: [],
  documents: [],
  deliverables: [],
  invoices: [],
  comments: [],
  activities: []
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
  if (!isPlaceholder) {
    try {
      const dbTable = tableMap[table] || table;
      const { data, error } = await supabase
        .from(dbTable)
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      if (!error && data) {
        return keysToCamel(data) as T;
      }
    } catch (error) {
      console.warn(`Fallback to seed for reading ${table}:`, error);
    }
  }

  const db = await loadDB();
  const list = (db as any)[table];
  if (!list) return null;
  const item = list.find((x: any) => x.id === id);
  return item ? (item as T) : null;
}

export async function readAll<T>(table: string, userId?: string): Promise<T[]> {
  if (!isPlaceholder) {
    try {
      const dbTable = tableMap[table] || table;
      let query = supabase.from(dbTable).select('*');
      
      if (userId) {
        if (dbTable === 'clients') {
          query = query.eq('user_id', userId);
        } else if (dbTable === 'invoices') {
          const { data: clients } = await supabase.from('clients').select('id').eq('user_id', userId);
          const clientIds = clients?.map(c => c.id) || [];
          if (clientIds.length > 0) {
            const { data: projects } = await supabase.from('projects').select('id').in('client_id', clientIds);
            const projectIds = projects?.map(p => p.id) || [];
            if (projectIds.length > 0) {
              query = query.in('project_id', projectIds);
            }
          }
        } else if (dbTable === 'profiles') {
          query = query.eq('id', userId);
        } else if (dbTable === 'activities') {
          query = query.eq('user_id', userId);
        }
      }
      
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return keysToCamel(data) as T[];
      }
    } catch (error) {
      console.warn(`Fallback to seed for readAll ${table}:`, error);
    }
  }

  const db = await loadDB();
  const list = (db as any)[table];
  if (!list) return [];
  
  if (userId) {
    if (table === 'clients') {
      return list.filter((x: any) => x.userId === userId) as T[];
    }
    if (table === 'projects') {
      const userClientIds = db.clients.filter(c => c.userId === userId).map(c => c.id);
      return list.filter((p: any) => userClientIds.includes(p.clientId)) as T[];
    }
    if (table === 'invoices') {
      const userClientIds = db.clients.filter(c => c.userId === userId).map(c => c.id);
      return list.filter((inv: any) => {
        const proj = db.projects.find(p => p.id === inv.projectId);
        return proj && userClientIds.includes(proj.clientId);
      }) as T[];
    }
    if (table === 'workspaces') {
      const userClientIds = db.clients.filter(c => c.userId === userId).map(c => c.id);
      return list.filter((ws: any) => userClientIds.includes(ws.clientId)) as T[];
    }
    if (table === 'activities') {
      const userClientIds = db.clients.filter(c => c.userId === userId).map(c => c.id);
      const userWorkspaceIds = db.workspaces.filter(w => userClientIds.includes(w.clientId)).map(w => w.id);
      return list.filter((act: any) => act.userId === userId || userWorkspaceIds.includes(act.workspaceId)) as T[];
    }
    if (table === 'documents') {
      const userClientIds = db.clients.filter(c => c.userId === userId).map(c => c.id);
      const userWorkspaceIds = db.workspaces.filter(w => userClientIds.includes(w.clientId)).map(w => w.id);
      return list.filter((doc: any) => userWorkspaceIds.includes(doc.workspaceId)) as T[];
    }
    if (table === 'deliverables') {
      const userClientIds = db.clients.filter(c => c.userId === userId).map(c => c.id);
      const userProjectIds = db.projects.filter(p => userClientIds.includes(p.clientId)).map(p => p.id);
      return list.filter((del: any) => userProjectIds.includes(del.projectId)) as T[];
    }
  }
  return list as T[];

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
