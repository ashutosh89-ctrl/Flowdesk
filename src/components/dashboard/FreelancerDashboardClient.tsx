"use client";
import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { getNextBestActions, ActionRecommendation } from '../../lib/services/nextBestActionService';
import NextBestActionCard from './NextBestActionCard';
import { Activity, Client, Project, Invoice, ClientWorkspace } from '../../lib/types';
import { 
  Users, Briefcase, IndianRupee, Calendar, Sparkles, Activity as ActivityIcon, Compass
} from 'lucide-react';
import { useRouter } from 'next/navigation';

function CountUp({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }
    const duration = 800; // ms
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
}

interface FreelancerDashboardClientProps {
  initialData: {
    clients: Client[];
    workspaces: ClientWorkspace[];
    projects: Project[];
    invoices: Invoice[];
    activities: Activity[];
    actions: ActionRecommendation[];
  };
}

export function FreelancerDashboardClient({ initialData }: FreelancerDashboardClientProps) {
  const { user } = useApp();
  const router = useRouter();
  
  const [activities, setActivities] = useState<Activity[]>(initialData.activities);
  const [clients, setClients] = useState<Client[]>(initialData.clients);
  const [projects, setProjects] = useState<Project[]>(initialData.projects);
  const [invoices, setInvoices] = useState<Invoice[]>(initialData.invoices);
  const [workspaces, setWorkspaces] = useState<ClientWorkspace[]>(initialData.workspaces);
  const [actions, setActions] = useState<ActionRecommendation[]>(initialData.actions);
  const [healthScore, setHealthScore] = useState(100);

  const loadData = async () => {
    try {
      const clsRes = await fetch('/api/clients');
      const cls = await clsRes.json();
      setClients(cls);

      const wssRes = await fetch('/api/activities'); // workspaces don't have direct API, let's load from DB read or fetch
      // Wait, we can fetch all API routes
      const projsRes = await fetch('/api/projects');
      const projs = await projsRes.json();
      setProjects(projs);

      const invsRes = await fetch('/api/invoices');
      const invs = await invsRes.json();
      setInvoices(invs);

      const actsRes = await fetch('/api/activities');
      const acts = await actsRes.json();
      setActivities(acts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8));

      if (user) {
        const nbas = await getNextBestActions(user.id);
        setActions(nbas);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    let score = 100;
    const overdueCount = invoices.filter(i => i.status === 'overdue').length;
    score -= overdueCount * 15;
    
    const stalePlanning = projects.filter(p => {
      const days = (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return p.status === 'planning' && days > 7;
    }).length;
    score -= stalePlanning * 10;
    
    const missingDocsCount = workspaces.filter(w => w.status === 'planning').length;
    score -= missingDocsCount * 5;

    setHealthScore(Math.max(0, Math.min(100, score)));
  }, [invoices, projects, workspaces]);

  const activeClientsCount = clients.filter(c => c.status === 'active' || c.status === 'onboarding').length;
  const activeProjectsCount = projects.filter(p => p.status !== 'completed').length;
  const pendingPaymentsSum = invoices
    .filter(i => i.status === 'pending')
    .reduce((sum, item) => sum + item.total, 0);

  const dueThisWeekCount = projects.filter(p => {
    if (!p.dueDate || p.status === 'completed') return false;
    const diffMs = new Date(p.dueDate).getTime() - Date.now();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  const heroAction = actions[0];
  const secondaryActions = actions.slice(1);

  return (
    <div className="space-y-8 p-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Good to see you 👋</h2>
          <p className="text-sm text-gray-500 font-medium">Let's keep your business moving</p>
        </div>
        <div className="text-xs font-semibold text-gray-400 tracking-wider">
          LAYER STACK: CANVAS → WINDOW → INTERIOR → CARDS
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm">
          <div className="flex justify-between items-start text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Clients</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-gray-950">
              <CountUp value={activeClientsCount} />
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm">
          <div className="flex justify-between items-start text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Projects</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
              <Briefcase className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-gray-950">
              <CountUp value={activeProjectsCount} />
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm">
          <div className="flex justify-between items-start text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending Payments</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-full">
              <IndianRupee className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-gray-950">
              <CountUp value={pendingPaymentsSum} prefix="₹" />
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm">
          <div className="flex justify-between items-start text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Due This Week</span>
            <div className={`p-2 rounded-full ${dueThisWeekCount > 0 ? 'bg-red-50 text-red-650' : 'bg-gray-50 text-gray-400'}`}>
              <Calendar className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className={`text-2xl font-extrabold ${dueThisWeekCount > 0 ? 'text-red-600' : 'text-gray-950'}`}>
              <CountUp value={dueThisWeekCount} />
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm flex items-center justify-between col-span-2 lg:col-span-1">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Health Score</span>
            <span className="text-xs text-gray-550 mt-1 block">Business Health</span>
          </div>
          <div className="relative w-14 h-14">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="28" cy="28" r="24"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3.5"
              />
              <circle
                cx="28" cy="28" r="24"
                fill="none"
                stroke={healthScore > 70 ? '#10b981' : healthScore > 40 ? '#f59e0b' : '#ef4444'}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={`${(healthScore / 100) * 150.79} 150.79`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-gray-950">
              {healthScore}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-950 flex items-center gap-2">
              <Compass className="w-5 h-5 text-gray-700" />
              Mission Control
            </h3>
            <span className="text-xs text-gray-400 font-bold uppercase">Attention Board</span>
          </div>

          {heroAction ? (
            <div className="space-y-4">
              <NextBestActionCard action={heroAction} onRefresh={loadData} />
              
              {secondaryActions.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Secondary Recommendations</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {secondaryActions.map((act) => (
                      <div key={act.id} className="bg-white border border-black/5 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className={`w-2 h-2 rounded-full ${act.priority === 'high' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{act.priority}</span>
                          </div>
                          <h5 className="text-xs font-bold text-gray-900 truncate">{act.title}</h5>
                          <p className="text-[11px] text-gray-550 mt-1 line-clamp-2">{act.description}</p>
                        </div>
                        <div className="mt-3">
                          <button
                            onClick={() => router.push(act.route)}
                            className="text-[10px] font-bold bg-gray-50 border border-black/5 hover:bg-gray-100 px-3 py-1.5 rounded-full text-gray-800 transition-colors"
                          >
                            {act.cta}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/50 border border-dashed border-black/10 rounded-2xl p-12 text-center">
              <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-3" />
              <h4 className="font-bold text-gray-900">All caught up! 🎉</h4>
              <p className="text-xs text-gray-550 mt-1">No pending client alerts or overdue payments detected.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-950 flex items-center gap-2">
              <ActivityIcon className="w-5 h-5 text-gray-700" />
              Recent Activity
            </h3>
            <span className="text-xs text-gray-400 font-bold uppercase">Realtime Logs</span>
          </div>

          <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-6 max-h-[440px] overflow-y-auto shadow-sm">
            {activities.length === 0 ? (
              <p className="text-xs text-gray-400 font-semibold text-center py-8">No activities recorded yet.</p>
            ) : (
              activities.map((act, i) => (
                <div key={act.id} className="flex gap-4 relative">
                  {i < activities.length - 1 && (
                    <div className="absolute left-2 top-6 bottom-[-24px] w-[1px] bg-black/5" />
                  )}
                  <div className="w-4 h-4 rounded-full bg-gray-950 shrink-0 mt-1 flex items-center justify-center relative z-10">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 leading-snug">{act.description}</p>
                    <span className="text-[10px] font-bold text-gray-400 block">
                      {new Date(act.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' • '}{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
