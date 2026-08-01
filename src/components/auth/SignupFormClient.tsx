'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '../AppContext';
import { createClient, signInWithOAuth } from '../../lib/supabase/client';
import { Eye, EyeOff, Loader2, MailCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { validatePassword, validateEmail } from '@/lib/utils/validation';

export default function SignupFormClient() {
  const router = useRouter();
  const { addToast } = useApp();
  const supabase = createClient();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string; terms?: string }>({});
  const [strength, setStrength] = useState(0);

  // Compute password strength
  useEffect(() => {
    if (!password) {
      setStrength(0);
      return;
    }
    if (password.length < 8) {
      setStrength(1);
      return;
    }
    const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    if (hasMixedCase && hasNumbers && hasSpecialChar) {
      setStrength(3);
    } else if (hasMixedCase) {
      setStrength(2);
    } else {
      setStrength(1);
    }
  }, [password]);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name || name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.feedback.join('. ');
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!acceptTerms) {
      newErrors.terms = 'Please accept the terms to continue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            role: 'freelancer',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // If a session was returned (email confirmation disabled), the callback
      // route that creates the profile never fires — create it right away so
      // onboarding + middleware work.
      if (data?.session?.user) {
        const userId = data.session.user.id;
        await supabase.from('profiles').upsert({
          id: userId,
          email: data.session.user.email,
          name: name.trim(),
          role: 'freelancer',
          plan: 'free',
          onboarding_completed: false,
        });
        await supabase.from('business_settings').upsert({ user_id: userId });
        await supabase.from('notification_settings').upsert({ user_id: userId });
        await supabase.from('workspace_preferences').upsert({ user_id: userId });
        await supabase.from('subscriptions').upsert({ user_id: userId, plan: 'free', status: 'active' });

        addToast('Account created successfully!', 'success');
        router.push('/onboarding');
      } else {
        // Show "Check your email" screen — do not redirect.
        setCheckEmail(true);
      }
    } catch (err: any) {
      addToast(err.message || 'Registration failed', 'warning');
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
      addToast(err.message || `${provider} signup failed`, 'warning');
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const isFormValid = name.trim().length >= 2 &&
                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
                      password.length >= 8 &&
                      password === confirmPassword &&
                      acceptTerms;

  if (checkEmail) {
    return (
      <div className="space-y-6 text-center">
        <div className="text-center space-y-2">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600">
            <MailCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Check Your Email</h2>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          We've sent a verification link to <strong>{email}</strong>. Click the link in the email to verify your account, then sign in to continue.
        </p>

        <div className="pt-2 space-y-3">
          <Link
            href="/login"
            className="inline-block w-full bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-full px-6 py-2.5 text-sm transition-colors"
          >
            Go to Login
          </Link>
          <button
            type="button"
            onClick={() => setCheckEmail(false)}
            className="text-xs text-gray-500 hover:text-gray-900 font-semibold cursor-pointer"
          >
            Back to signup
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-5 ${shaking ? 'animate-shake' : ''}`}
    >
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-gray-900">⚡ Join FlowDesk</h2>
        <p className="text-sm text-gray-500">Create your client dashboard portal</p>
      </div>

      {/* Name Input */}
      <div className="relative">
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors({ ...errors, name: undefined });
          }}
          className="peer w-full h-12 px-4 pt-5 pb-1 bg-white/30 border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 transition-all text-sm"
          placeholder=" "
        />
        <label className="absolute left-4 top-3.5 text-gray-500 text-sm transition-all pointer-events-none peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-950 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">
          Full Name
        </label>
        {errors.name && (
          <p className="text-red-600 text-xs mt-1 ml-1">{errors.name}</p>
        )}
      </div>

      {/* Email Input */}
      <div className="relative">
        <input
          type="text"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors({ ...errors, email: undefined });
          }}
          className="peer w-full h-12 px-4 pt-5 pb-1 bg-white/30 border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 transition-all text-sm"
          placeholder=" "
        />
        <label className="absolute left-4 top-3.5 text-gray-500 text-sm transition-all pointer-events-none peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-950 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">
          Email Address
        </label>
        {errors.email && (
          <p className="text-red-600 text-xs mt-1 ml-1">{errors.email}</p>
        )}
      </div>

      {/* Password Input */}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors({ ...errors, password: undefined });
          }}
          className="peer w-full h-12 pl-4 pr-10 pt-5 pb-1 bg-white/30 border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 transition-all text-sm"
          placeholder=" "
        />
        <label className="absolute left-4 top-3.5 text-gray-500 text-sm transition-all pointer-events-none peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-950 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">
          Password
        </label>

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>

        {/* Strength Indicator */}
        <div className="flex gap-1 mt-2">
          {[1, 2, 3].map((segment) => (
            <div
              key={segment}
              className={`h-1 flex-1 rounded-full transition-colors ${
                strength >= segment
                  ? strength === 1 ? 'bg-red-500'
                  : strength === 2 ? 'bg-amber-500'
                  : 'bg-green-500'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-[11px] mt-1 text-gray-500 font-medium">
          {strength === 0 && 'Enter password'}
          {strength === 1 && 'Weak — add numbers and symbols'}
          {strength === 2 && 'Medium — good but could be stronger'}
          {strength === 3 && 'Strong — excellent'}
        </p>

        {errors.password && (
          <p className="text-red-600 text-xs mt-1 ml-1">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password Input */}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
          }}
          className="peer w-full h-12 pl-4 pr-10 pt-5 pb-1 bg-white/30 border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 transition-all text-sm"
          placeholder=" "
        />
        <label className="absolute left-4 top-3.5 text-gray-500 text-sm transition-all pointer-events-none peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-950 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">
          Confirm Password
        </label>
        {errors.confirmPassword && (
          <p className="text-red-600 text-xs mt-1 ml-1">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Terms Checkbox */}
      <label className="flex items-start gap-2.5 text-xs text-gray-600 font-medium cursor-pointer select-none">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => {
            setAcceptTerms(e.target.checked);
            if (errors.terms) setErrors({ ...errors, terms: undefined });
          }}
          className="mt-0.5 w-4 h-4 accent-gray-900 rounded cursor-pointer"
        />
        <span>
          I agree to the{' '}
          <span className="text-gray-900 font-bold">Terms of Service</span> and{' '}
          <span className="text-gray-900 font-bold">Privacy Policy</span>
        </span>
      </label>
      {errors.terms && (
        <p className="text-red-600 text-xs mt-1 ml-1">{errors.terms}</p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !isFormValid}
        className="relative flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white rounded-full h-12 w-full font-medium transition-colors cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          'Create Account'
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
      <div className="text-center text-xs text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="text-gray-950 font-bold hover:underline">
          Sign In
        </Link>
      </div>

    </form>
  );
}
