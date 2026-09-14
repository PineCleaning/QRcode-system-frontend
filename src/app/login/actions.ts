'use server';

import { redirect } from 'next/navigation';
import { ApiError, apiFetch } from '@/lib/api/server-fetch';
import { createClient } from '@/lib/supabase/server';

const NETWORK_ERROR_MESSAGE = "Couldn't reach the server. Please check your connection and try again.";
const DEACTIVATED_MESSAGE = 'Your account has been deactivated. Please contact your administrator.';

export async function login(_prevState: string | null, formData: FormData): Promise<string | null> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();

  let error: { message: string } | null;
  try {
    ({ error } = await supabase.auth.signInWithPassword({ email, password }));
  } catch {
    // A genuine network failure (Supabase unreachable) throws rather than
    // returning { error }, surfacing as a raw "fetch failed" - not
    // something a non-technical admin should ever see on screen.
    return NETWORK_ERROR_MESSAGE;
  }

  if (error) {
    return error.message === 'fetch failed' ? NETWORK_ERROR_MESSAGE : error.message;
  }

  // Supabase Auth has no concept of our own admin_users.status - a
  // deactivated admin's credentials are still accepted above. This is
  // the first backend call after sign-in, and it's where that actually
  // gets caught: SupabaseAuthGuard requires status === 'ACTIVE' and
  // rejects with this exact message otherwise. If that's why it failed,
  // sign the just-created session back out and stop here instead of
  // redirecting into a dashboard that would immediately fail on every
  // request. Any OTHER failure (e.g. the backend briefly down) still
  // doesn't block login - this call's real purpose is best-effort "Last
  // Login" tracking, not gatekeeping, and shouldn't turn away an active
  // admin over a transient error.
  try {
    await apiFetch('/auth/record-login', { method: 'POST' });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && err.message === 'Not an active admin user') {
      await supabase.auth.signOut({ scope: 'local' });
      return DEACTIVATED_MESSAGE;
    }
  }

  redirect('/clients');
}

export async function logout() {
  const supabase = await createClient();
  // Explicit 'local' scope - the default is 'global', which revokes the
  // admin's session on every device/tab they're logged in on, not just
  // this one. Signing out on a phone shouldn't silently log you out of
  // a laptop session too.
  await supabase.auth.signOut({ scope: 'local' });
  redirect('/login');
}
