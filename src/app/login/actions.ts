'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const NETWORK_ERROR_MESSAGE = "Couldn't reach the server. Please check your connection and try again.";

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
