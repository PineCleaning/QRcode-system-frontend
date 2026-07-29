'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ApiError, apiFetch } from '@/lib/api/server-fetch';
import type { Site } from '@/lib/api/types';

export async function createSiteAction(
  clientId: string,
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
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
  redirect(`/clients/${clientId}`);
}

export async function updateSiteAction(
  siteId: string,
  clientId: string,
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
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
  redirect(`/clients/${clientId}`);
}

export async function deactivateSiteAction(siteId: string, clientId: string) {
  try {
    await apiFetch<Site>(`/sites/${siteId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'INACTIVE' }),
    });
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'Failed to deactivate site';
    revalidatePath(`/clients/${clientId}`);
    redirect(`/clients/${clientId}?error=${encodeURIComponent(message)}`);
  }
  revalidatePath(`/clients/${clientId}`);
}
