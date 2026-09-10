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
  // FormData.get() returns null (not undefined) for a field that was
  // never submitted - which is deliberate for the Admin row's own edit
  // (see EditAdminUserModal.tsx, no `role` input rendered for it at
  // all). JSON.stringify keeps a literal `null` but drops `undefined`
  // keys entirely - only the latter actually means "don't touch this
  // field" server-side (Prisma's update() only skips undefined keys).
  const role = (formData.get('role') as string | null) || undefined;

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

/**
 * Permanently deletes a user - their admin_users row and their real
 * Supabase Auth login credential. The Admin account can never be
 * targeted this way (backend rejects it with a 403 regardless of what
 * this sends) - the UI also never renders a delete control for that
 * row in the first place, see page.tsx.
 */
export async function deleteAdminUserAction(id: string) {
  try {
    await apiFetch(`/admin-users/${id}`, { method: 'DELETE' });
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'Failed to delete user';
    revalidatePath('/admin-users');
    redirect(`/admin-users?error=${encodeURIComponent(message)}`);
  }
  revalidatePath('/admin-users');
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
