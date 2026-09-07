'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ApiError, apiFetch } from '@/lib/api/server-fetch';
import type { SiteInspection } from '@/lib/api/types';

export interface InspectionItemMediaInput {
  cloudinaryPublicId: string;
  resourceType: 'IMAGE' | 'VIDEO';
  originalFilename?: string;
  mimeType: string;
  sizeBytes: number;
}

/**
 * Mirrors inventory/actions.ts's buildBody() exactly - (prevState, formData)
 * dispatched through <form action>/useActionState is what gives Next.js's
 * combined mutation+revalidation single round trip (see InspectionItemForm's
 * two-phase submit for why this matters: a plain awaited function call, even
 * inside startTransition, does NOT get that combined request - the
 * revalidated page data comes back as a separate follow-up round trip,
 * which is what caused the visible gap between the modal closing and the
 * table updating).
 *
 * media is JSON-stringified into a hidden field by InspectionItemForm once
 * any Cloudinary uploads finish - see that component for the two-phase
 * submit (upload first, then trigger the real form submission) needed to
 * still support an async pre-step ahead of a native form dispatch.
 */
function buildBody(formData: FormData) {
  const isNotApplicable = formData.get('isNotApplicable') === 'true';
  const rating = (formData.get('rating') as string) || '';
  const percentage = formData.get('percentage') as string;
  const notes = (formData.get('notes') as string)?.trim();
  const mediaJson = formData.get('media') as string;

  return {
    spaceName: (formData.get('spaceName') as string)?.trim(),
    isNotApplicable,
    rating: isNotApplicable || !rating ? undefined : rating,
    percentage: isNotApplicable || !percentage ? undefined : Number(percentage),
    notes: notes || undefined,
    media: mediaJson ? (JSON.parse(mediaJson) as InspectionItemMediaInput[]) : undefined,
  };
}

async function createInspectionItem(inspectionId: string, path: string, formData: FormData): Promise<string | null> {
  try {
    await apiFetch(`/inspections/${inspectionId}/items`, {
      method: 'POST',
      body: JSON.stringify(buildBody(formData)),
    });
  } catch (err) {
    return err instanceof ApiError ? err.message : 'Failed to add inspection item';
  }
  revalidatePath(path);
  return null;
}

/** Used by the "Add item" modal - stays on the inspections page and closes itself on success. */
export async function createInspectionItemModalAction(
  inspectionId: string,
  path: string,
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  return createInspectionItem(inspectionId, path, formData);
}

async function updateInspectionItem(itemId: string, path: string, formData: FormData): Promise<string | null> {
  try {
    await apiFetch(`/inspections/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(buildBody(formData)),
    });
  } catch (err) {
    return err instanceof ApiError ? err.message : 'Failed to update inspection item';
  }
  revalidatePath(path);
  return null;
}

/** Used by the "Edit" modal - stays on the inspections page and closes itself on success. */
export async function updateInspectionItemModalAction(
  itemId: string,
  path: string,
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  return updateInspectionItem(itemId, path, formData);
}

export async function openOrResumeInspectionAction(siteId: string): Promise<SiteInspection> {
  return apiFetch<SiteInspection>(`/sites/${siteId}/inspections`, { method: 'POST' });
}

/**
 * Deletes a single inspection photo/video - from Cloudinary and the DB
 * - same pattern and same AttachmentsCell component as the Feedback
 * page's attachments. Admin-only server-side (RolesGuard); the UI
 * doesn't gate the icon on role either, matching how AttachmentsCell
 * already behaves on the Feedback page (backend 403 is the real
 * enforcement there too).
 */
export async function deleteInspectionMediaAction(mediaId: string, pathToRevalidate: string) {
  try {
    await apiFetch(`/inspections/media/${mediaId}`, { method: 'DELETE' });
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'Failed to delete attachment';
    revalidatePath(pathToRevalidate);
    redirect(`${pathToRevalidate}?error=${encodeURIComponent(message)}`);
  }
  revalidatePath(pathToRevalidate);
}
