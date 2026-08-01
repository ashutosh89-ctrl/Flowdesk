'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { signInWithOAuthUser } from '@/lib/services/authService';
import { decodeJwtPayload } from '@/lib/utils/jwt';

// Guard against double-invocation (React StrictMode / HMR remounts).
let handled = false;

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (handled) return;
    handled = true;

    let cancelled = false;

    const handle = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const errorParam = params.get('error');
        const errorDescription = params.get('error_description');

        if (errorParam) {
          setError(errorDescription || errorParam);
          return;
        }

        let userId: string | undefined;
        let email = '';
        let name: string | undefined;
        let role: 'freelancer' | 'client' | undefined;

        // 1. Let supabase-js process the URL first. With detectSessionInUrl:true
        //    the client auto-exchanges a PKCE ?code= (and auto-captures an
        //    implicit #access_token) during initialization — getSession() awaits
        //    that init, so reading it first avoids double-exchanging the code.
        let session = (await supabase.auth.getSession()).data.session;

        // 2. Manual PKCE fallback — only used if auto-detection did NOT already
        //    exchange the code (single-use codes fail on a second exchange).
        if (!session && code) {
          const { data, error: exError } = await supabase.auth.exchangeCodeForSession(code);
          if (exError) throw exError;
          session = data.session;
        }

        // 3. Implicit-flow fallback — decode the #access_token fragment directly
        //    and persist the Supabase session so authenticated calls work.
        if (!session) {
          const hash = window.location.hash.substring(1);
          const hashParams = new URLSearchParams(hash);
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken) {
            const decoded = decodeJwtPayload(accessToken);
            userId = decoded.sub;
            email = decoded.email || '';
            name = decoded.user_metadata?.full_name || decoded.user_metadata?.name || email.split('@')[0];
            role = decoded.user_metadata?.role;

            if (refreshToken) {
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              if (sessionError) console.warn('Session persistence warning:', sessionError);
            }
          } else {
            // 3b. Final check — detectSessionInUrl may have captured the session.
            const { data: sessionData } = await supabase.auth.getSession();
            session = sessionData.session;
          }
        }

        // Derive user info from an established session if we have one.
        if (session?.user) {
          userId = userId || session.user.id;
          email = email || session.user.email || '';
          name = name || session.user.user_metadata?.full_name || session.user.user_metadata?.name;
          role = role || session.user.user_metadata?.role;
        }

        // signInWithOAuthUser sanitizes invalid role values (e.g. 'authenticated'
        // from provider metadata) and falls back to email-based inference.

        if (!email) {
          throw new Error('No email returned from OAuth');
        }

        // Establish the app session cookie server-side (real SESSION_SECRET).
        const result = await signInWithOAuthUser(email, name, role, userId);
        if (cancelled) return;

        const targetUrl = result.user.onboarded === false
          ? '/onboarding'
          : result.user.role === 'client'
            ? '/client/workspace'
            : '/freelancer/dashboard';

        window.location.href = targetUrl;
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        handled = false; // allow a retry (e.g. HMR/remount) after a failure
        if (!cancelled) setError(err.message || 'OAuth sign in failed');
      }
    };

    handle();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-[#B8B5B0] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl mx-auto">⚠️</div>
          <h2 className="font-bold text-gray-900">Sign in failed</h2>
          <p className="text-sm text-gray-500">{error}</p>
          <a
            href="/login"
            className="inline-block px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#B8B5B0] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-2xl mx-auto animate-pulse">⚡</div>
        <p className="text-sm font-semibold text-gray-700">Completing your sign in…</p>
      </div>
    </div>
  );
}
