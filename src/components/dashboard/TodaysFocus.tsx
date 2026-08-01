"use client";
import React from 'react';
import Link from 'next/link';
import { Target, CheckCircle2 } from 'lucide-react';

interface TodaysFocusProps {
  urgentFocus: {
    text: string;
    link: string;
    isUrgent: boolean;
  };
}

export function TodaysFocus({ urgentFocus }: TodaysFocusProps) {
  if (urgentFocus.isUrgent) {
    return (
      <div className="flex items-center gap-3 text-sm text-gray-700 mb-6 bg-amber-50/60 border border-amber-200/60 p-3.5 px-4 rounded-2xl transition-all shadow-2xs">
        <Target size={16} className="text-amber-500 shrink-0" />
        <span className="font-semibold text-gray-900 shrink-0">Today's Focus:</span>
        <span className="text-gray-700 font-medium truncate">{urgentFocus.text}</span>
        <Link
          href={urgentFocus.link}
          className="text-gray-900 font-semibold underline underline-offset-2 ml-auto shrink-0 hover:text-black transition-colors"
        >
          View →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm text-gray-500 mb-6 bg-emerald-50/60 border border-emerald-200/60 p-3.5 px-4 rounded-2xl shadow-2xs">
      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
      <span className="font-medium text-gray-700">You're all caught up for today ✨</span>
    </div>
  );
}
