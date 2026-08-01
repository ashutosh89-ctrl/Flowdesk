"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { Activity } from '@/lib/types';
import { Activity as ActivityIcon, ArrowRight } from 'lucide-react';

interface RecentActivityFeedProps {
  activities: Activity[];
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' +
         date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  const router = useRouter();

  const handleActivityClick = (act: Activity) => {
    if (act.type.includes('invoice') || act.type.includes('payment')) {
      router.push('/freelancer/invoices');
    } else if (act.type.includes('client')) {
      router.push('/freelancer/clients');
    } else if (act.workspaceId) {
      router.push(`/freelancer/workspace/${act.workspaceId}`);
    } else {
      router.push('/freelancer/activity');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <ActivityIcon className="w-4 h-4 text-gray-700" />
          Recent Activity
        </h3>
        <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
          Realtime Logs
        </span>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/50 space-y-4 max-h-[460px] overflow-y-auto">
        {activities.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-xs font-semibold text-gray-400">No recent activity</p>
            <p className="text-[11px] text-gray-350 mt-1">Actions across your workspaces will appear here.</p>
          </div>
        ) : (
          activities.map((act, i) => (
            <div
              key={act.id || i}
              onClick={() => handleActivityClick(act)}
              className="flex items-start gap-3 relative group cursor-pointer p-2 rounded-xl hover:bg-gray-50/80 transition-colors"
            >
              {i < activities.length - 1 && (
                <div className="absolute left-[17px] top-7 bottom-[-16px] w-px bg-gray-150 group-hover:bg-gray-300 transition-colors" />
              )}
              
              <div className="w-2.5 h-2.5 rounded-full bg-gray-900 shrink-0 mt-1.5 ring-4 ring-white group-hover:bg-blue-600 transition-colors" />

              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 leading-snug group-hover:text-gray-900 transition-colors">
                  {act.description}
                </p>
                <span className="text-[10px] font-medium text-gray-400 block mt-0.5">
                  {formatRelativeTime(act.createdAt)}
                </span>
              </div>

              <ArrowRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 group-hover:text-gray-600 transition-all shrink-0 self-center" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
