'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#B8B5B0]/20">
        <Icon className="h-10 w-10 text-[rgba(26,26,25,0.40)]" strokeWidth={1.5} />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-[#1a1a19]">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-[rgba(26,26,25,0.60)]">{description}</p>

      {actionLabel && onAction && (
        <div className="flex gap-3">
          <Button onClick={onAction} variant="primary">
            {actionLabel}
          </Button>
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="ghost">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
