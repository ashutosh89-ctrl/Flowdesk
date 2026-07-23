import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppContext';
import { getAllActivities } from '../lib/services/activityService';
import { readAll } from '../lib/services/dataService';
import { Activity, Client, Invoice } from '../lib/types';
import { 
  Users, Briefcase, DollarSign, Calendar, ArrowUpRight, 
  Search, Bell, Mail, Compass, ShieldAlert, CheckCircle2, 
  ChevronRight, Sparkles 
} from 'lucide-react';

export default function DashboardScreen() {
  const { setScreen, setActiveClientId, setActiveInvoiceId, addToast } = useApp();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const acts = await getAllActivities();
        // Sort descending by date
        setActivities(acts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        
        const cls = await readAll<Client>('clients');
        setClients(cls);

        const invs = await readAll<Invoice>('invoices');
        setInvoices(invs);
      } catch (e) {
        console.error(e);
      }
    }
    loadDashboardData();
  }, []);

  // Filter activities or clients based on search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleActionClick = (actionType: 'workspace' | 'invoice', targetId: string) => {
    if (actionType === 'workspace') {
      setActiveClientId(targetId);
      setScreen?.('workspace');
      addToast('Navigated to Client Workspace', 'info');
    } else if (actionType === 'invoice') {
      setActiveInvoiceId(targetId);
      setScreen?.('invoice');
      addToast('Opening Invoice Details', 'info');
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white/10">
      {/* Header Bar */}
      <header className="h-16 border-b border-gray-200/50 px-8 flex items-center justify-between bg-white/40 backdrop-blur-md">
        <div className="flex items-center gap-4 w-96">
          <Search className="w-4.5 h-4.5 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Type searching..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full text-sm font-medium text-gray-800 bg-transparent outline-none placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-6">
          {/* Weather Widget */}
          <div className="flex items-center gap-2 px-3 py-1 bg-white/50 border border-gray-200/40 rounded-full text-xs font-semibold text-gray-600 specular-rim">
            <span className="text-yellow-500">☀️</span> 23° 14:20
          </div>
          
          <button className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors hover:bg-black/5 rounded-full cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>
          
          <button className="p-2 text-gray-500 hover:text-gray-900 transition-colors hover:bg-black/5 rounded-full cursor-pointer">
            <Mail className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Good to see you 👋</h1>
            <p className="text-sm text-gray-500 font-medium">Here is your business summary for today.</p>
          </div>
          <div className="text-xs font-semibold text-gray-400 tracking-wider">
            LAYER STACK: CANVAS → WINDOW → INTERIOR → CARDS
          </div>
        </div>

        {/* Stats Summary Grid */}
        <div className="grid grid-cols-4 gap-6">
          {[
            { id: 'clients', label: 'Active Clients', value: '48', trend: '+12%', color: 'text-emerald-600', icon: Users, bg: 'bg-emerald-500/10' },
            { id: 'projects', label: 'Active Projects', value: '12', trend: 'Steady', color: 'text-gray-600', icon: Briefcase, bg: 'bg-gray-500/10' },
            { id: 'payments', label: 'Pending Payments', value: '04', trend: 'Urgent', color: 'text-amber-600', icon: DollarSign, bg: 'bg-amber-500/10' },
            { id: 'due', label: 'Projects Due', value: '07', trend: '7 Days', color: 'text-indigo-600', icon: Calendar, bg: 'bg-indigo-500/10' },
          ].map((stat, i) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-6 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                if (stat.id === 'clients') setScreen?.('clients');
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${stat.bg} ${stat.color}`}>
                  {stat.trend}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-gray-900">{stat.value}</span>
                <div className="p-2.5 bg-gray-50 rounded-full">
                  <stat.icon className="w-5 h-5 text-gray-700" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Board (Mission Control) & Activity Feed */}
        <div className="grid grid-cols-3 gap-8">
          
          {/* Mission Control Panel (Left Column) */}
          <div className="col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-gray-700" />
                Mission Control
              </h2>
              <span className="text-xs font-semibold text-gray-400 uppercase">Attention Board</span>
            </div>

            {/* Structured priorities list */}
            <div className="space-y-4">
              
              {/* Item 1: David Stern Workspace Navigation */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-6 rounded-xl border border-white/80 hover:border-gray-300 transition-all cursor-pointer flex items-center justify-between group"
                onClick={() => handleActionClick('workspace', 'cl_david')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-black">ABC Studio - UI Revamp</h4>
                    <p className="text-xs text-gray-500 font-medium mt-1">Design review scheduled for tomorrow — Priority</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/50 rounded-full">
                    Priority
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>

              {/* Item 2: Overdue Invoice Navigation */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 rounded-xl border border-white/80 hover:border-gray-300 transition-all cursor-pointer flex items-center justify-between group"
                onClick={() => handleActionClick('invoice', 'inv_david')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-black">Global Logistics - Payment Overdue</h4>
                    <p className="text-xs text-gray-500 font-medium mt-1">$12,450.00 outstanding for 14 days — High Risk</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200/50 rounded-full">
                    High Risk
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>

              {/* Item 3: Client Portal Brand Assets */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6 rounded-xl border border-white/80 hover:border-gray-300 transition-all cursor-pointer flex items-center justify-between group"
                onClick={() => handleActionClick('workspace', 'cl_marta')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-black">Creative Hub - Brand Assets</h4>
                    <p className="text-xs text-gray-500 font-medium mt-1">All deliverables approved and shipped</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200/50 rounded-full">
                    Complete
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Activity Feed (Right Column) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Activity Feed</h2>
              <span className="text-xs font-semibold text-gray-400 uppercase">Realtime Logs</span>
            </div>

            <div className="glass-card p-6 rounded-xl space-y-6 max-h-[400px] overflow-y-auto">
              {activities.length === 0 ? (
                <p className="text-xs text-gray-400 font-semibold text-center py-8">No activities recorded yet.</p>
              ) : (
                activities.map((act, i) => (
                  <div key={act.id} className="flex gap-4 relative group">
                    {/* Visual alignment line */}
                    {i < activities.length - 1 && (
                      <div className="absolute left-2 top-6 bottom-[-24px] w-[1px] bg-gray-200/50"></div>
                    )}
                    <div className="w-4 h-4 rounded-full bg-gray-900 border border-white ring-4 ring-white/30 shrink-0 mt-1 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800 leading-relaxed">{act.description}</p>
                      <span className="text-[10px] font-semibold text-gray-400 block mt-1">
                        {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
