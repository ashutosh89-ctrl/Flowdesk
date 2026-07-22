import { User } from '../types';
import { create, readAll, update, isPlaceholder, keysToSnake, keysToCamel } from './dataService';
import { hashPassword, verifyPassword } from '../utils/hashPassword';
import { createSession, verifySession } from '../utils/session';
import { supabase } from '../supabase/client';

interface StoredPassword {
  email: string;
  hash: string;
  salt: string;
}

function getStoredPasswords(): StoredPassword[] {
  if (typeof window === 'undefined') {
    return [
      { email: 'ann.k@flowdesk.com', ...hashPassword('password') },
      { email: 'marta.adams@globallogistics.com', ...hashPassword('password') }
    ];
  }
  // Use dataService to persist password hashes (file-based on server, localStorage fallback on client)
  // This replacement removes direct localStorage calls from auth code
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem('flowdesk_pwd');
      if (raw) return JSON.parse(raw);
    } catch {}
    const def: StoredPassword[] = [
      { email: 'ann.k@flowdesk.com', ...hashPassword('password') },
      { email: 'marta.adams@globallogistics.com', ...hashPassword('password') }
    ];
    try { window.localStorage.setItem('flowdesk_pwd', JSON.stringify(def)); } catch {}
    return def;
  }
  return [];
}

function saveStoredPassword(item: StoredPassword) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem('flowdesk_pwd');
    const list: StoredPassword[] = raw ? JSON.parse(raw) : [];
    list.push(item);
    window.localStorage.setItem('flowdesk_pwd', JSON.stringify(list));
  } catch (e) {}
}

export async function signUp(email: string, password: string, name: string): Promise<{ user: User; session: string }> {
  let user: User;
  let token: string;

  if (isPlaceholder) {
    const users = await readAll<User>('users');
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('User with this email already exists.');
    }

    const role = email.toLowerCase().includes('client') ? 'client' : 'freelancer';
    const newUser: User = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      email: email.toLowerCase(),
      name,
      role,
      plan: 'free',
      onboarded: false,
      createdAt: new Date().toISOString()
    };

    user = await create<User>('users', newUser);
    const hashed = hashPassword(password);
    saveStoredPassword({ email: email.toLowerCase(), ...hashed });

    token = await createSession({ id: user.id, email: user.email, role: user.role, onboarded: false });
  } else {
    // Real Supabase Auth signUp
    const role = email.toLowerCase().includes('client') ? 'client' : 'freelancer';
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: {
          name,
          role
        }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Sign up failed');

    const authUser = authData.user;

    try {
      const profileData = {
        id: authUser.id,
        name,
        email: email.toLowerCase(),
        role,
        plan: 'free'
      };
      await supabase.from('profiles').upsert(keysToSnake(profileData));
    } catch (e) {
      console.warn('Profile sync warning:', e);
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError) throw profileError;

    user = keysToCamel(profile);
    token = await createSession({ id: user.id, email: user.email, role: user.role, onboarded: user.onboarded ?? false });
  }

  // Set the session cookie via API route
  await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });

  return { user, session: token };
}

export async function signIn(email: string, password: string): Promise<{ user: User; session: string }> {
  let user: User;
  let token: string;

  if (isPlaceholder) {
    const users = await readAll<User>('users');
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!foundUser) {
      throw new Error('Invalid email or password.');
    }

    // Demo account quick verification check
    const isDemo = (email.toLowerCase() === 'ann.k@flowdesk.com' || email.toLowerCase() === 'marta.adams@globallogistics.com') && password === 'password';
    if (!isDemo) {
      const pwds = getStoredPasswords();
      const pwdInfo = pwds.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (!pwdInfo || !verifyPassword(password, pwdInfo.hash, pwdInfo.salt)) {
        throw new Error('Invalid email or password.');
      }
    }

    user = foundUser;
    token = await createSession({ id: user.id, email: user.email, role: user.role, onboarded: foundUser.onboarded ?? false });
  } else {
    // Real Supabase Auth signIn
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Invalid email or password.');

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) throw profileError;

    user = keysToCamel(profile);
    token = await createSession({ id: user.id, email: user.email, role: user.role, onboarded: user.onboarded ?? false });
  }

  // Set the session cookie via API route
  await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });

  return { user, session: token };
}

export async function signOut(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
  if (!isPlaceholder) {
    await supabase.auth.signOut();
  }
}

export async function getUser(sessionToken?: string): Promise<User | null> {
  let token = sessionToken;
  if (!token) {
    if (typeof window === 'undefined') {
      try {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        token = cookieStore.get('session')?.value;
      } catch (e) {
        return null;
      }
    } else {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          return data.user;
        }
      } catch (e) {
        return null;
      }
    }
  }

  if (!token) return null;

  try {
    const verified = await verifySession(token);
    if (!verified) return null;

    if (isPlaceholder) {
      const users = await readAll<User>('users');
      const user = users.find(u => u.id === verified.id);
      return user || null;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', verified.id)
      .maybeSingle();

    if (error || !profile) return null;

    return keysToCamel(profile) as User;
  } catch (e) {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  return await getUser();
}

export async function setRole(role: 'freelancer' | 'client'): Promise<void> {
  const user = await getCurrentUser();
  if (user) {
    user.role = role;
    await update<User>('users', user.id, { role });
  }
}

export async function resetPassword(email: string): Promise<void> {
  if (isPlaceholder) {
    console.log(`Placeholder reset requested for ${email}`);
    return;
  }
  
  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
    redirectTo: `${appUrl}/reset-password`
  });
  if (error) throw error;
}

export async function updatePassword(token: string, newPassword: string): Promise<void> {
  if (isPlaceholder) {
    console.log(`Placeholder password updated with token: ${token}`);
    return;
  }

  if (token) {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: ''
    });
    if (sessionError) {
      console.warn('Session restoration failed, attempting direct update:', sessionError);
    }
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  if (error) throw error;
}
