import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * POST /api/invites/accept
 * Body: { token, name, password }
 *
 * Accepts a client invitation end-to-end using the service-role client:
 *  1. Verifies the invite is pending and not expired
 *  2. Creates the auth user (email_confirm: true so they can sign in)
 *  3. Creates their client profile
 *  4. Marks the invite accepted + links client_id
 *  5. Activates the matching clients record for the freelancer
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { token, name, password } = body;

  if (!token || !name || typeof password !== 'string' || password.length < 8) {
    return NextResponse.json(
      { error: 'Name and a password of at least 8 characters are required' },
      { status: 400 }
    );
  }

  const { data: invite, error } = await supabaseAdmin
    .from('client_invites')
    .select('*')
    .eq('token', token)
    .maybeSingle();

  if (error || !invite) {
    return NextResponse.json({ error: 'Invalid invitation link' }, { status: 404 });
  }

  if (invite.status !== 'pending') {
    return NextResponse.json(
      { error: `This invitation has already been ${invite.status}` },
      { status: 400 }
    );
  }

  if (new Date(invite.expires_at).getTime() < Date.now()) {
    await supabaseAdmin.from('client_invites').update({ status: 'expired' }).eq('id', invite.id);
    return NextResponse.json({ error: 'This invitation link has expired' }, { status: 410 });
  }

  // 1. Create the auth user
  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: invite.client_email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name, role: 'client' },
  });

  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message || 'Could not create your account' },
      { status: 400 }
    );
  }

  const userId = created.user.id;

  // 2. Create the client profile (skip onboarding for clients)
  await supabaseAdmin.from('profiles').upsert({
    id: userId,
    email: invite.client_email,
    name,
    role: 'client',
    onboarding_completed: true,
  });

  // 3. Mark the invite accepted
  await supabaseAdmin
    .from('client_invites')
    .update({ status: 'accepted', client_id: userId })
    .eq('id', invite.id);

  // 4. Activate the freelancer's matching client record
  if (invite.client_record_id) {
    await supabaseAdmin
      .from('clients')
      .update({ status: 'active' })
      .eq('id', invite.client_record_id);
  } else {
    await supabaseAdmin
      .from('clients')
      .update({ status: 'active' })
      .eq('user_id', invite.freelancer_id)
      .eq('email', invite.client_email);
  }

  return NextResponse.json({ success: true });
}
