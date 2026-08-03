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

/**
 * Deletes a single attachment (from Cloudinary and the DB, via the same
 * DELETE /admin/media/:id the Assets page already uses) from wherever
 * it's shown - the Feedback page's attachments dropdown, in this case.
 * Always revalidates /assets too, since the deleted file must also
 * disappear from there, not just from the page this was called on.
 */
export async function deleteAttachmentAction(mediaId: string, pathToRevalidate: string) {
  try {
    await apiFetch(`/admin/media/${mediaId}`, { method: 'DELETE' });
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'Failed to delete attachment';
    revalidatePath(pathToRevalidate);
    revalidatePath('/assets');
    redirect(`${pathToRevalidate}?error=${encodeURIComponent(message)}`);
  }
  revalidatePath(pathToRevalidate);
  revalidatePath('/assets');
}
