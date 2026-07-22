import { createClient } from '@supabase/supabase-js';

// Retrieve environment variables safely with placeholders to avoid crash on startup
const supabaseUrl = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) || 'https://placeholder.supabase.co';
const supabaseAnonKey = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) || 'placeholder-anon-key';
const supabaseServiceKey = (typeof process !== 'undefined' && process.env?.SUPABASE_SERVICE_ROLE_KEY) || 'placeholder-service-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side admin client (for service operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
