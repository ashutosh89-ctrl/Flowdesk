'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function ResponsiveTable({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0', className)}>
      <div className="min-w-[640px] md:min-w-0">{children}</div>
    </div>
  );
}
