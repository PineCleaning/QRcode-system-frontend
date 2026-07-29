'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ApiError, apiFetch } from '@/lib/api/server-fetch';

/**
 * Shared between the global /feedback page and each site's own
 * /clients/[id]/sites/[siteId]/feedback page - both just need to know
 * which path to revalidate/redirect back to after retrying.
 */
export async function retryFeedbackAction(feedbackId: string, pathToRevalidate: string) {
  try {
    await apiFetch(`/admin/feedback/${feedbackId}/retry`, { method: 'POST' });
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'Failed to retry delivery';
    revalidatePath(pathToRevalidate);
    redirect(`${pathToRevalidate}?error=${encodeURIComponent(message)}`);
  }
  revalidatePath(pathToRevalidate);
}
