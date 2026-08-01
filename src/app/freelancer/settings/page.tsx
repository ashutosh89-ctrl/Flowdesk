import { getSession } from '@/lib/supabase/server';
import { FreelancerSettingsClient } from '@/components/settings/FreelancerSettingsClient';
import { redirect } from 'next/navigation';

export default async function FreelancerSettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  return <FreelancerSettingsClient />;
}
