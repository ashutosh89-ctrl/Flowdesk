'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/AppContext';
import { getInvitationByToken, acceptInvitation, Invitation } from '@/lib/services/invitationService';
import { createClient } from '@/lib/supabase/client';
import GlassAuthCard from '@/components/auth/GlassAuthCard';
import { Eye, EyeOff, Lock, Loader2 } from 'lucide-react';

export default function InviteClient({ token }: { token: string }) {
  const router = useRouter();
  const { addToast, setUser } = useApp();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingUp, setSigningUp] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const inv = await getInvitationByToken(token);
        if (!inv) {
          setError('This invitation link is invalid.');
        } else if (inv.status !== 'pending') {
          setError(`This invitation has already been ${inv.status}.`);
        } else if (new Date(inv.expiresAt).getTime() < Date.now()) {
          setError('This invitation link has expired.');
        } else {
          setInvitation(inv);
        }
      } catch (e) {
        setError('Failed to fetch invitation.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvite();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation) return;
    if (!name.trim()) {
      addToast('Please enter your name', 'warning');
      return;
    }
    if (password.length < 8) {
      addToast('Password must be at least 8 characters long', 'warning');
      return;
    }

    setSigningUp(true);
    try {
      // Server-side (admin): creates the auth user, client profile, links the
      // client record, and marks the invite accepted.
      await acceptInvitation(token, name.trim(), password);

      // Sign the newly created client in and land them in the portal.
      const supabase = createClient();
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: invitation.email,
        password,
      });

      if (signInError) {
        addToast('Account created! Please sign in to continue.', 'success');
        router.replace('/login');
        return;
      }

      if (signInData.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, email, name, avatar_url, role, plan, onboarding_completed, created_at')
          .eq('id', signInData.user.id)
          .maybeSingle();
        setUser({
          id: signInData.user.id,
          email: profile?.email ?? signInData.user.email ?? '',
          name: profile?.name ?? name,
          avatar: profile?.avatar_url ?? undefined,
          role: 'client',
          plan: profile?.plan ?? 'free',
          onboarded: true,
          createdAt: profile?.created_at ?? new Date().toISOString(),
        });
      }

      addToast('Account created! Welcome to your workspace client portal.', 'success');
      router.replace('/client/workspace');
    } catch (err: any) {
      addToast(err.message || 'Signup failed', 'warning');
    } finally {
      setSigningUp(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#B8B5B0] flex items-center justify-center">
        <div className="text-gray-900 font-bold font-sans">Checking invitation token...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#B8B5B0] flex items-center justify-center p-4">
        <GlassAuthCard>
          <div className="text-center space-y-4 py-4 select-none">
            <div className="w-12 h-12 bg-red-50 text-red-650 rounded-full flex items-center justify-center mx-auto border border-red-100">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-gray-950">Invalid Invitation Link</h2>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-full cursor-pointer transition-colors shadow-sm"
            >
              Go to Login
            </button>
          </div>
        </GlassAuthCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#B8B5B0] relative overflow-hidden flex items-center justify-center py-12">
      {/* Background blobs */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-white/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-white/20 rounded-full blur-3xl pointer-events-none" />

      <GlassAuthCard>
        <div className="space-y-6 select-none">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-950">Accept Invitation</h2>
            <p className="text-xs text-gray-500 font-semibold mt-1">Set up your client profile password to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email (Readonly) */}
            <div className="relative">
              <input
                type="email"
                value={invitation?.email}
                readOnly
                className="w-full h-12 px-4 pt-5 pb-1 bg-gray-50 border border-black/10 rounded-xl text-gray-400 focus:outline-none text-sm font-semibold select-none cursor-not-allowed"
              />
              <label className="absolute left-4 top-1 text-[10px] text-gray-400 font-bold uppercase">
                Email Address
              </label>
            </div>

            {/* Name Input */}
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="peer w-full h-12 px-4 pt-5 pb-1 bg-white/10 border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 transition-all text-sm font-semibold"
                placeholder=" "
                required
              />
              <label className="absolute left-4 top-3.5 text-gray-500 text-sm transition-all pointer-events-none peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-950 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">
                Your Full Name
              </label>
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer w-full h-12 pl-4 pr-10 pt-5 pb-1 bg-white/10 border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 transition-all text-sm font-semibold"
                placeholder=" "
                required
              />
              <label className="absolute left-4 top-3.5 text-gray-500 text-sm transition-all pointer-events-none peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-950 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">
                Create Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={signingUp}
              className="w-full h-11 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-bold text-xs rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-2"
            >
              {signingUp ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : 'Complete Setup'}
            </button>
          </form>
        </div>
      </GlassAuthCard>
    </div>
  );
}
