'use server';

import { revalidatePath } from 'next/cache';
import { ApiError, apiFetch } from '@/lib/api/server-fetch';
import type { InventoryItem } from '@/lib/api/types';

function buildBody(formData: FormData) {
  const lastSupplyDate = (formData.get('lastSupplyDate') as string)?.trim();
  const notes = (formData.get('notes') as string)?.trim();
  return {
    item: (formData.get('item') as string)?.trim(),
    category: formData.get('category') as string,
    status: formData.get('status') as string,
    quantity: Number(formData.get('quantity')),
    lastSupplyDate: lastSupplyDate || undefined,
    notes: notes || undefined,
  };
}

async function createInventoryItem(siteId: string, path: string, formData: FormData): Promise<string | null> {
  try {
    await apiFetch<InventoryItem>(`/sites/${siteId}/inventory`, {
      method: 'POST',
      body: JSON.stringify(buildBody(formData)),
    });
  } catch (err) {
    return err instanceof ApiError ? err.message : 'Failed to create inventory item';
  }
  revalidatePath(path);
  return null;
}

/** Used by the "Add item" modal - stays on the inventory page and closes itself on success. */
export async function createInventoryItemModalAction(
  siteId: string,
  path: string,
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  return createInventoryItem(siteId, path, formData);
}

async function updateInventoryItem(id: string, path: string, formData: FormData): Promise<string | null> {
  try {
    await apiFetch<InventoryItem>(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(buildBody(formData)),
    });
  } catch (err) {
    return err instanceof ApiError ? err.message : 'Failed to update inventory item';
  }
  revalidatePath(path);
  return null;
}

/** Used by the "Edit" modal - stays on the inventory page and closes itself on success. */
export async function updateInventoryItemModalAction(
  id: string,
  path: string,
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  return updateInventoryItem(id, path, formData);
}

/** Delete is Admin-only server-side (RolesGuard) - the UI only shows this action to Admins, but the real enforcement is the backend 403. */
export async function deleteInventoryItemAction(id: string, path: string) {
  await apiFetch(`/inventory/${id}`, { method: 'DELETE' });
  revalidatePath(path);
}
