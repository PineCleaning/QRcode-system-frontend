'use client';

import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import { Modal } from '@/components/Modal';
import { Select } from '@/components/Select';
import type { AdminUserRecord } from '@/lib/api/types';
import { resetAdminUserPasswordAction, updateAdminUserModalAction } from './actions';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="rounded-lg border border-line px-3 py-1.5 text-xs font-bold text-ink hover:bg-line/40"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

/**
 * Resetting takes effect immediately on click - not deferred behind the
 * form's own "Save changes" button. Matches the Create flow's one-time-
 * reveal pattern (generated, shown once, never retrievable again) -
 * deferring it would mean holding a real plaintext password in this
 * component's state until Save, for no real benefit.
 */
function ResetPasswordSection({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error: string | null; temporaryPassword: string | null } | null>(null);

  function handleGenerate() {
    startTransition(async () => {
      const res = await resetAdminUserPasswordAction(userId);
      setResult(res);
    });
  }

  if (result?.temporaryPassword) {
    return (
      <div className="rounded-xl border border-line bg-page p-3">
        <p className="text-xs text-ink-muted">
          Share this with the user — it&apos;s shown only this once. Their old password no longer works.
        </p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="break-all font-mono text-sm font-semibold text-ink">{result.temporaryPassword}</span>
          <CopyButton text={result.temporaryPassword} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isPending}
        className="rounded-xl border border-line px-3 py-1.5 text-xs font-bold text-ink hover:bg-line/40 disabled:opacity-50"
      >
        {isPending ? 'Generating…' : 'Generate new password'}
      </button>
      {result?.error && <p className="mt-1.5 text-xs text-red-600">{result.error}</p>}
    </div>
  );
}

export function EditAdminUserModal({ user }: { user: AdminUserRecord }) {
  const [open, setOpen] = useState(false);
  const [error, formAction, isPending] = useActionState(updateAdminUserModalAction.bind(null, user.id), null);
  const [role, setRole] = useState<string>(user.role);

  const submittedRef = useRef(false);
  useEffect(() => {
    if (isPending) {
      submittedRef.current = true;
    } else if (submittedRef.current) {
      submittedRef.current = false;
      if (error) {
        // The save was rejected (e.g. "last active Admin") - the Role
        // Select is controlled local state, so without this it keeps
        // showing whatever was picked even though nothing was actually
        // saved, making the form lie about the real current role.
        setRole(user.role);
      } else {
        setOpen(false);
      }
    }
  }, [isPending, error, user.role]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="mr-3.5 font-bold text-ink-muted hover:text-ink">
        Edit
      </button>

      {open && (
        <Modal title="Edit user" onClose={() => setOpen(false)}>
          <form action={formAction} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-bold text-ink">Email</label>
              <input
                value={user.email}
                disabled
                className="w-full rounded-xl border border-line bg-line/40 px-3 py-2 text-sm text-ink-muted"
              />
              <p className="mt-1 text-xs text-ink-muted">Email can&apos;t be changed once created.</p>
            </div>

            <div>
              <label htmlFor="fullName" className="mb-1 block text-sm font-bold text-ink">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                defaultValue={user.fullName ?? ''}
                className="w-full rounded-xl border border-line bg-page px-3 py-2 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
              />
            </div>

            <div>
              <label htmlFor="role" className="mb-1 block text-sm font-bold text-ink">
                Role
              </label>
              <input type="hidden" name="role" value={role} />
              <Select
                id="role"
                value={role}
                onChange={setRole}
                options={[
                  { value: 'SUPERVISOR', label: 'Supervisor' },
                  { value: 'ADMIN', label: 'Admin' },
                ]}
                placeholder="Role"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-ink">Password</label>
              <ResetPasswordSection userId={user.id} />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-page hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? 'Saving…' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-line px-4 py-2 text-sm font-bold text-ink hover:bg-line/40"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
