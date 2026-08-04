'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ApiError, apiFetch } from '@/lib/api/server-fetch';
import type { Client } from '@/lib/api/types';

async function createClient(formData: FormData): Promise<string | null> {
  const clientId = (formData.get('clientId') as string)?.trim();
  const name = (formData.get('name') as string)?.trim();
  const contactEmail = (formData.get('contactEmail') as string)?.trim() || undefined;
  const contactPhone = (formData.get('contactPhone') as string)?.trim() || undefined;

  try {
    await apiFetch<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify({ clientId, name, contactEmail, contactPhone }),
    });
  } catch (err) {
    return err instanceof ApiError ? err.message : 'Failed to create client';
  }

  revalidatePath('/clients');
  return null;
}

/** Used by the "Add client" modal - stays on /clients and closes itself on success. */
export async function createClientModalAction(_prevState: string | null, formData: FormData): Promise<string | null> {
  return createClient(formData);
}

async function updateClient(id: string, formData: FormData): Promise<string | null> {
  const name = (formData.get('name') as string)?.trim();
  const contactEmail = (formData.get('contactEmail') as string)?.trim() || undefined;
  const contactPhone = (formData.get('contactPhone') as string)?.trim() || undefined;
  const status = formData.get('status') as string;

  try {
    await apiFetch<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, contactEmail, contactPhone, status }),
    });
  } catch (err) {
    return err instanceof ApiError ? err.message : 'Failed to update client';
  }

  revalidatePath('/clients');
  revalidatePath(`/clients/${id}`);
  return null;
}

/** Used by the "Edit" modal - stays on /clients and closes itself on success. */
export async function updateClientModalAction(
  id: string,
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  return updateClient(id, formData);
}

export async function setClientStatusAction(id: string, status: 'ACTIVE' | 'INACTIVE') {
  try {
    await apiFetch<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  } catch (err) {
    const verb = status === 'ACTIVE' ? 'activate' : 'deactivate';
    const message = err instanceof ApiError ? err.message : `Failed to ${verb} client`;
    revalidatePath('/clients');
    redirect(`/clients?error=${encodeURIComponent(message)}`);
  }
  revalidatePath('/clients');
}
