'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '../AppContext';
import { createClient, signInWithOAuth } from '../../lib/supabase/client';
import { Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginSchema } from '@/lib/validation/schemas';

const DEMO_ACCOUNTS = {
  freelancer: { email: 'demo-freelancer@flowdesk.io', password: 'demo-password-123' },
  client: { email: 'demo-client@flowdesk.io', password: 'demo-password-123' },
};

export default function LoginFormClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useApp();
  const supabase = createClient();

  // Optional deep-link target set by middleware (?redirect=/freelancer/dashboard).
  // Sanitized the same way as the auth callback route to block open redirects.
  const rawRedirect = searchParams.get('redirect');
  const redirectPath =
    rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
      ? rawRedirect
      : null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const resolveRedirect = (profile: { role: string; onboarding_completed?: boolean }) => {
    if (!profile.onboarding_completed) return '/onboarding';
    return profile.role === 'client' ? '/client/workspace' : '/freelancer/dashboard';
  };

  const redirectAfterLogin = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, onboarding_completed, name')
      .eq('id', userId)
      .maybeSingle();

    // Honor the middleware-set ?redirect= deep link when present (it is
    // sanitized above); middleware re-enforces role protection on the target.
    const targetUrl = redirectPath || resolveRedirect(profile || { role: 'freelancer', onboarding_completed: false });
    router.push(targetUrl);
    setTimeout(() => {
      if (window.location.pathname.includes('/login')) {
        window.location.href = targetUrl;
      }
    }, 500);
  };

  const validate = () => {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const newErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err: { path: (string | number)[]; message: string }) => {
        const field = err.path[0] as 'email' | 'password';
        if (field) newErrors[field] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user returned');

      addToast(`Welcome back! Redirecting...`, 'success');
      await redirectAfterLogin(data.user.id);
    } catch (err: any) {
      addToast(err.message || 'Invalid email or password', 'warning');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'freelancer' | 'client') => {
    const demo = DEMO_ACCOUNTS[role];
    setEmail(demo.email);
    setPassword(demo.password);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: demo.email,
        password: demo.password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user returned');

      addToast(`Signed in as ${role === 'freelancer' ? 'Demo Freelancer' : 'Demo Client'}!`, 'success');
      await redirectAfterLogin(data.user.id);
    } catch (err: any) {
      addToast(err.message || 'Demo login failed. Run `npm run migrate` to seed demo accounts.', 'warning');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      setLoading(true);
      await signInWithOAuth(provider);
    } catch (err: any) {
      addToast(err.message || `${provider} login failed`, 'warning');
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-5 ${shaking ? 'animate-shake' : ''}`}
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center text-white font-black text-sm shadow-sm">
            ⚡
          </div>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">FlowDesk Login</h2>
        <p className="text-sm text-gray-500 mt-1 font-medium">Sign in to your client control panel</p>
      </div>

      {/* Quick Demo Access Buttons */}
      <div className="p-4 bg-gray-50/60 border border-gray-200/60 rounded-2xl space-y-3">
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Quick Demo 1-Click Access
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleDemoLogin('freelancer')}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-white hover:bg-gray-50 active:scale-[0.98] border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 transition-all shadow-sm hover:shadow-md cursor-pointer text-center disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100"
          >
            👨‍💻 Freelancer
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('client')}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-white hover:bg-gray-50 active:scale-[0.98] border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 transition-all shadow-sm hover:shadow-md cursor-pointer text-center disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100"
          >
            🏢 Client
          </button>
        </div>
      </div>

      {/* Email Input */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Email Address</label>
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            onBlur={() => {
              if (email && !errors.email) {
                const result = loginSchema.safeParse({ email, password: password || 'dummy' });
                if (!result.success) {
                  const emailErr = result.error.errors.find(e => e.path[0] === 'email');
                  if (emailErr) setErrors(prev => ({ ...prev, email: emailErr.message }));
                }
              }
            }}
            className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-gray-400"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="text-red-600 text-xs mt-1 ml-1 font-medium">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Password Input */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            className="w-full h-12 pl-4 pr-11 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-gray-400"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          {errors.password && (
            <p className="text-red-600 text-xs mt-1 ml-1 font-medium">{errors.password}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="relative flex items-center justify-center bg-gray-900 hover:bg-gray-800 active:scale-[0.99] text-white rounded-xl h-12 w-full font-semibold text-sm transition-all cursor-pointer disabled:opacity-50 disabled:active:scale-100 shadow-sm hover:shadow-md"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          'Sign In'
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">or continue with</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Social Login Options - Positioned Below Form */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleSocialLogin('google')}
          disabled={loading}
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Google
        </button>
        <button
          type="button"
          onClick={() => handleSocialLogin('github')}
          disabled={loading}
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          GitHub
        </button>
      </div>

      {/* Footer Navigation */}
      <div className="space-y-3 pt-1 text-center">
        <p className="text-sm text-gray-500 font-medium">
          Don't have an account?{' '}
          <Link href="/signup" className="text-gray-900 font-bold hover:underline">
            Sign Up
          </Link>
        </p>
        <p className="text-sm text-gray-500 font-medium">
          <Link href="/forgot-password" className="text-gray-900 font-bold hover:underline">
            Forgot Password?
          </Link>
        </p>
      </div>

    </form>
  );
}
