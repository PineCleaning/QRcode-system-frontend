'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { AdminUserRecord } from '@/lib/api/types';
import { Modal } from './Modal';
import { updateOwnProfileAction } from './profile-actions';

function initials(fullName: string | null, email: string): string {
  if (fullName?.trim()) {
    const parts = fullName.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
  }
  return email[0]?.toUpperCase() ?? '?';
}

/** Password change is entirely client-side, direct to Supabase - the browser already holds a live session (proof of identity), so no backend endpoint or current-password re-entry is needed. Mirrors how the Admin's "Generate new password" reveal works, but self-service and user-chosen instead of system-generated. */
function ChangePasswordSection() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'saving' | 'error' | 'success'; message?: string }>({ type: 'idle' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }
    if (password !== confirm) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    setStatus({ type: 'saving' });
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus({ type: 'error', message: error.message });
      return;
    }
    setPassword('');
    setConfirm('');
    setStatus({ type: 'success', message: 'Password updated.' });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="newPassword" className="mb-1 block text-sm font-bold text-ink">
          New Password
        </label>
        <input
          id="newPassword"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          className="w-full rounded-xl border border-line bg-page px-3 py-2 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="mb-1 block text-sm font-bold text-ink">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          className="w-full rounded-xl border border-line bg-page px-3 py-2 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
        />
      </div>
      {status.type === 'error' && <p className="text-sm text-red-600">{status.message}</p>}
      {status.type === 'success' && <p className="text-sm text-green">{status.message}</p>}
      <button
        type="submit"
        disabled={status.type === 'saving'}
        className="rounded-xl border border-line px-4 py-2 text-sm font-bold text-ink hover:bg-line/40 disabled:opacity-50"
      >
        {status.type === 'saving' ? 'Updating…' : 'Update Password'}
      </button>
    </form>
  );
}

export function ProfileButton({ admin }: { admin: AdminUserRecord }) {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState(admin.fullName ?? '');
  const [error, formAction, isPending] = useActionState(updateOwnProfileAction, null);

  const submittedRef = useRef(false);
  useEffect(() => {
    if (isPending) {
      submittedRef.current = true;
    } else if (submittedRef.current && !error) {
      submittedRef.current = false;
    }
  }, [isPending, error]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Your profile"
        title="Your profile"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-page transition hover:opacity-90"
      >
        {initials(admin.fullName, admin.email)}
      </button>

      {open && (
        <Modal title="Your Profile" onClose={() => setOpen(false)}>
          <div className="space-y-5">
            <form action={formAction} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="mb-1 block text-sm font-bold text-ink">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-line bg-page px-3 py-2 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-ink">Email</label>
                <input
                  value={admin.email}
                  disabled
                  className="w-full rounded-xl border border-line bg-line/40 px-3 py-2 text-sm text-ink-muted"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-ink">Role</label>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                    admin.role === 'ADMIN' ? 'bg-primary/15 text-primary' : 'bg-sky/15 text-sky'
                  }`}
                >
                  {admin.role === 'ADMIN' ? 'Admin' : 'Supervisor'}
                </span>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-page hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? 'Saving…' : 'Save changes'}
              </button>
            </form>

            <div className="border-t border-line pt-5">
              <h3 className="mb-3 text-sm font-bold text-ink">Change Password</h3>
              <ChangePasswordSection />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
