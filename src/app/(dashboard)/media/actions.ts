'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ApiError, apiFetch } from '@/lib/api/server-fetch';

export async function deleteMediaAction(mediaId: string) {
  try {
    await apiFetch(`/admin/media/${mediaId}`, { method: 'DELETE' });
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'Failed to delete media';
    revalidatePath('/media');
    redirect(`/media?error=${encodeURIComponent(message)}`);
  }
  revalidatePath('/media');
}
