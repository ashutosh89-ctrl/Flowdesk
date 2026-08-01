import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/supabase/server';

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const exportData = {
    exportedAt: new Date().toISOString(),
    userId: session.id,
    email: session.email,
    name: (session as any).name || 'User',
    role: session.role
  };

  return NextResponse.json(exportData);
}
