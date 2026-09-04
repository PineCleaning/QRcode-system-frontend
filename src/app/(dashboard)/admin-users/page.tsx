import { ApiError, apiFetch } from '@/lib/api/server-fetch';
import { getCurrentAdmin } from '@/lib/api/current-admin';
import { formatDate } from '@/lib/format-date';
import type { AdminUserRecord } from '@/lib/api/types';
import { ConfirmDeactivateButton } from '@/components/ConfirmDeactivateButton';
import { AddAdminUserModal } from './AddAdminUserModal';
import { EditAdminUserModal } from './EditAdminUserModal';
import { setAdminUserStatusAction } from './actions';

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const currentAdmin = await getCurrentAdmin();

  let users: AdminUserRecord[];
  try {
    users = await apiFetch<AdminUserRecord[]>('/admin-users');
  } catch (err) {
    // A Supervisor navigating here directly (nav item is hidden, but the
    // URL still resolves) hits the backend's RolesGuard 403 - show a
    // plain, understandable message instead of the generic error
    // boundary, which would otherwise make this look like a bug.
    if (err instanceof ApiError && err.status === 403) {
      return (
        <div className="rounded-[26px] border border-line bg-surface p-12 text-center">
          <p className="text-sm text-ink-muted">Only Admins can manage users.</p>
        </div>
      );
    }
    throw err;
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-balance">User Management</h1>
          <p className="mt-1 text-[13.5px] text-ink-muted">Admins and Supervisors with access to this portal.</p>
        </div>
        <AddAdminUserModal />
      </div>

      {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      <div className="overflow-hidden rounded-[26px] border border-line bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[13.5px]">
            <thead className="border-b border-line text-[10.5px] font-extrabold uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="whitespace-nowrap px-5.5 py-4">Name</th>
                <th className="whitespace-nowrap px-5.5 py-4">Email</th>
                <th className="whitespace-nowrap px-5.5 py-4">Role</th>
                <th className="whitespace-nowrap px-5.5 py-4">Status</th>
                <th className="whitespace-nowrap px-5.5 py-4">Last Login</th>
                <th className="whitespace-nowrap px-5.5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-line last:border-0">
                  <td className="max-w-[220px] px-5.5 py-3.5 font-bold">
                    {user.fullName || <span className="text-ink-muted">—</span>}
                    {user.id === currentAdmin?.id && <span className="ml-1.5 text-xs font-medium text-ink-muted">(You)</span>}
                  </td>
                  <td className="px-5.5 py-3.5 text-ink/80">{user.email}</td>
                  <td className="px-5.5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase ${
                        user.role === 'ADMIN' ? 'bg-primary/15 text-primary' : 'bg-sky/15 text-sky'
                      }`}
                    >
                      {user.role === 'ADMIN' ? 'Admin' : 'Supervisor'}
                    </span>
                  </td>
                  <td className="px-5.5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold before:h-1.5 before:w-1.5 before:rounded-full before:bg-current ${
                        user.status === 'ACTIVE' ? 'bg-green/15 text-green' : 'bg-ink-muted/15 text-ink-muted'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5.5 py-3.5 whitespace-nowrap text-ink/80">
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : <span className="text-ink-muted">Never logged in</span>}
                  </td>
                  <td className="px-5.5 py-3.5 font-bold">
                    <EditAdminUserModal user={user} />
                    <ConfirmDeactivateButton
                      currentStatus={user.status}
                      action={setAdminUserStatusAction.bind(null, user.id)}
                      itemLabel={user.fullName || user.email}
                      deactivateDescription="They will no longer be able to sign in to the portal. Nothing is deleted, and you can reactivate anytime."
                      activateDescription="They will be able to sign in to the portal again."
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
