import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/supabase/server';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessions = [
    {
      id: 'sess_curr',
      device: 'Windows PC (Chrome 126)',
      ip: '192.168.1.6',
      lastActive: 'Active Now',
      isCurrent: true
    },
    {
      id: 'sess_mbp',
      device: 'MacBook Pro 16" (Safari 17)',
      ip: '68.12.94.110',
      lastActive: '2 days ago',
      isCurrent: false
    }
  ];

  return NextResponse.json({ sessions });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ success: true, message: 'Sessions revoked' });
}
