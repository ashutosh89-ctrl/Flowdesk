'use client';

import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { getCountdown } from '@/lib/services/countdownService';

interface CountdownBadgeProps {
  dueDate?: string;
  showIcon?: boolean;
}

export function CountdownBadge({ dueDate, showIcon = true }: CountdownBadgeProps) {
  const info = getCountdown(dueDate);

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] border ${info.badgeClass} select-none shrink-0`}>
      {showIcon && (
        info.isOverdue ? <AlertTriangle className="w-3 h-3 text-red-600" /> : <Clock className="w-3 h-3 text-gray-500" />
      )}
      {info.label}
    </span>
  );
}
