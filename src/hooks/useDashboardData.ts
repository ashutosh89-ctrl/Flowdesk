import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface DashboardData {
  user: any;
  profile: any;
  business: any;
  subscription: any;
  clients: any[];
  projects: any[];
  invoices: any[];
  activities: any[];
  notifications: any[];
}

export function useDashboardData() {
  const supabase = createClient();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const [
        profileRes,
        businessRes,
        subscriptionRes,
        clientsRes,
        projectsRes,
        invoicesRes,
        activitiesRes,
        notificationsRes
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('business_settings').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('clients').select('*').eq('user_id', user.id),
        supabase.from('projects').select('*'),
        supabase.from('invoices').select('*'),
        supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('notifications').select('*').eq('user_id', user.id).eq('read', false),
      ]);

      setData({
        user,
        profile: profileRes.data,
        business: businessRes.data,
        subscription: subscriptionRes.data,
        clients: clientsRes.data || [],
        projects: projectsRes.data || [],
        invoices: invoicesRes.data || [],
        activities: activitiesRes.data || [],
        notifications: notificationsRes.data || [],
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, isLoading, error, refresh: loadData };
}
