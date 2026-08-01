"use client";
import React from 'react';
import { User } from '@/lib/types';

interface DashboardHeaderProps {
  user: User | null;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const greeting = getGreeting();
  const firstName = user?.name?.split(' ')[0];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          {greeting}{firstName ? `, ${firstName}` : ''} 👋
        </h2>
        <p className="text-sm text-gray-500 font-medium">Let's keep your business moving</p>
      </div>
    </div>
  );
}
