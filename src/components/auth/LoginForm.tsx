"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '../AppContext';
import { signIn } from '../../lib/services/authService';
import { Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';

import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const { setUser, addToast } = useApp();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
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
      const result = await signIn(email, password);
      setUser(result.user);
      addToast('Welcome back, ' + result.user.name + '!', 'success');
      
      const targetUrl = result.user.role === 'client' ? '/client/workspace' : '/freelancer/dashboard';
      router.push(targetUrl);
    } catch (err: any) {
      addToast(err.message || 'Invalid email or password', 'warning');
      triggerShake();
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'freelancer' | 'client') => {
    const targetEmail = role === 'freelancer' ? 'ann.k@flowdesk.com' : 'marta.adams@globallogistics.com';
    setEmail(targetEmail);
    setPassword('password');
    setLoading(true);
    try {
      const result = await signIn(targetEmail, 'password');
      setUser(result.user);
      addToast(`Welcome back, ${result.user.name}!`, 'success');
      
      const targetUrl = result.user.role === 'client' ? '/client/workspace' : '/freelancer/dashboard';
      router.push(targetUrl);
    } catch (err: any) {
      addToast(err.message || 'Demo login failed', 'warning');
      triggerShake();
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
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-gray-900">⚡ FlowDesk Login</h2>
        <p className="text-xs text-gray-500">Sign in to your client control panel</p>
      </div>

      {/* Quick Demo Access Buttons */}
      <div className="p-3 bg-white/40 border border-black/5 rounded-2xl space-y-2">
        <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Quick Demo 1-Click Access
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleDemoLogin('freelancer')}
            disabled={loading}
            className="flex-1 py-2 px-2.5 bg-white hover:bg-gray-50 border border-black/10 rounded-xl text-xs font-bold text-gray-900 transition-all shadow-xs cursor-pointer text-center"
          >
            👨‍💻 Freelancer
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('client')}
            disabled={loading}
            className="flex-1 py-2 px-2.5 bg-white hover:bg-gray-50 border border-black/10 rounded-xl text-xs font-bold text-gray-900 transition-all shadow-xs cursor-pointer text-center"
          >
            🏢 Client
          </button>
        </div>
      </div>

      <div className="flex items-center my-2">
        <div className="flex-1 h-px bg-black/10" />
        <span className="px-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">or sign in manually</span>
        <div className="flex-1 h-px bg-black/10" />
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
          className="peer w-full h-12 px-4 pt-5 pb-1 bg-white/50 border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 transition-all text-sm font-semibold"
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
          className="peer w-full h-12 pl-4 pr-10 pt-5 pb-1 bg-white/50 border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 transition-all text-sm font-semibold"
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

        {errors.password && (
          <p className="text-red-600 text-xs mt-1 ml-1">{errors.password}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="relative flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white rounded-full h-12 w-full font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          'Sign In'
        )}
      </button>

      {/* Footer Navigation */}
      <div className="text-center pt-1 text-xs text-gray-500 font-semibold">
        Don't have an account?{' '}
        <Link href="/signup" className="text-gray-950 font-bold hover:underline">
          Sign Up
        </Link>
      </div>
    </form>
  );
}
