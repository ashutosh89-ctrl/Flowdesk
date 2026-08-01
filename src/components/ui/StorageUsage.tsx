'use client';

import React from 'react';
import { HardDrive, AlertTriangle } from 'lucide-react';
import { calculateStorageUsage } from '@/lib/services/fileService';

interface StorageUsageProps {
  documents?: any[];
  deliverables?: any[];
}

export function StorageUsage({ documents = [], deliverables = [] }: StorageUsageProps) {
  const usage = calculateStorageUsage(documents, deliverables);

  const isWarning = usage.percentage >= 80 && usage.percentage < 95;
  const isCritical = usage.percentage >= 95;

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-black/5 p-4 space-y-3 font-sans shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-black text-gray-950">
          <HardDrive className="w-4 h-4 text-gray-900" />
          Workspace Storage
        </div>
        <span className="text-[10px] font-bold text-gray-500 font-mono">
          {usage.usedFormatted} / {usage.limitFormatted}
        </span>
      </div>

      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            isCritical ? 'bg-red-600' : isWarning ? 'bg-amber-500' : 'bg-gray-950'
          }`}
          style={{ width: `${usage.percentage}%` }}
        />
      </div>

      {(isWarning || isCritical) && (
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Storage limit reaching capacity ({usage.percentage}% used).</span>
        </div>
      )}
    </div>
  );
}
