'use server';

import { revalidatePath } from 'next/cache';
import { ApiError, apiFetch } from '@/lib/api/server-fetch';
import type { AdminUserRecord } from '@/lib/api/types';

export async function updateOwnProfileAction(_prevState: string | null, formData: FormData): Promise<string | null> {
  const fullName = (formData.get('fullName') as string)?.trim();

  try {
    await apiFetch<AdminUserRecord>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify({ fullName }),
    });
  } catch (err) {
    return err instanceof ApiError ? err.message : 'Failed to update profile';
  }

  // Nothing in the nav currently displays fullName, but this keeps every
  // server-rendered page's copy of the current admin fresh for later
  // navigations rather than only fixing the popup's own local state.
  revalidatePath('/', 'layout');
  return null;
}
