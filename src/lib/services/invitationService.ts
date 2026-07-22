import { create, update, readAll } from './dataService';
import { logActivity } from './activityService';

export interface Invitation {
  id: string;
  clientId: string;
  email: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  sentAt: string;
  expiresAt: string;
}

export async function createInvitation(clientId: string, email: string): Promise<Invitation> {
  const token = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
  
  const sentAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days expiry

  const newInvitation: Invitation = {
    id: `inv_${Math.random().toString(36).substring(2, 9)}`,
    clientId,
    email: email.toLowerCase(),
    token,
    status: 'pending',
    sentAt,
    expiresAt
  };

  const saved = await create<Invitation>('invitations', newInvitation);

  // Log activity
  const workspaces = await readAll<any>('workspaces');
  const ws = workspaces.find(w => w.clientId === clientId);
  if (ws) {
    await logActivity({
      workspaceId: ws.id,
      type: 'comment_added', // Fallback to compatible activity log type or mock
      description: `Invitation sent to ${email}`
    });
  }

  // Update client status to onboarding
  await update('clients', clientId, { status: 'onboarding' });

  return saved;
}

export async function getInvitations(): Promise<Invitation[]> {
  return await readAll<Invitation>('invitations');
}

export async function getInvitationByToken(token: string): Promise<Invitation | null> {
  const list = await getInvitations();
  const found = list.find(x => x.token === token);
  return found || null;
}

export async function acceptInvitation(token: string): Promise<Invitation> {
  const inv = await getInvitationByToken(token);
  if (!inv) throw new Error('Invitation token not found');
  if (inv.status !== 'pending') throw new Error(`Invitation is already ${inv.status}`);
  if (new Date(inv.expiresAt).getTime() < Date.now()) {
    await update('invitations', inv.id, { status: 'expired' });
    throw new Error('Invitation token has expired');
  }

  const updated = await update<Invitation>('invitations', inv.id, { status: 'accepted' });
  await update('clients', inv.clientId, { status: 'active' });

  // Log activity
  const workspaces = await readAll<any>('workspaces');
  const ws = workspaces.find(w => w.clientId === inv.clientId);
  if (ws) {
    await logActivity({
      workspaceId: ws.id,
      type: 'status_changed',
      description: `Client portal access accepted by ${inv.email}`
    });
  }

  return updated;
}

export async function resendInvitation(invitationId: string): Promise<Invitation> {
  const list = await getInvitations();
  const inv = list.find(x => x.id === invitationId);
  if (!inv) throw new Error('Invitation not found');

  const token = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
  const sentAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const updated = await update<Invitation>('invitations', inv.id, {
    token,
    status: 'pending',
    sentAt,
    expiresAt
  });

  return updated;
}

export async function revokeInvitation(invitationId: string): Promise<Invitation> {
  const updated = await update<Invitation>('invitations', invitationId, { status: 'revoked' });
  return updated;
}
