-- ============================================================
-- FlowDesk Authentication Schema (Phase 1)
-- Run this in the Supabase SQL editor.
-- ============================================================

-- 1. PROFILES TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('freelancer', 'client')),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'studio')),
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. BUSINESS SETTINGS (freelancer only)
CREATE TABLE IF NOT EXISTS business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT,
  tagline TEXT,
  logo_url TEXT,
  portfolio_url TEXT,
  business_email TEXT,
  business_phone TEXT,
  address TEXT,
  default_currency TEXT DEFAULT 'INR',
  default_tax_name TEXT DEFAULT 'GST',
  default_tax_rate DECIMAL(5,2) DEFAULT 18,
  invoice_prefix TEXT DEFAULT 'INV-',
  email_signature TEXT,
  bank_name TEXT,
  account_number TEXT,
  bank_code TEXT,
  branch TEXT,
  upi_id TEXT,
  terms_and_conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. NOTIFICATION SETTINGS
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_client_accepted BOOLEAN DEFAULT true,
  email_document_uploaded BOOLEAN DEFAULT true,
  email_deliverable_approved BOOLEAN DEFAULT true,
  email_invoice_viewed BOOLEAN DEFAULT true,
  email_invoice_paid BOOLEAN DEFAULT true,
  in_app_client_accepted BOOLEAN DEFAULT true,
  in_app_document_uploaded BOOLEAN DEFAULT true,
  in_app_deliverable_approved BOOLEAN DEFAULT true,
  in_app_invoice_viewed BOOLEAN DEFAULT true,
  in_app_invoice_paid BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 4. WORKSPACE PREFERENCES
CREATE TABLE IF NOT EXISTS workspace_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  landing_page TEXT DEFAULT 'dashboard',
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  time_format TEXT DEFAULT '12h',
  week_starts_on TEXT DEFAULT 'monday',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 5. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  payment_method TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 6. CLIENT INVITES
-- NOTE: client_record_id is an app-level extension linking the invite to the
-- freelancer's clients record (used by the existing client-list UI).
CREATE TABLE IF NOT EXISTS client_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_record_id TEXT,
  client_email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  client_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_invites ENABLE ROW LEVEL SECURITY;

-- Profiles: Users read/update own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Business settings: Freelancer owns their settings
CREATE POLICY "Users can read own business settings" ON business_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own business settings" ON business_settings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own business settings" ON business_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notification settings
CREATE POLICY "Users can read own notification settings" ON notification_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notification settings" ON notification_settings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notification settings" ON notification_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Workspace preferences
CREATE POLICY "Users can read own preferences" ON workspace_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON workspace_preferences
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON workspace_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions
CREATE POLICY "Users can read own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Client invites: Freelancer can read their invites, client can read invites to their email
CREATE POLICY "Freelancers can read their invites" ON client_invites
  FOR SELECT USING (auth.uid() = freelancer_id);
CREATE POLICY "Freelancers can create invites" ON client_invites
  FOR INSERT WITH CHECK (auth.uid() = freelancer_id);
CREATE POLICY "Freelancers can update their invites" ON client_invites
  FOR UPDATE USING (auth.uid() = freelancer_id);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('logos', 'logos', true),
  ('documents', 'documents', true),
  ('deliverables', 'deliverables', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can read avatars" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can upload logos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'logos');
CREATE POLICY "Authenticated users can read logos" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'logos');
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Authenticated users can read documents" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'documents');
CREATE POLICY "Authenticated users can upload deliverables" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'deliverables');
CREATE POLICY "Authenticated users can read deliverables" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'deliverables');
