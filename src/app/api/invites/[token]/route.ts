import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * GET /api/invites/[token] — public invite lookup by token.
 * Uses the service-role client because the accepting client is not yet
 * authenticated (RLS only exposes a freelancer's own invites).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const { data, error } = await supabaseAdmin
    .from('client_invites')
    .select('*')
    .eq('token', token)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 });
  }

  const isPendingExpired = data.status === 'pending' && new Date(data.expires_at).getTime() < Date.now();
  const status = isPendingExpired ? 'expired' : data.status;

  return NextResponse.json({
    id: data.id,
    email: data.client_email,
    status,
    sentAt: data.created_at,
    expiresAt: data.expires_at,
  });
}
