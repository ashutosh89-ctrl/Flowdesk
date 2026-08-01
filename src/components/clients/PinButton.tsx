'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface PinButtonProps {
  isPinned?: boolean;
  onToggle: () => void;
  size?: number;
}

export function PinButton({ isPinned = false, onToggle, size = 16 }: PinButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`p-1.5 rounded-full transition-all cursor-pointer ${
        isPinned 
          ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' 
          : 'text-gray-300 hover:text-amber-400 hover:bg-black/5'
      }`}
      aria-label={isPinned ? 'Unpin' : 'Pin'}
    >
      <Star className={`w-${size === 16 ? '4' : '5'} h-${size === 16 ? '4' : '5'} ${isPinned ? 'fill-amber-400' : ''}`} />
    </button>
  );
}
