-- ============================================================
-- FlowDesk Business Schema (Phase 1b)
-- Run this AFTER 0001_auth_schema.sql in the Supabase SQL editor.
--
-- Creates the data tables the app queries through dataService:
-- clients, client_workspaces, projects, documents, deliverables,
-- invoices, invoice_receipts, invoice_reminders, templates,
-- comments, activities — all with RLS.
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

-- CLIENTS: owned by a freelancer (user_id); the client themselves
-- can read their own record via the email match.
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  is_pinned BOOLEAN DEFAULT false,
  notes TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS client_workspaces (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'planning',
  progress NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning',
  due_date TEXT,
  progress NUMERIC DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES client_workspaces(id) ON DELETE CASCADE,
  client_id TEXT,
  project_id TEXT,
  name TEXT NOT NULL,
  title TEXT,
  type TEXT,
  file_type TEXT,
  file_name TEXT,
  file_size TEXT,
  status TEXT DEFAULT 'pending',
  reject_reason TEXT,
  uploaded_by TEXT,
  file_url TEXT,
  uploaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deliverables (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  client_id TEXT,
  name TEXT NOT NULL,
  title TEXT,
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  version TEXT,
  status TEXT DEFAULT 'pending_approval',
  revision_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  client_id TEXT,
  client_email_snapshot TEXT,
  invoice_number TEXT,
  title TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  tax_name TEXT,
  tax_rate NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  workflow_status TEXT DEFAULT 'draft',
  payment_status TEXT DEFAULT 'pending',
  payment_method_type TEXT,
  notes TEXT,
  issue_date TEXT,
  due_date TEXT,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  reminder_count INTEGER DEFAULT 0,
  status TEXT,
  number TEXT,
  razorpay_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_receipts (
  id TEXT PRIMARY KEY,
  receipt_number TEXT,
  invoice_id TEXT REFERENCES invoices(id) ON DELETE CASCADE,
  payment_id TEXT CONSTRAINT invoice_receipts_payment_id_key UNIQUE,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  payment_method TEXT,
  amount_paid NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  paid_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS invoice_activities (
  id TEXT PRIMARY KEY,
  invoice_id TEXT REFERENCES invoices(id) ON DELETE CASCADE,
  activity_type TEXT,
  description TEXT,
  actor TEXT,
  field_changes JSONB,
  timestamp TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS invoice_reminders (
  id TEXT PRIMARY KEY,
  invoice_id TEXT REFERENCES invoices(id) ON DELETE CASCADE,
  reminder_number INTEGER DEFAULT 1,
  sent_at TIMESTAMPTZ,
  method TEXT DEFAULT 'email',
  status TEXT DEFAULT 'delivered'
);

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT,
  name TEXT,
  content TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  workspace_id TEXT,
  project_id TEXT,
  deliverable_id TEXT,
  client_id TEXT,
  author_id UUID,
  author_role TEXT,
  user_id TEXT,
  user_name TEXT,
  user_avatar TEXT,
  content TEXT NOT NULL,
  parent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  workspace_id TEXT,
  type TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- ---------- CLIENTS ----------
-- Freelancer: full control over their own clients
CREATE POLICY "Freelancers manage their clients" ON clients
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Client: read their own record (matched by email)
CREATE POLICY "Clients can read their own record" ON clients
  FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- ---------- CLIENT WORKSPACES ----------
CREATE POLICY "Freelancers manage their workspaces" ON client_workspaces
  FOR ALL USING (
    EXISTS (SELECT 1 FROM clients c WHERE c.id = client_id AND c.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM clients c WHERE c.id = client_id AND c.user_id = auth.uid())
  );
CREATE POLICY "Clients can read their workspaces" ON client_workspaces
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM clients c WHERE c.id = client_id AND c.email = auth.jwt() ->> 'email')
  );

-- ---------- PROJECTS ----------
CREATE POLICY "Freelancers manage their projects" ON projects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM clients c WHERE c.id = client_id AND c.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM clients c WHERE c.id = client_id AND c.user_id = auth.uid())
  );
CREATE POLICY "Clients can read their projects" ON projects
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM clients c WHERE c.id = client_id AND c.email = auth.jwt() ->> 'email')
  );

-- ---------- DOCUMENTS ----------
CREATE POLICY "Freelancers manage their documents" ON documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM client_workspaces w
      JOIN clients c ON c.id = w.client_id
      WHERE w.id = workspace_id AND c.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_workspaces w
      JOIN clients c ON c.id = w.client_id
      WHERE w.id = workspace_id AND c.user_id = auth.uid()
    )
  );
CREATE POLICY "Clients can manage their documents" ON documents
  FOR SELECT, INSERT, UPDATE USING (
    EXISTS (
      SELECT 1 FROM client_workspaces w
      JOIN clients c ON c.id = w.client_id
      WHERE w.id = workspace_id AND c.email = auth.jwt() ->> 'email'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_workspaces w
      JOIN clients c ON c.id = w.client_id
      WHERE w.id = workspace_id AND c.email = auth.jwt() ->> 'email'
    )
  );

-- ---------- DELIVERABLES ----------
CREATE POLICY "Freelancers manage their deliverables" ON deliverables
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN clients c ON c.id = p.client_id
      WHERE p.id = project_id AND c.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN clients c ON c.id = p.client_id
      WHERE p.id = project_id AND c.user_id = auth.uid()
    )
  );
CREATE POLICY "Clients can manage their deliverables" ON deliverables
  FOR SELECT, INSERT, UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN clients c ON c.id = p.client_id
      WHERE p.id = project_id AND c.email = auth.jwt() ->> 'email'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN clients c ON c.id = p.client_id
      WHERE p.id = project_id AND c.email = auth.jwt() ->> 'email'
    )
  );

-- ---------- INVOICES ----------
CREATE POLICY "Freelancers manage their invoices" ON invoices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN clients c ON c.id = p.client_id
      WHERE p.id = project_id AND c.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN clients c ON c.id = p.client_id
      WHERE p.id = project_id AND c.user_id = auth.uid()
    )
  );
CREATE POLICY "Clients can read their invoices" ON invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN clients c ON c.id = p.client_id
      WHERE p.id = project_id AND c.email = auth.jwt() ->> 'email'
    )
  );
-- Clients mark invoices as viewed/paid from the client portal (their session)
CREATE POLICY "Clients can update their invoices" ON invoices
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN clients c ON c.id = p.client_id
      WHERE p.id = project_id AND c.email = auth.jwt() ->> 'email'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN clients c ON c.id = p.client_id
      WHERE p.id = project_id AND c.email = auth.jwt() ->> 'email'
    )
  );

-- ---------- INVOICE RECEIPTS ----------
CREATE POLICY "Freelancers manage their receipts" ON invoice_receipts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM invoices i
      JOIN projects p ON p.id = i.project_id
      JOIN clients c ON c.id = p.client_id
      WHERE i.id = invoice_id AND c.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices i
      JOIN projects p ON p.id = i.project_id
      JOIN clients c ON c.id = p.client_id
      WHERE i.id = invoice_id AND c.user_id = auth.uid()
    )
  );
CREATE POLICY "Clients can read their receipts" ON invoice_receipts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices i
      JOIN projects p ON p.id = i.project_id
      JOIN clients c ON c.id = p.client_id
      WHERE i.id = invoice_id AND c.email = auth.jwt() ->> 'email'
    )
  );
-- Clients generate receipts when paying online (Razorpay runs in their session)
CREATE POLICY "Clients can add their receipts" ON invoice_receipts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices i
      JOIN projects p ON p.id = i.project_id
      JOIN clients c ON c.id = p.client_id
      WHERE i.id = invoice_id AND c.email = auth.jwt() ->> 'email'
    )
  );

-- ---------- INVOICE REMINDERS ----------
CREATE POLICY "Freelancers manage their reminders" ON invoice_reminders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM invoices i
      JOIN projects p ON p.id = i.project_id
      JOIN clients c ON c.id = p.client_id
      WHERE i.id = invoice_id AND c.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices i
      JOIN projects p ON p.id = i.project_id
      JOIN clients c ON c.id = p.client_id
      WHERE i.id = invoice_id AND c.user_id = auth.uid()
    )
  );

-- ---------- TEMPLATES ----------
CREATE POLICY "Users manage their templates" ON templates
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------- INVOICE ACTIVITIES ----------
CREATE POLICY "Freelancers manage invoice activities" ON invoice_activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM invoices i
      JOIN projects p ON p.id = i.project_id
      JOIN clients c ON c.id = p.client_id
      WHERE i.id = invoice_id AND c.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices i
      JOIN projects p ON p.id = i.project_id
      JOIN clients c ON c.id = p.client_id
      WHERE i.id = invoice_id AND c.user_id = auth.uid()
    )
  );
CREATE POLICY "Clients can read invoice activities" ON invoice_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices i
      JOIN projects p ON p.id = i.project_id
      JOIN clients c ON c.id = p.client_id
      WHERE i.id = invoice_id AND c.email = auth.jwt() ->> 'email'
    )
  );
-- Clients log payment/view activity when paying/viewing from the portal
CREATE POLICY "Clients can add invoice activities" ON invoice_activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices i
      JOIN projects p ON p.id = i.project_id
      JOIN clients c ON c.id = p.client_id
      WHERE i.id = invoice_id AND c.email = auth.jwt() ->> 'email'
    )
  );

-- ---------- COMMENTS ----------
-- Comments may be workspace-scoped OR project-scoped (addComment stamps
-- project_id only), so ownership must resolve through either chain.
CREATE POLICY "Freelancers manage their comments" ON comments
  FOR ALL USING (
    (workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM client_workspaces w
      JOIN clients c ON c.id = w.client_id
      WHERE w.id = workspace_id AND c.user_id = auth.uid()
    ))
    OR
    (project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM projects p
      JOIN clients c ON c.id = p.client_id
      WHERE p.id = project_id AND c.user_id = auth.uid()
    ))
  ) WITH CHECK (
    (workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM client_workspaces w
      JOIN clients c ON c.id = w.client_id
      WHERE w.id = workspace_id AND c.user_id = auth.uid()
    ))
    OR
    (project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM projects p
      JOIN clients c ON c.id = p.client_id
      WHERE p.id = project_id AND c.user_id = auth.uid()
    ))
  );
CREATE POLICY "Clients can manage their comments" ON comments
  FOR ALL USING (
    (workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM client_workspaces w
      JOIN clients c ON c.id = w.client_id
      WHERE w.id = workspace_id AND c.email = auth.jwt() ->> 'email'
    ))
    OR
    (project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM projects p
      JOIN clients c ON c.id = p.client_id
      WHERE p.id = project_id AND c.email = auth.jwt() ->> 'email'
    ))
  ) WITH CHECK (
    (workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM client_workspaces w
      JOIN clients c ON c.id = w.client_id
      WHERE w.id = workspace_id AND c.email = auth.jwt() ->> 'email'
    ))
    OR
    (project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM projects p
      JOIN clients c ON c.id = p.client_id
      WHERE p.id = project_id AND c.email = auth.jwt() ->> 'email'
    ))
  );

-- ---------- ACTIVITIES ----------
-- Activities are workspace-scoped; both roles can read and append to their
-- own workspaces (logActivity runs from client-side service calls).
CREATE POLICY "Freelancers read their activities" ON activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_workspaces w
      JOIN clients c ON c.id = w.client_id
      WHERE w.id = workspace_id AND c.user_id = auth.uid()
    )
  );
CREATE POLICY "Freelancers can add activities" ON activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_workspaces w
      JOIN clients c ON c.id = w.client_id
      WHERE w.id = workspace_id AND c.user_id = auth.uid()
    )
  );
CREATE POLICY "Clients read their activities" ON activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_workspaces w
      JOIN clients c ON c.id = w.client_id
      WHERE w.id = workspace_id AND c.email = auth.jwt() ->> 'email'
    )
  );
CREATE POLICY "Clients can add activities" ON activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_workspaces w
      JOIN clients c ON c.id = w.client_id
      WHERE w.id = workspace_id AND c.email = auth.jwt() ->> 'email'
    )
  );

-- ============================================================
-- IDEMPOTENT HARDENING (safe to re-run on already-applied DBs)
-- ============================================================
-- Unique payment_id prevents duplicate receipts when both the client-side
-- Razorpay handler and the webhook process the same payment.
-- NOTE: if this migration is re-run against a DB that already contains
-- duplicate payment_id rows (possible only from the pre-idempotency-guard
-- era), the ALTER below will fail — dedupe invoice_receipts first.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'invoice_receipts_payment_id_key'
      AND conrelid = 'invoice_receipts'::regclass
      AND contype = 'u'
  ) THEN
    ALTER TABLE invoice_receipts ADD CONSTRAINT invoice_receipts_payment_id_key UNIQUE (payment_id);
  END IF;
END $$;
