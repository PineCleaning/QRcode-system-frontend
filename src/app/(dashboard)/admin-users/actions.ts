'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ApiError, apiFetch } from '@/lib/api/server-fetch';
import type { AdminUserRecord, CreatedAdminUser } from '@/lib/api/types';

export interface CreateAdminUserState {
  error: string | null;
  /** Set only on a successful create - the modal shows this once, then it's gone forever. */
  created: CreatedAdminUser | null;
}

export async function createAdminUserModalAction(
  _prevState: CreateAdminUserState,
  formData: FormData,
): Promise<CreateAdminUserState> {
  const email = (formData.get('email') as string)?.trim();
  const fullName = (formData.get('fullName') as string)?.trim() || undefined;
  const role = formData.get('role') as 'ADMIN' | 'SUPERVISOR';

  try {
    const created = await apiFetch<CreatedAdminUser>('/admin-users', {
      method: 'POST',
      body: JSON.stringify({ email, fullName, role }),
    });
    revalidatePath('/admin-users');
    return { error: null, created };
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to create user', created: null };
  }
}

async function updateAdminUser(id: string, formData: FormData): Promise<string | null> {
  const fullName = (formData.get('fullName') as string)?.trim();
  const role = formData.get('role') as string;

  try {
    await apiFetch<AdminUserRecord>(`/admin-users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ fullName, role }),
    });
  } catch (err) {
    return err instanceof ApiError ? err.message : 'Failed to update user';
  }

  revalidatePath('/admin-users');
  return null;
}

/** Used by the Edit modal - stays on /admin-users and closes itself on success. */
export async function updateAdminUserModalAction(
  id: string,
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  return updateAdminUser(id, formData);
}

export interface ResetPasswordState {
  error: string | null;
  temporaryPassword: string | null;
}

export async function resetAdminUserPasswordAction(id: string): Promise<ResetPasswordState> {
  try {
    const { temporaryPassword } = await apiFetch<{ temporaryPassword: string }>(`/admin-users/${id}/reset-password`, {
      method: 'POST',
    });
    return { error: null, temporaryPassword };
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Failed to reset password', temporaryPassword: null };
  }
}

export async function setAdminUserStatusAction(id: string, status: 'ACTIVE' | 'INACTIVE') {
  try {
    await apiFetch<AdminUserRecord>(`/admin-users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  } catch (err) {
    const verb = status === 'ACTIVE' ? 'reactivate' : 'deactivate';
    const message = err instanceof ApiError ? err.message : `Failed to ${verb} user`;
    revalidatePath('/admin-users');
    redirect(`/admin-users?error=${encodeURIComponent(message)}`);
  }
  revalidatePath('/admin-users');
}
