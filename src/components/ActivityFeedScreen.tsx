import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppContext';
import { supabase } from '../lib/supabase/client';
import { isPlaceholder, readAll, keysToCamel } from '../lib/services/dataService';
import { Activity } from '../lib/types';
import { 
  Bell, RefreshCw, FileText, Receipt, MessageSquare, 
  CheckCircle, HelpCircle, Compass, Search, Calendar, ChevronRight
} from 'lucide-react';

type ActivityFilter = 'all' | 'documents' | 'invoices' | 'comments' | 'approvals' | 'payments';

export default function ActivityFeedScreen() {
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
        // Fallback to local activities
        const allActs = await readAll<Activity>('activities');
        // Sort descending
        const sorted = allActs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // Filter locally
        const filtered = sorted.filter(act => {
          if (activeFilter === 'all') return true;
          if (activeFilter === 'documents') return act.type === 'document_uploaded';
          if (activeFilter === 'invoices') return act.type === 'invoice_created';
          if (activeFilter === 'comments') return act.type === 'comment_added';
          if (activeFilter === 'approvals') return act.type === 'deliverable_approved';
          if (activeFilter === 'payments') return act.type === 'payment_received';
          return true;
        });

        // Paginate locally
        const limit = 20;
        const startIndex = 0;
        const endIndex = currentPage * limit;
        const paginated = filtered.slice(startIndex, endIndex);

        setActivities(paginated);
        setHasMore(filtered.length > paginated.length);
      } else {
        // Real Supabase queries
        let query = supabase
          .from('activities')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        // Apply filters in Supabase
        if (activeFilter === 'documents') {
          query = query.in('type', ['document_uploaded', 'document_verified']);
        } else if (activeFilter === 'invoices') {
          query = query.in('type', ['invoice_created', 'invoice_reminder_sent', 'invoice_paid']);
        } else if (activeFilter === 'comments') {
          query = query.eq('type', 'comment_added');
        } else if (activeFilter === 'approvals') {
          query = query.in('type', ['deliverable_approved', 'deliverable_revision_requested']);
        } else if (activeFilter === 'payments') {
          query = query.in('type', ['invoice_paid', 'status_changed']); // fallback/matching
        }

        // Real offset-based paging
        const limit = 20;
        const from = (currentPage - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

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
      }
    } catch (e: any) {
      console.error('Error fetching activities:', e);
      addToast(e.message || 'Failed to load activities', 'warning');
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
    addToast('Activity feed refreshed', 'info');
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
    <div className="flex-1 flex flex-col overflow-hidden bg-white/10">
      {/* Header Bar */}
      <header className="h-16 border-b border-gray-200/50 px-8 flex items-center justify-between bg-white/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Activity Logs</h1>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-900 text-white rounded-full">
            REALTIME REPO
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-900 transition-colors hover:bg-black/5 rounded-full cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Feed
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        
        {/* Screen Intro */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Workspace Telemetry</h2>
            <p className="text-sm text-gray-500 font-medium">Browse, monitor, and trace client interaction events across your workspace projects.</p>
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap gap-2 pb-2">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => {
                  setActiveFilter(filter.id);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-gray-900 text-white shadow-md scale-102' 
                    : 'bg-white/50 text-gray-500 hover:bg-white/80 border border-gray-200/40 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {filter.name}
              </button>
            );
          })}
        </div>

        {/* Timeline View */}
        <div className="glass-card rounded-xl p-8 max-w-4xl border border-white/80">
          <div className="space-y-8 relative">
            {activities.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-sm font-bold text-gray-400">No activities found matching this filter.</p>
                <button
                  onClick={handleRefresh}
                  className="mt-4 px-4 py-2 bg-gray-900 text-white font-semibold text-xs rounded-full hover:bg-gray-800"
                >
                  Sync System Now
                </button>
              </div>
            ) : (
              activities.map((act, i) => {
                const date = new Date(act.createdAt);
                return (
                  <motion.div 
                    key={act.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    className="flex gap-6 relative group"
                  >
                    {/* Continuous vertical timeline connector */}
                    {i < activities.length - 1 && (
                      <div className="absolute left-3 top-8 bottom-[-32px] w-[1px] bg-gray-200/60"></div>
                    )}
                    
                    {/* Event point bullet */}
                    <div className="w-6.5 h-6.5 rounded-full bg-white border border-gray-200 shadow-xs flex items-center justify-center shrink-0 z-10">
                      <div className="w-2.5 h-2.5 bg-gray-950 rounded-full animate-pulse"></div>
                    </div>

                    <div className="flex-1 bg-white/40 hover:bg-white/70 border border-gray-200/20 hover:border-gray-300/40 rounded-xl p-4 transition-all flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-800 leading-relaxed">{act.description}</p>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <span>Event ID: {act.id.substring(0, 8)}</span>
                          <span>•</span>
                          <span>Type: {act.type.replace('_', ' ')}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-semibold text-gray-900 block">
                          {date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 block mt-0.5">
                          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Load More Trigger */}
          {hasMore && activities.length > 0 && (
            <div className="pt-8 text-center border-t border-gray-100 mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs rounded-full transition-all cursor-pointer inline-flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  'Load More History'
                )}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
