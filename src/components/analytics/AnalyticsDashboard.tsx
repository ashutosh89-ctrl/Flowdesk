'use client';

import React, { useState, useMemo } from 'react';
import { Client, Project, Invoice } from '@/lib/types';
import { calculateAnalyticsMetrics } from '@/lib/services/analyticsService';
import { getCurrencySymbol } from '@/lib/utils/currency';
import { 
  TrendingUp, DollarSign, Clock, Users, CheckCircle2, 
  AlertTriangle, Layers, Calendar, BarChart3, ArrowUpRight 
} from 'lucide-react';
import { motion } from 'motion/react';

interface AnalyticsDashboardProps {
  clients: Client[];
  projects: Project[];
  invoices: Invoice[];
}

export function AnalyticsDashboard({ clients, projects, invoices }: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState<'all' | 'this_month' | 'this_year' | 'last_30_days'>('all');

  const metrics = useMemo(() => {
    return calculateAnalyticsMetrics(clients, projects, invoices, dateRange);
  }, [clients, projects, invoices, dateRange]);

  const currencySymbol = getCurrencySymbol('INR');

  const formatMoney = (val: number) => {
    return `${currencySymbol}${val.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
  };

  const maxRevenue = useMemo(() => {
    const max = Math.max(...metrics.monthlyData.map(d => d.revenue), 100);
    return max;
  }, [metrics.monthlyData]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-black/5 shadow-2xs">
        <div>
          <h2 className="text-xl font-black text-gray-950 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-900" />
            Business Performance & Analytics
          </h2>
          <p className="text-xs font-semibold text-gray-500 mt-0.5">
            Real-time financial metrics, payment timelines, and project efficiency insights.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex bg-white border border-black/10 rounded-full p-1 shadow-2xs shrink-0">
          {[
            { key: 'all', label: 'All Time' },
            { key: 'this_month', label: 'This Month' },
            { key: 'this_year', label: 'This Year' },
            { key: 'last_30_days', label: '30 Days' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setDateRange(tab.key as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                dateRange === tab.key 
                  ? 'bg-gray-950 text-white shadow-2xs' 
                  : 'text-gray-400 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Lifetime Revenue */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-black/5 p-5 shadow-2xs space-y-3"
        >
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Lifetime Revenue</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-gray-950 font-mono tracking-tight">
              {formatMoney(metrics.lifetimeRevenue)}
            </div>
            <p className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Total Collected
            </p>
          </div>
        </motion.div>

        {/* Monthly Revenue */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl border border-black/5 p-5 shadow-2xs space-y-3"
        >
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Monthly Revenue</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-gray-950 font-mono tracking-tight">
              {formatMoney(metrics.monthlyRevenue)}
            </div>
            <p className="text-[11px] font-bold text-gray-500 mt-1">Paid in current month</p>
          </div>
        </motion.div>

        {/* Outstanding Payments */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-black/5 p-5 shadow-2xs space-y-3"
        >
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Outstanding Payments</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-gray-950 font-mono tracking-tight">
              {formatMoney(metrics.outstandingAmount)}
            </div>
            <p className="text-[11px] font-bold text-amber-700 mt-1">Pending client invoices</p>
          </div>
        </motion.div>

        {/* Overdue Amount */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-black/5 p-5 shadow-2xs space-y-3"
        >
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Overdue Amount</span>
            <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-red-600 font-mono tracking-tight">
              {formatMoney(metrics.overdueAmount)}
            </div>
            <p className="text-[11px] font-bold text-red-600 mt-1">Requires immediate follow-up</p>
          </div>
        </motion.div>
      </div>

      {/* Operational Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-black/5 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-gray-400 uppercase">Active Clients</span>
            <div className="text-lg font-black text-gray-950">{metrics.activeClientsCount} Clients</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-gray-400 uppercase">Active Projects</span>
            <div className="text-lg font-black text-gray-950">{metrics.activeProjectsCount} In Progress</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-gray-400 uppercase">Completion Rate</span>
            <div className="text-lg font-black text-gray-950">{metrics.completionRate}%</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-gray-400 uppercase">Avg Payment Speed</span>
            <div className="text-lg font-black text-gray-950">{metrics.averagePaymentTimeDays} Days</div>
          </div>
        </div>
      </div>

      {/* Charts Section: 6-Month Revenue Bar Chart & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Bar Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-black/5 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-gray-950 uppercase tracking-wider">Revenue Trend (Last 6 Months)</h3>
              <p className="text-xs font-semibold text-gray-400">Monthly billing collections.</p>
            </div>
            <span className="text-xs font-bold text-gray-700 bg-gray-50 border border-black/5 px-3 py-1 rounded-full">
              Avg Project: {formatMoney(metrics.averageProjectValue)}
            </span>
          </div>

          <div className="h-56 flex items-end justify-between gap-4 pt-6 pb-2 px-2 border-b border-black/5">
            {metrics.monthlyData.map((item, idx) => {
              const heightPercent = maxRevenue > 0 ? Math.max(12, Math.round((item.revenue / maxRevenue) * 100)) : 12;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] font-bold font-mono text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatMoney(item.revenue)}
                  </div>
                  <div 
                    className="w-full max-w-[48px] bg-gray-950 group-hover:bg-gray-800 rounded-t-xl transition-all duration-300 relative"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[10px] font-bold text-gray-500 uppercase">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-black/5 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-extrabold text-gray-950 uppercase tracking-wider">Project Portfolio Breakdown</h3>
            <p className="text-xs font-semibold text-gray-400">Distribution across active workflow stages.</p>
          </div>

          <div className="space-y-4">
            {metrics.projectStatusBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="capitalize text-gray-800">{item.status}</span>
                  <span className="text-gray-500">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gray-900 rounded-full transition-all duration-500" 
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
