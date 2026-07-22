'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '../AppContext';
import { updatePassword } from '../../lib/services/authService';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordFormClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || 'mock-token-123';
  const { addToast } = useApp();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [strength, setStrength] = useState(0);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' });
      return;
    }
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      await updatePassword(token, password);
      addToast('Password updated successfully', 'success');
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      addToast(err.message || 'Failed to update password', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = password.length >= 8 && 
                      password === confirmPassword && 
                      strength >= 2;

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="text-center space-y-2">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Password Updated Successfully</h2>
        </div>
        
        <p className="text-sm text-gray-600 leading-relaxed">
          You can now sign in using your new password. You will be automatically redirected to the login page in 3 seconds.
        </p>

        <div className="pt-2">
          <Link href="/login" className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-full px-6 py-2.5 text-sm transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-gray-900">🔑 New Password</h2>
        <p className="text-sm text-gray-500">Create a secure password for your account</p>
      </div>

      {/* New Password Input */}
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
          New Password
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

      {/* Hint */}
      <div className="text-xs text-gray-500 leading-relaxed pl-1">
        💡 Min 8 chars, one uppercase, one lowercase, one number
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !isFormValid}
        className="relative flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white rounded-full h-12 w-full font-medium transition-colors cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          'Update Password'
        )}
      </button>
    </form>
  );
}
