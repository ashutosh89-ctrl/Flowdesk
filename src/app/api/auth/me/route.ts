import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/utils/session';
import { readAll } from '@/lib/services/dataService';
import { User } from '@/lib/types';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionUser = await verifySession(token);
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch full user profile from the database
  const users = await readAll<User>('users');
  const fullUser = users.find(u => u.id === sessionUser.id) || null;

  if (!fullUser) {
    // Fall back to session data if user not in DB
    return NextResponse.json({ user: sessionUser });
  }

  return NextResponse.json({ user: fullUser });
}
