'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ApiError, apiFetch } from '@/lib/api/server-fetch';
import type { Client } from '@/lib/api/types';

export async function createClientAction(_prevState: string | null, formData: FormData): Promise<string | null> {
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
  redirect('/clients');
}

export async function updateClientAction(
  id: string,
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
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
  redirect(`/clients/${id}`);
}

export async function deleteClientAction(id: string) {
  try {
    await apiFetch(`/clients/${id}`, { method: 'DELETE' });
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'Failed to delete client';
    revalidatePath('/clients');
    redirect(`/clients?error=${encodeURIComponent(message)}`);
  }
  revalidatePath('/clients');
  redirect('/clients');
}
