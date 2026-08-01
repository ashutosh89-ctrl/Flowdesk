'use client';
import React, { useState, useEffect } from 'react';
import { useApp } from '@/components/AppContext';
import { getDataClient } from '@/lib/supabase/data';
import { isPlaceholder, readAll, keysToCamel } from '@/lib/services/dataService';
import { Activity } from '@/lib/types';
import { 
  Bell, RefreshCw, FileText, Receipt, MessageSquare, 
  CheckCircle, Compass, Calendar, ChevronRight, Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type ActivityFilter = 'all' | 'documents' | 'invoices' | 'comments' | 'approvals' | 'payments';

export default function ActivityClient() {
  const { user, addToast } = useApp();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ActivityFilter>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchActivities = async (currentPage: number, append = false) => {
    if (!user) return;
    setLoading(true);

    try {
      if (isPlaceholder) {
        const allActs = await readAll<Activity>('activities');
        const sorted = allActs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        const filtered = sorted.filter(act => {
          if (activeFilter === 'all') return true;
          if (activeFilter === 'documents') return act.type === 'document_uploaded';
          if (activeFilter === 'invoices') return act.type === 'invoice_created';
          if (activeFilter === 'comments') return act.type === 'comment_added';
          if (activeFilter === 'approvals') return act.type === 'deliverable_approved';
          if (activeFilter === 'payments') return act.type === 'payment_received';
          return true;
        });

        const limit = 20;
        const startIndex = 0;
        const endIndex = currentPage * limit;
        const paginated = filtered.slice(startIndex, endIndex);

        setActivities(paginated);
        setHasMore(filtered.length > paginated.length);
      } else {
        const supabase = getDataClient();
        let query = supabase
          .from('activities')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (activeFilter === 'documents') {
          query = query.in('type', ['document_uploaded', 'document_verified']);
        } else if (activeFilter === 'invoices') {
          query = query.in('type', ['invoice_created', 'invoice_reminder_sent', 'invoice_paid']);
        } else if (activeFilter === 'comments') {
          query = query.eq('type', 'comment_added');
        } else if (activeFilter === 'approvals') {
          query = query.in('type', ['deliverable_approved', 'deliverable_revision_requested']);
        } else if (activeFilter === 'payments') {
          query = query.in('type', ['invoice_paid', 'status_changed']);
        }

        const limit = 20;
        const from = (currentPage - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        try {
          const { data, error } = await query;
          if (error) throw error;

          const converted = keysToCamel(data || []) as Activity[];
          if (append) {
            setActivities(prev => [...prev, ...converted]);
            setHasMore(converted.length === limit);
          } else {
            setActivities(converted);
            setHasMore(converted.length === limit);
          }
        } catch (dbErr) {
          console.warn('Supabase activities table offline, loading fallback feed:', dbErr);
          const seedActs = await readAll<Activity>('activities');
          setActivities(seedActs);
        }

      }
    } catch (e: any) {
      console.warn('Fallback activities loader:', e);
    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchActivities(1, false);
  }, [activeFilter, user]);

  const handleRefresh = () => {
    setPage(1);
    fetchActivities(1, false);
    addToast('Activity logs synchronized', 'success');
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchActivities(nextPage, true);
  };

  const filters: { id: ActivityFilter; name: string; icon: any }[] = [
    { id: 'all', name: 'All Activities', icon: Compass },
    { id: 'documents', name: 'Documents', icon: FileText },
    { id: 'invoices', name: 'Invoices', icon: Receipt },
    { id: 'comments', name: 'Comments', icon: MessageSquare },
    { id: 'approvals', name: 'Approvals', icon: CheckCircle },
    { id: 'payments', name: 'Payments', icon: Calendar },
  ];

  return (
    <div className="flex-grow flex flex-col overflow-hidden font-sans h-full bg-[#F5F5F3]">
      {/* Header Bar */}
      <div className="h-16 border-b border-black/5 px-6 flex items-center justify-between bg-white/40 shrink-0">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Activity Telemetry</span>
          <h2 className="text-base font-extrabold text-gray-950 mt-0.5">Workspace Logs</h2>
        </div>

        <button 
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-bold text-xs rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Sync Feed
        </button>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Filters bar */}
        <div className="flex flex-wrap gap-2 pb-2 border-b border-black/5">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-gray-900 text-white shadow-sm' 
                    : 'bg-white hover:bg-gray-50 border border-black/10 text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {filter.name}
              </button>
            );
          })}
        </div>

        {/* Timeline List */}
        <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm max-w-3xl">
          <div className="space-y-6 relative">
            {activities.length === 0 ? (
              <div className="text-center py-12 text-xs font-semibold text-gray-405">
                No activities found matching this filter.
              </div>
            ) : (
              activities.map((act, i) => {
                const date = new Date(act.createdAt);
                return (
                  <div key={act.id} className="flex gap-4 relative">
                    {i < activities.length - 1 && (
                      <div className="absolute left-2 top-6 bottom-[-24px] w-[1px] bg-black/5" />
                    )}
                    
                    <div className="w-4.5 h-4.5 rounded-full bg-gray-950 shrink-0 mt-1 flex items-center justify-center relative z-10">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>

                    <div className="flex-grow bg-gray-50/50 hover:bg-gray-50 border border-black/5 rounded-xl p-4 transition-all flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-800 leading-relaxed">{act.description}</p>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                          <span>ID: {act.id.substring(0, 8)}</span>
                          <span>•</span>
                          <span>Type: {act.type.replace('_', ' ')}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-bold text-[10px]">
                        <span className="text-gray-900 block">
                          {date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-gray-400 block mt-0.5">
                          {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Load More Button */}
          {hasMore && activities.length > 0 && (
            <div className="pt-6 text-center border-t border-black/5 mt-6">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-black/10 text-gray-700 font-bold text-xs rounded-full transition-all cursor-pointer inline-flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load More logs'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
