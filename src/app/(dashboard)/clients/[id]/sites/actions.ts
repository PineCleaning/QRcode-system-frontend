'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ApiError, apiFetch } from '@/lib/api/server-fetch';
import type { Site } from '@/lib/api/types';

async function createSite(clientId: string, formData: FormData): Promise<string | null> {
  const siteName = (formData.get('siteName') as string)?.trim();
  const address = (formData.get('address') as string)?.trim() || undefined;

  try {
    await apiFetch<Site>(`/clients/${clientId}/sites`, {
      method: 'POST',
      body: JSON.stringify({ siteName, address }),
    });
  } catch (err) {
    return err instanceof ApiError ? err.message : 'Failed to create site';
  }

  revalidatePath(`/clients/${clientId}`);
  return null;
}

/** Used by the "Add site" modal - stays on /clients/[id] and closes itself on success. */
export async function createSiteModalAction(
  clientId: string,
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  return createSite(clientId, formData);
}

async function updateSite(siteId: string, clientId: string, formData: FormData): Promise<string | null> {
  const siteName = (formData.get('siteName') as string)?.trim();
  const address = (formData.get('address') as string)?.trim() || undefined;
  const status = formData.get('status') as string;

  try {
    await apiFetch<Site>(`/sites/${siteId}`, {
      method: 'PUT',
      body: JSON.stringify({ siteName, address, status }),
    });
  } catch (err) {
    return err instanceof ApiError ? err.message : 'Failed to update site';
  }

  revalidatePath(`/clients/${clientId}`);
  return null;
}

/** Used by the "Edit" site modal - stays on /clients/[id] and closes itself on success. */
export async function updateSiteModalAction(
  siteId: string,
  clientId: string,
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  return updateSite(siteId, clientId, formData);
}

export async function setSiteStatusAction(siteId: string, clientId: string, status: 'ACTIVE' | 'INACTIVE') {
  try {
    await apiFetch<Site>(`/sites/${siteId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  } catch (err) {
    const verb = status === 'ACTIVE' ? 'activate' : 'deactivate';
    const message = err instanceof ApiError ? err.message : `Failed to ${verb} site`;
    revalidatePath(`/clients/${clientId}`);
    redirect(`/clients/${clientId}?error=${encodeURIComponent(message)}`);
  }
  revalidatePath(`/clients/${clientId}`);
}
