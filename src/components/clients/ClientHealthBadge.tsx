'use client';

import React from 'react';
import { HealthInfo } from '@/lib/services/healthService';

interface ClientHealthBadgeProps {
  health: HealthInfo;
}

export function ClientHealthBadge({ health }: ClientHealthBadgeProps) {
  const dotColor = 
    health.status === 'at-risk' ? 'bg-red-500' :
    health.status === 'waiting-on-client' ? 'bg-amber-500' :
    health.status === 'payment-pending' ? 'bg-orange-500' :
    'bg-emerald-500';

  return (
    <span 
      title={health.reason}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${health.badgeClass} transition-all cursor-help select-none`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {health.label}
    </span>
  );
}
