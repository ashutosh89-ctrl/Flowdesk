'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '../AppContext';
import { resetPassword } from '../../lib/services/authService';
import { Loader2 } from 'lucide-react';

export default function ForgotPasswordFormClient() {
  const { addToast } = useApp();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(async () => {
      try {
        await resetPassword(email);
        addToast('Reset instructions sent if email exists', 'success');
        setSubmitted(true);
      } catch (err: any) {
        addToast('Could not process reset request', 'warning');
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="text-center space-y-2">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Check Your Inbox</h2>
        </div>
        
        <p className="text-sm text-gray-600 leading-relaxed">
          If an account exists with this email, we've sent you a password reset link. Please check your inbox.
        </p>

        <div className="pt-2">
          <Link href="/login" className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-full px-6 py-2.5 text-sm transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-gray-900">🔒 Reset Password</h2>
        <p className="text-sm text-gray-500">We will send you instructions to reset your password</p>
      </div>

      {/* Email Input */}
      <div className="relative">
        <input
          type="text"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          className="peer w-full h-12 px-4 pt-5 pb-1 bg-white/30 border border-black/10 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/20 transition-all text-sm"
          placeholder=" "
        />
        <label className="absolute left-4 top-3.5 text-gray-500 text-sm transition-all pointer-events-none peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-950 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">
          Email Address
        </label>
        {error && (
          <p className="text-red-600 text-xs mt-1 ml-1">{error}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="relative flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white rounded-full h-12 w-full font-medium transition-colors cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          'Send Reset Link'
        )}
      </button>

      <div className="text-center text-xs">
        <Link href="/login" className="text-gray-900 font-semibold hover:underline">
          Back to Login
        </Link>
      </div>
    </form>
  );
}
