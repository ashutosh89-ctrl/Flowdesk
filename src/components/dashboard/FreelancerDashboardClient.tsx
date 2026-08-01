"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../AppContext';
import { getNextBestActions, ActionRecommendation } from '../../lib/services/nextBestActionService';
import NextBestActionCard from './NextBestActionCard';
import { Activity, Client, Project, Invoice, ClientWorkspace } from '../../lib/types';
import { Compass, Sparkles } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { DashboardHeader } from '@/components/freelancer/dashboard/DashboardHeader';
import { TodaysFocus } from './TodaysFocus';
import { StatCardsRow } from './StatCardsRow';
import { RecentActivityFeed } from './RecentActivityFeed';

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

  const stats = useDashboardStats(clients, projects, invoices, workspaces, actions);

  const loadData = async () => {
    try {
      const clsRes = await fetch('/api/clients');
      if (clsRes.ok) {
        const cls = await clsRes.json();
        setClients(cls);
      }

      const projsRes = await fetch('/api/projects');
      if (projsRes.ok) {
        const projs = await projsRes.json();
        setProjects(projs);
      }

      const invsRes = await fetch('/api/invoices');
      if (invsRes.ok) {
        const invs = await invsRes.json();
        setInvoices(invs);
      }

      const actsRes = await fetch('/api/activities');
      if (actsRes.ok) {
        const acts = await actsRes.json();
        setActivities(acts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8));
      }

      if (user) {
        const nbas = await getNextBestActions(user.id);
        setActions(nbas);
      }
    } catch (e) {
      console.error('Error refreshing dashboard data:', e);
    }
  };

  const heroAction = actions[0];
  const secondaryActions = actions.slice(1);

  return (
    <div className="space-y-6 p-6 font-sans max-w-7xl mx-auto">
      {/* 1. Header with Dynamic Greeting */}
      <DashboardHeader user={user} />

      {/* 2. Today's Focus Banner */}
      <TodaysFocus urgentFocus={stats.urgentFocus} />

      {/* 3. 6 Stat Cards Row + Business Snapshot Bar */}
      <StatCardsRow stats={stats} />

      {/* 4. Mission Control & Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
        
        {/* Mission Control (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-gray-700" />
              Mission Control
            </h3>
            <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
              Attention Board
            </span>
          </div>

          {heroAction ? (
            <div className="space-y-4">
              <NextBestActionCard action={heroAction} onRefresh={loadData} />
              
              {secondaryActions.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                    Secondary Recommendations
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {secondaryActions.map((act) => (
                      <div key={act.id} className="bg-white border border-gray-100/50 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className={`w-2 h-2 rounded-full ${act.priority === 'high' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{act.priority}</span>
                          </div>
                          <h5 className="text-xs font-bold text-gray-900 truncate">{act.title}</h5>
                          <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{act.description}</p>
                        </div>
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => router.push(act.route)}
                            className="text-[10px] font-bold bg-gray-900 text-white hover:bg-gray-800 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
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
            <div className="bg-white rounded-2xl border border-gray-100/50 p-12 text-center shadow-sm">
              <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-3" />
              <h4 className="font-bold text-gray-900">All caught up! 🎉</h4>
              <p className="text-xs text-gray-500 mt-1">No pending client alerts or overdue payments detected.</p>
            </div>
          )}
        </div>

        {/* Recent Activity (Right 1 col) */}
        <div className="space-y-6">
          <RecentActivityFeed activities={activities} />
        </div>

      </div>
    </div>
  );
}
