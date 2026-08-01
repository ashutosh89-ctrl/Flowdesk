import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser Supabase client (cookies-based, @supabase/ssr).
 * Use in client components for all auth + data operations.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Kick off an OAuth sign-in (PKCE). Supabase redirects back to /auth/callback
 * with a ?code= that the server callback route exchanges for a session.
 */
export async function signInWithOAuth(provider: 'google' | 'github') {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const { data, error } = await createClient().auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
}
