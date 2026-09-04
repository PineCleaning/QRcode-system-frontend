import { ApiError, apiFetch } from './server-fetch';
import type { AdminUserRecord } from './types';

/**
 * Used by the dashboard layout to know the signed-in admin's role, so
 * the User Management nav item can be hidden from Supervisors - purely
 * a UX convenience, the backend's RolesGuard is the real boundary
 * regardless of what this shows. Returns null on any failure rather
 * than throwing, since a transient error here shouldn't crash the
 * whole dashboard shell - worst case, the nav item is just hidden.
 */
export async function getCurrentAdmin(): Promise<AdminUserRecord | null> {
  try {
    return await apiFetch<AdminUserRecord>('/auth/me');
  } catch (err) {
    if (!(err instanceof ApiError)) {
      console.error('Failed to fetch current admin:', err);
    }
    return null;
  }
}
