'use client';

import { useActionState, useState } from 'react';
import { Modal } from '@/components/Modal';
import { Select } from '@/components/Select';
import { createAdminUserModalAction, type CreateAdminUserState } from './actions';

const INITIAL_STATE: CreateAdminUserState = { error: null, created: null };

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
 * Two distinct states, not just a form that closes on success: the
 * backend generates the password (confirmed with the user 2026-09-01,
 * not admin-typed) and returns it exactly once in the create response -
 * it's never stored anywhere retrievable after that. So a successful
 * create has to show it before the modal can close, not just dismiss
 * itself the way every other Add/Edit modal in this app does.
 */
export function AddAdminUserModal() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createAdminUserModalAction, INITIAL_STATE);
  const [role, setRole] = useState('SUPERVISOR');

  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-xl bg-primary px-4.5 py-2.5 text-[13.5px] font-bold text-page transition hover:-translate-y-px"
      >
        + Add user
      </button>

      {open && (
        <Modal title={state.created ? 'User created' : 'Add user'} onClose={handleClose}>
          {state.created ? (
            <div className="space-y-4">
              <p className="text-sm text-ink-muted">
                Share these credentials with <strong className="text-ink">{state.created.email}</strong> — the password is
                shown only this once and can&apos;t be retrieved again after you close this window.
              </p>
              <div className="space-y-3 rounded-xl border border-line bg-page p-4">
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wide text-ink-muted">Email</div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <span className="break-all text-sm font-semibold text-ink">{state.created.email}</span>
                    <CopyButton text={state.created.email} />
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wide text-ink-muted">Temporary password</div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <span className="break-all font-mono text-sm font-semibold text-ink">{state.created.temporaryPassword}</span>
                    <CopyButton text={state.created.temporaryPassword} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-page hover:opacity-90"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form action={formAction} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-bold text-ink">
                  Email <span className="text-coral">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-xl border border-line bg-page px-3 py-2 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
                />
              </div>

              <div>
                <label htmlFor="fullName" className="mb-1 block text-sm font-bold text-ink">
                  Full Name <span className="text-coral">*</span>
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  required
                  className="w-full rounded-xl border border-line bg-page px-3 py-2 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
                />
              </div>

              <div>
                <label htmlFor="role" className="mb-1 block text-sm font-bold text-ink">
                  Role <span className="text-coral">*</span>
                </label>
                {/* 'Admin' is deliberately not an option - there is exactly one, permanently (test@example.com). */}
                <input type="hidden" name="role" value={role} />
                <Select
                  id="role"
                  value={role}
                  onChange={setRole}
                  placeholder="Supervisor"
                  options={[
                    { value: 'SUPERVISOR', label: 'Supervisor' },
                    { value: 'MANAGER', label: 'Manager' },
                    { value: 'ADMIN_SUPPORT', label: 'Admin Support' },
                  ]}
                />
              </div>

              {state.error && <p className="text-sm text-red-600">{state.error}</p>}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-page hover:opacity-90 disabled:opacity-50"
                >
                  {isPending ? 'Creating…' : 'Create user'}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl border border-line px-4 py-2 text-sm font-bold text-ink hover:bg-line/40"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}
