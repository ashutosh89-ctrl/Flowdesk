import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppContext';
import { signIn, signUp } from '../lib/services/authService';
import { LogIn, UserPlus, KeyRound, Mail, Sparkles, User as UserIcon } from 'lucide-react';

export default function AuthScreen() {
  const { setUser, addToast } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      addToast('Please fill in all required fields', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await signIn(email, password);
        setUser(res.user);
        addToast(`Welcome back, ${res.user.name}!`);
      } else {
        const res = await signUp(email, password, name);
        setUser(res.user);
        addToast(`Account created successfully! Welcome, ${res.user.name}.`);
      }
    } catch (err: any) {
      addToast(err.message || 'Authentication failed', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'freelancer' | 'client') => {
    setLoading(true);
    try {
      const targetEmail = role === 'freelancer' ? 'ann.k@flowdesk.com' : 'marta.adams@globallogistics.com';
      const res = await signIn(targetEmail, 'password');
      setUser(res.user);
      addToast(`Quick logged in as ${res.user.name} (${res.user.role})`);
    } catch (err: any) {
      addToast(err.message || 'Quick login failed', 'warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen canvas-gradient flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Visual background decoration items */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/20 rounded-full filter blur-3xl -z-10 animate-pulse duration-[6000ms]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-200/40 rounded-full filter blur-3xl -z-10 animate-pulse duration-[8000ms]"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-white/60 text-xs font-semibold tracking-wider text-gray-600 mb-3 specular-rim">
            <Sparkles className="w-3.5 h-3.5 text-black" />
            CLIENT WORKSPACE PLATFORM
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 font-sans">
            Flow<span className="text-gray-500 font-light">Desk</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">The elegant workspace built for premium freelancers</p>
        </div>

        {/* Auth Glass Window */}
        <div className="glass-window p-8 rounded-xl relative">
          <div className="flex gap-4 border-b border-gray-200/50 pb-6 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-center font-semibold text-sm transition-all duration-200 ${
                isLogin ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-center font-semibold text-sm transition-all duration-200 ${
                !isLogin ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ann Kowalski"
                    className="w-full pl-11 pr-4 py-3 bg-white/60 hover:bg-white/80 focus:bg-white rounded-lg border border-gray-200/60 focus:border-gray-400 outline-none text-sm font-medium transition-all duration-150 shadow-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ann.k@flowdesk.com"
                  className="w-full pl-11 pr-4 py-3 bg-white/60 hover:bg-white/80 focus:bg-white rounded-lg border border-gray-200/60 focus:border-gray-400 outline-none text-sm font-medium transition-all duration-150 shadow-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-white/60 hover:bg-white/80 focus:bg-white rounded-lg border border-gray-200/60 focus:border-gray-400 outline-none text-sm font-medium transition-all duration-150 shadow-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-md flex items-center justify-center gap-2 mt-6 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : isLogin ? (
                <>
                  <LogIn className="w-4 h-4" /> Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Create Account
                </>
              )}
            </button>
          </form>

          {/* Quick Sandbox Logins */}
          <div className="mt-8 pt-6 border-t border-gray-200/40">
            <p className="text-center text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">
              Developer Sandbox Portals
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleQuickLogin('freelancer')}
                disabled={loading}
                className="py-2.5 px-3 bg-white/80 hover:bg-white border border-gray-200/60 hover:border-gray-300 rounded-lg text-xs font-semibold text-gray-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                Freelancer Portal
              </button>
              <button
                onClick={() => handleQuickLogin('client')}
                disabled={loading}
                className="py-2.5 px-3 bg-white/80 hover:bg-white border border-gray-200/60 hover:border-gray-300 rounded-lg text-xs font-semibold text-gray-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Client Portal
              </button>
            </div>
            <p className="text-center text-[11px] text-gray-400 mt-2">
              Bypass form flow to test specific roles immediately
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
