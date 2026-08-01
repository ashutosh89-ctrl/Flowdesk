"use client";
import React, { useState, useEffect } from 'react';
import { Activity } from '../../lib/types';
import { Loader2 } from 'lucide-react';

export function ActivityTab({ workspaceId, activities }: { workspaceId?: string; activities?: Activity[] }) {
  const [events, setEvents] = useState<Activity[]>(activities || []);
  const [loading, setLoading] = useState(!activities);

  useEffect(() => {
    if (activities) {
      setEvents(activities);
      setLoading(false);
      return;
    }
    if (!workspaceId) return;

    async function loadEvents() {
      try {
        const res = await fetch(`/api/activities?workspaceId=${workspaceId}`);
        const data = await res.json();
        setEvents(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (e) {
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, [workspaceId, activities]);

  if (loading) {
    return (
      <div className="text-xs font-semibold text-gray-400 py-8 flex items-center gap-1.5 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading activities...
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <p className="text-xs text-gray-400 font-semibold py-8 text-center bg-white rounded-2xl border border-black/5">
        No activities recorded yet.
      </p>
    );
  }

  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  const isYesterday = (dateStr: string) => {
    const d = new Date(dateStr);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return d.getDate() === yesterday.getDate() &&
           d.getMonth() === yesterday.getMonth() &&
           d.getFullYear() === yesterday.getFullYear();
  };

  const todayEvents = events.filter(e => isToday(e.createdAt));
  const yesterdayEvents = events.filter(e => isYesterday(e.createdAt));
  const earlierEvents = events.filter(e => !isToday(e.createdAt) && !isYesterday(e.createdAt));

  const renderSection = (title: string, list: Activity[]) => {
    if (list.length === 0) return null;
    return (
      <div className="space-y-3">
        <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">{title}</h4>
        <div className="space-y-2">
          {list.map(e => (
            <div key={e.id} className="bg-white rounded-xl p-3 border border-black/5 flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-800">{e.description}</span>
              <span className="text-[10px] text-gray-400 font-bold">
                {new Date(e.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderSection('Today', todayEvents)}
      {renderSection('Yesterday', yesterdayEvents)}
      {renderSection('Earlier', earlierEvents)}
    </div>
  );
}
