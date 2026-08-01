import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/utils/session';

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true, message: 'Account deleted' });
  response.cookies.set('flowdesk_session', '', { maxAge: 0 });
  return response;
}
