import { getDataClient } from '../supabase/data';

export interface Invitation {
  id: string;
  clientId: string;
  email: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  sentAt: string;
  expiresAt: string;
}

/**
 * Map a client_invites row (snake_case) to the app's Invitation shape.
 * Exportable so server components can reuse it with the server client.
 */
export function mapInviteToInvitation(row: any, clientId: string): Invitation {
  const isPendingExpired =
    row.status === 'pending' && new Date(row.expires_at).getTime() < Date.now();

  return {
    id: row.id,
    clientId: row.client_record_id || clientId,
    email: row.client_email,
    token: row.token,
    status: isPendingExpired ? 'expired' : (row.status as Invitation['status']),
    sentAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

/**
 * Create a client invitation (freelancer side, authenticated via RLS).
 * Persists to the `client_invites` table and marks the client as onboarding.
 */
export async function createInvitation(clientId: string, email: string): Promise<Invitation> {
  const supabase = getDataClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const token =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15);

  const now = new Date();
  const sentAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  const { data, error } = await supabase
    .from('client_invites')
    .insert({
      freelancer_id: user.id,
      client_record_id: clientId,
      client_email: email.toLowerCase(),
      token,
      expires_at: expiresAt,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;

  // Mark the client as onboarding
  await supabase.from('clients').update({ status: 'onboarding' }).eq('id', clientId);

  return mapInviteToInvitation(data, clientId);
}

/**
 * List invitations created by the current freelancer.
 */
export async function getInvitations(): Promise<Invitation[]> {
  const supabase = getDataClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('client_invites')
    .select('*')
    .eq('freelancer_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return (data || []).map((r: any) => mapInviteToInvitation(r, r.client_record_id || ''));
}

/**
 * Public (anonymous) invite lookup by token — routed through the admin API
 * because the client isn't authenticated yet (RLS only exposes the
 * freelancer's own invites).
 */
export async function getInvitationByToken(token: string): Promise<Invitation | null> {
  try {
    const res = await fetch(`/api/invites/${encodeURIComponent(token)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      id: data.id,
      clientId: '',
      email: data.email,
      token,
      status: data.status,
      sentAt: data.sentAt,
      expiresAt: data.expiresAt,
    };
  } catch {
    return null;
  }
}

/**
 * Accept an invitation: creates the auth user, their client profile, links the
 * client record, and marks the invite accepted. Performed server-side with the
 * service-role client so it works before the client has a session.
 */
export async function acceptInvitation(token: string, name: string, password: string): Promise<void> {
  const res = await fetch('/api/invites/accept', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, name, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to accept invitation');
  }
}

/**
 * Resend an invitation: rotate the token and reset status to pending.
 */
export async function resendInvitation(invitationId: string): Promise<Invitation> {
  const supabase = getDataClient();
  const token =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15);

  const now = new Date();
  const sentAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('client_invites')
    .update({ token, status: 'pending', expires_at: expiresAt })
    .eq('id', invitationId)
    .select()
    .single();

  if (error) throw error;
  return mapInviteToInvitation(data, data.client_record_id || '');
}

/**
 * Revoke an invitation.
 */
export async function revokeInvitation(invitationId: string): Promise<Invitation> {
  const supabase = getDataClient();
  const { data, error } = await supabase
    .from('client_invites')
    .update({ status: 'revoked' })
    .eq('id', invitationId)
    .select()
    .single();

  if (error) throw error;
  return mapInviteToInvitation(data, data.client_record_id || '');
}
