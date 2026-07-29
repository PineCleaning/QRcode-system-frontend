'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import type { Site } from '@/lib/api/types';

type FormAction = (prevState: string | null, formData: FormData) => Promise<string | null>;

export function SiteForm({
  site,
  action,
  cancelHref,
}: {
  site?: Site;
  action: FormAction;
  cancelHref: string;
}) {
  const [error, formAction, isPending] = useActionState(action, null);
  const isEdit = Boolean(site);

  return (
    <form action={formAction} className="max-w-md space-y-4 rounded-[26px] border border-line bg-surface p-6 shadow-sm">
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
          <select
            id="status"
            name="status"
            defaultValue={site?.status}
            className="w-full rounded-xl border border-line bg-page px-3 py-2 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
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
          className="rounded-xl bg-ink px-4 py-2 text-sm font-bold text-page hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Add site'}
        </button>
        <Link
          prefetch={false}
          href={cancelHref}
          className="rounded-xl border border-line px-4 py-2 text-sm font-bold text-ink hover:bg-line/40"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
