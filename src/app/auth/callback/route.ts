import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Auth callback — handles email verification links and OAuth redirects.
 * Exchanges the ?code= for a session, creates the profile + default settings
 * rows when they don't exist yet, then redirects to /onboarding.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  // Only allow internal paths — blocks protocol-relative open redirects (//evil.com)
  const rawNext = searchParams.get('next') ?? '/onboarding';
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/onboarding';

  if (code) {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        // Create profile
        await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || '',
          role: user.user_metadata?.role || 'freelancer',
          onboarding_completed: false,
        });

        // Create default settings rows
        await supabase.from('business_settings').insert({ user_id: user.id });
        await supabase.from('notification_settings').insert({ user_id: user.id });
        await supabase.from('workspace_preferences').insert({ user_id: user.id });
        await supabase.from('subscriptions').insert({ user_id: user.id, plan: 'free', status: 'active' });
      }

      // Redirect to onboarding (or the requested next page)
      return NextResponse.redirect(`${origin}${next.startsWith('/') ? next : '/onboarding'}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
