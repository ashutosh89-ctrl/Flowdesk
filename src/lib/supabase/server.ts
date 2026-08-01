import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server Supabase client bound to the request's cookie store.
 * Use in server components, layouts, and route handlers.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component — safe to ignore (middleware refreshes).
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Called from a Server Component — safe to ignore.
          }
        },
      },
    }
  );
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'freelancer' | 'client';
  plan: 'free' | 'pro' | 'studio';
  onboarded: boolean;
  createdAt: string;
}

/**
 * Resolve the current authenticated user (with profile role/onboarding state).
 * Returns null when there is no valid session.
 */
export async function getSession(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, name, avatar_url, role, plan, onboarding_completed, created_at')
    .eq('id', user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: profile?.email ?? user.email ?? '',
    name: profile?.name ?? '',
    avatar: profile?.avatar_url ?? undefined,
    role: (profile?.role ?? 'freelancer') as 'freelancer' | 'client',
    plan: (profile?.plan ?? 'free') as 'free' | 'pro' | 'studio',
    onboarded: profile?.onboarding_completed ?? false,
    createdAt: profile?.created_at ?? new Date().toISOString(),
  };
}
