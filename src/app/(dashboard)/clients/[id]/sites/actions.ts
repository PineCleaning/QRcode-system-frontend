'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ApiError, apiFetch } from '@/lib/api/server-fetch';
import type { Site } from '@/lib/api/types';

async function createSite(clientCode: string, formData: FormData): Promise<string | null> {
  const businessName = (formData.get('businessName') as string)?.trim();
  const address = (formData.get('address') as string)?.trim() || undefined;

  try {
    await apiFetch<Site>(`/clients/${clientCode}/sites`, {
      method: 'POST',
      body: JSON.stringify({ businessName, address }),
    });
  } catch (err) {
    return err instanceof ApiError ? err.message : 'Failed to create site';
  }

  revalidatePath(`/clients/${clientCode}`);
  return null;
}

/** Used by the "Add site" modal - stays on /clients/[id] and closes itself on success. */
export async function createSiteModalAction(
  clientCode: string,
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  return createSite(clientCode, formData);
}

async function updateSite(siteId: string, clientCode: string, formData: FormData): Promise<string | null> {
  const businessName = (formData.get('businessName') as string)?.trim();
  const address = (formData.get('address') as string)?.trim() || undefined;
  const status = formData.get('status') as string;

  try {
    await apiFetch<Site>(`/sites/${siteId}`, {
      method: 'PUT',
      body: JSON.stringify({ businessName, address, status }),
    });
  } catch (err) {
    return err instanceof ApiError ? err.message : 'Failed to update site';
  }

  revalidatePath(`/clients/${clientCode}`);
  return null;
}

/** Used by the "Edit" site modal - stays on /clients/[id] and closes itself on success. */
export async function updateSiteModalAction(
  siteId: string,
  clientCode: string,
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  return updateSite(siteId, clientCode, formData);
}

export async function setSiteStatusAction(siteId: string, clientCode: string, status: 'ACTIVE' | 'INACTIVE') {
  try {
    await apiFetch<Site>(`/sites/${siteId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  } catch (err) {
    const verb = status === 'ACTIVE' ? 'activate' : 'deactivate';
    const message = err instanceof ApiError ? err.message : `Failed to ${verb} site`;
    revalidatePath(`/clients/${clientCode}`);
    redirect(`/clients/${clientCode}?error=${encodeURIComponent(message)}`);
  }
  revalidatePath(`/clients/${clientCode}`);
}
