'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '../AppContext';
import { signUp } from '../../lib/services/authService';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { validatePassword, validateEmail } from '@/lib/utils/validation';

export default function SignupFormClient() {
  const router = useRouter();
  const { setUser, addToast } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
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
      const result = await signUp(email, password, name);
      setUser(result.user);
      addToast('Account created successfully!', 'success');
      
      // Hard navigate to onboarding to ensure fresh state
      router.push('/onboarding');
    } catch (err: any) {
      addToast(err.message || 'Registration failed', 'warning');
      triggerShake();
    } finally {
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
                      password === confirmPassword;

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
