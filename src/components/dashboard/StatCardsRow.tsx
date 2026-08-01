"use client";
import React from 'react';
import Link from 'next/link';
import { Users, Briefcase, IndianRupee, AlertCircle, Calendar } from 'lucide-react';
import { DashboardStats } from '@/hooks/useDashboardStats';

interface StatCardsRowProps {
  stats: DashboardStats;
}

export function StatCardsRow({ stats }: StatCardsRowProps) {
  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-4">
      {/* 6 Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* 1. Active Clients */}
        <Link href="/freelancer/clients?status=active" className="block group">
          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100/50">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Active Clients
              </span>
              <Users size={18} className="text-emerald-500 shrink-0" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.activeClientsCount}</div>
          </div>
        </Link>

        {/* 2. Active Projects */}
        <Link href="/freelancer/projects?status=in-progress" className="block group">
          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100/50">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Active Projects
              </span>
              <Briefcase size={18} className="text-blue-500 shrink-0" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.activeProjectsCount}</div>
          </div>
        </Link>

        {/* 3. Pending Payments */}
        <Link href="/freelancer/invoices?status=pending" className="block group">
          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100/50">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Pending Payments
              </span>
              <IndianRupee size={18} className="text-amber-500 shrink-0" />
            </div>
            <div className="text-2xl font-bold text-gray-900 truncate">
              {stats.pendingPaymentsCount} <span className="text-sm font-normal text-gray-400">·</span> <span className="text-xl font-bold text-gray-900">{formatCurrency(stats.pendingPaymentsAmount)}</span>
            </div>
          </div>
        </Link>

        {/* 4. Overdue Invoices (NEW) */}
        <Link href="/freelancer/invoices?status=overdue" className="block group">
          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100/50">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Overdue Invoices
              </span>
              <AlertCircle size={18} className="text-red-500 shrink-0" />
            </div>
            <div className={`text-2xl font-bold ${stats.overdueInvoicesCount > 0 ? 'text-red-600' : 'text-gray-900'} truncate`}>
              {stats.overdueInvoicesCount} <span className="text-sm font-normal text-gray-400">·</span> <span className="text-xl font-bold">{formatCurrency(stats.overdueInvoicesAmount)}</span>
            </div>
          </div>
        </Link>

        {/* 5. Due This Week */}
        <Link href="/freelancer/projects?due=this-week" className="block group">
          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100/50">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Due This Week
              </span>
              <Calendar size={18} className={stats.dueThisWeekCount > 0 ? 'text-red-500' : 'text-gray-400'} />
            </div>
            <div className={`text-3xl font-bold ${stats.dueThisWeekCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {stats.dueThisWeekCount}
            </div>
          </div>
        </Link>

        {/* 6. Health Score */}
        <Link href="/freelancer/settings" className="block group">
          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100/50 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                Health Score
              </span>
              <span className="text-xs text-gray-400 mt-1 block">Business Status</span>
            </div>
            <div className="relative w-12 h-12 shrink-0">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="24" cy="24" r="20"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3.5"
                />
                <circle
                  cx="24" cy="24" r="20"
                  fill="none"
                  stroke={stats.healthScore > 70 ? '#10b981' : stats.healthScore > 40 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={`${(stats.healthScore / 100) * 125.66} 125.66`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-gray-900">
                {stats.healthScore}
              </span>
            </div>
          </div>
        </Link>

      </div>

      {/* Business Snapshot Bar (Lifetime Revenue & This Month Revenue) */}
      <div className="flex flex-wrap items-center gap-6 sm:gap-8 mt-2 px-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-medium">Lifetime Revenue</span>
          <span className="font-bold text-gray-900">{formatCurrency(stats.lifetimeRevenue)}</span>
        </div>
        <div className="hidden sm:block h-3.5 w-px bg-gray-200" />
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-medium">This Month</span>
          <span className="font-bold text-gray-900">{formatCurrency(stats.thisMonthRevenue)}</span>
        </div>
      </div>
    </div>
  );
}
