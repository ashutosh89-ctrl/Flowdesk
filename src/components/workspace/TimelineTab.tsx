"use client";
import React, { useState, useEffect } from 'react';
import { Activity } from '../../lib/types';
import { Loader2 } from 'lucide-react';

export function TimelineTab({ workspaceId, activities }: { workspaceId?: string; activities?: Activity[] }) {
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
        <Loader2 className="w-4 h-4 animate-spin" /> 
        Loading timeline...
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <p className="text-xs text-gray-400 font-semibold py-8 text-center bg-white rounded-2xl border border-black/5">
        No timeline events recorded yet.
      </p>
    );
  }

  return (
    <div className="relative pl-6 border-l border-gray-200 space-y-6 ml-4 mt-2 font-sans">
      {events.map((event, i) => (
        <div key={event.id} className="relative">
          <div className={`absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full border-2 ${
            i === 0 ? 'bg-gray-950 border-gray-950' : 'bg-white border-gray-300'
          }`} />
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 hover:shadow-md transition-shadow text-xs">
            <p className="font-bold text-gray-900 leading-normal">{event.description}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
              {new Date(event.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}{' • '}{new Date(event.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
