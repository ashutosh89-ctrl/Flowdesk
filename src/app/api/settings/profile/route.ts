import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/utils/session';

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    return NextResponse.json({ success: true, profile: body });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
