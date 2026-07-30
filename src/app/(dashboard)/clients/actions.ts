'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ApiError, apiFetch } from '@/lib/api/server-fetch';
import type { Client } from '@/lib/api/types';

async function createClient(formData: FormData): Promise<string | null> {
  const clientCode = (formData.get('clientCode') as string)?.trim();
  const name = (formData.get('name') as string)?.trim();
  const contactEmail = (formData.get('contactEmail') as string)?.trim() || undefined;
  const contactPhone = (formData.get('contactPhone') as string)?.trim() || undefined;

  try {
    await apiFetch<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify({ clientCode, name, contactEmail, contactPhone }),
    });
  } catch (err) {
    return err instanceof ApiError ? err.message : 'Failed to create client';
  }

  revalidatePath('/clients');
  return null;
}

export async function createClientAction(_prevState: string | null, formData: FormData): Promise<string | null> {
  const error = await createClient(formData);
  if (error) return error;
  redirect('/clients');
}

/** Same as createClientAction but never redirects - used by the "Add client" modal, which stays on /clients and just closes itself on success. */
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

export async function updateClientAction(
  id: string,
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const error = await updateClient(id, formData);
  if (error) return error;
  redirect('/clients');
}

/** Same as updateClientAction but never redirects - used by the "Edit" modal, which stays on /clients and just closes itself on success. */
export async function updateClientModalAction(
  id: string,
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  return updateClient(id, formData);
}

export async function deactivateClientAction(id: string) {
  try {
    await apiFetch<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'INACTIVE' }),
    });
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'Failed to deactivate client';
    revalidatePath('/clients');
    redirect(`/clients?error=${encodeURIComponent(message)}`);
  }
  revalidatePath('/clients');
}
