import { createClient as createSupabaseJsClient, SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

let dataClient: SupabaseClient | null = null;

/**
 * Lazy singleton client for the data layer (dataService + document/deliverable
 * services). On the server it uses the plain supabase-js client (no cookies —
 * queries gracefully fall back to seed/empty as before). In the browser it uses
 * the @supabase/ssr browser client so it shares the cookie-based session with
 * the auth flows (no localStorage session storage).
 */
export function getDataClient(): SupabaseClient {
  if (dataClient) return dataClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  dataClient =
    typeof window === 'undefined'
      ? createSupabaseJsClient(url, anonKey)
      : createBrowserClient(url, anonKey);

  return dataClient;
}
