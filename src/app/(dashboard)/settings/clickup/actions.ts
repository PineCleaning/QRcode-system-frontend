'use server';

import { revalidatePath } from 'next/cache';
import { ApiError, apiFetch } from '@/lib/api/server-fetch';

/** POSTs a freshly-generated ClickUp personal API token to the backend, which validates it and (on success) flips the connection back to CONNECTED. */
export async function reconnectClickupAction(_prevState: string | null, formData: FormData): Promise<string | null> {
  const token = (formData.get('token') as string)?.trim();
  if (!token) {
    return 'Paste the token you copied from ClickUp.';
  }

  try {
    await apiFetch('/clickup/reconnect-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  } catch (err) {
    return err instanceof ApiError ? err.message : 'Failed to reconnect ClickUp';
  }

  revalidatePath('/settings/clickup');
  // 'layout' revalidates (dashboard)/layout.tsx itself (matched via any
  // path under it) - needed so ClickupStatusBanner, which renders on
  // every dashboard page, drops immediately instead of only refreshing
  // whichever page the admin next happens to click into.
  revalidatePath('/clients', 'layout');
  return null;
}
