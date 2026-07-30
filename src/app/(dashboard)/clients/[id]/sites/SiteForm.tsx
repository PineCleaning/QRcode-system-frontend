'use client';

import Link from 'next/link';
import { useActionState, useEffect, useRef, useState } from 'react';
import { Select } from '@/components/Select';
import type { Site } from '@/lib/api/types';

type FormAction = (prevState: string | null, formData: FormData) => Promise<string | null>;

export function SiteForm({
  site,
  action,
  cancelHref,
  onCancel,
  onSuccess,
  bare = false,
}: {
  site?: Site;
  action: FormAction;
  /** Rendered as a Link when there's no onCancel - used by the two full-page routes. */
  cancelHref?: string;
  /** Rendered as a button instead of a Link when provided - used by the Add/Edit site modals to close themselves. */
  onCancel?: () => void;
  /** Called once the action resolves with no error - the modal uses this to close itself instead of relying on a redirect. */
  onSuccess?: () => void;
  /** Omits the outer card styling - the modal supplies its own card around the form. */
  bare?: boolean;
}) {
  const [error, formAction, isPending] = useActionState(action, null);
  const isEdit = Boolean(site);
  const [status, setStatus] = useState<string>(site?.status ?? 'ACTIVE');

  const submittedRef = useRef(false);
  useEffect(() => {
    if (isPending) {
      submittedRef.current = true;
    } else if (submittedRef.current && !error) {
      submittedRef.current = false;
      onSuccess?.();
    }
  }, [isPending, error, onSuccess]);

  return (
    <form
      action={formAction}
      className={bare ? 'space-y-4' : 'max-w-md space-y-4 rounded-[26px] border border-line bg-surface p-6 shadow-sm'}
    >
      <div>
        <label htmlFor="siteName" className="mb-1 block text-sm font-bold text-ink">
          Site name
        </label>
        <input
          id="siteName"
          name="siteName"
          defaultValue={site?.siteName}
          required
          className="w-full rounded-xl border border-line bg-page px-3 py-2 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
        />
      </div>

      <div>
        <label htmlFor="address" className="mb-1 block text-sm font-bold text-ink">
          Address
        </label>
        <input
          id="address"
          name="address"
          defaultValue={site?.address ?? ''}
          className="w-full rounded-xl border border-line bg-page px-3 py-2 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
        />
      </div>

      {isEdit && (
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-bold text-ink">
            Status
          </label>
          <input type="hidden" name="status" value={status} />
          <Select
            id="status"
            value={status}
            onChange={setStatus}
            placeholder="Active"
            options={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
            ]}
          />
        </div>
      )}

      {isEdit && (
        <p className="text-xs text-ink-muted">
          Slug ({site?.slug}) and site code are permanent once created — they&apos;re printed on the QR code.
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-page hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Add site'}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-line px-4 py-2 text-sm font-bold text-ink hover:bg-line/40"
          >
            Cancel
          </button>
        ) : (
          <Link
            prefetch={false}
            href={cancelHref!}
            className="rounded-xl border border-line px-4 py-2 text-sm font-bold text-ink hover:bg-line/40"
          >
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
