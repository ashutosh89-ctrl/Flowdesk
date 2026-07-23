'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  ariaLabel?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  ariaLabel,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-black/20 disabled:pointer-events-none disabled:opacity-50';

  const variants = {
    primary: 'bg-[#1a1a19] text-white hover:bg-[#1a1a19]/90 rounded-lg shadow-sm',
    secondary: 'bg-[#B8B5B0]/20 text-[#1a1a19] hover:bg-[#B8B5B0]/30 rounded-lg',
    ghost: 'bg-transparent text-[#1a1a19] hover:bg-black/5 rounded-lg',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 rounded-lg shadow-sm',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  return (
    <button
      aria-label={ariaLabel}
      aria-busy={isLoading}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span className="sr-only">Loading...</span>
        </>
      ) : null}
      {children}
    </button>
  );
}
