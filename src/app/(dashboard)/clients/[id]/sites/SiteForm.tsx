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
    <form action={formAction} className="max-w-md space-y-4">
      <div>
        <label htmlFor="siteName" className="mb-1 block text-sm font-medium text-gray-700">
          Site name
        </label>
        <input
          id="siteName"
          name="siteName"
          defaultValue={site?.siteName}
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="address" className="mb-1 block text-sm font-medium text-gray-700">
          Address
        </label>
        <input
          id="address"
          name="address"
          defaultValue={site?.address ?? ''}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {isEdit && (
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={site?.status}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      )}

      {isEdit && (
        <p className="text-xs text-gray-500">
          Slug ({site?.slug}) and site code are permanent once created — they&apos;re printed on the QR code.
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Add site'}
        </button>
        <Link
          prefetch={false}
          href={cancelHref}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
