import { createClient } from '@supabase/supabase-js';

/**
 * Service-role admin client. Bypasses RLS — server-only.
 * Never import this into client components or route handlers that expose it.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
