'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import type { Client } from '@/lib/api/types';

type FormAction = (prevState: string | null, formData: FormData) => Promise<string | null>;

export function ClientForm({
  client,
  action,
  cancelHref,
}: {
  client?: Client;
  action: FormAction;
  cancelHref: string;
}) {
  const [error, formAction, isPending] = useActionState(action, null);
  const isEdit = Boolean(client);

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div>
        <label htmlFor="clientCode" className="mb-1 block text-sm font-medium text-gray-700">
          Client code
        </label>
        <input
          id="clientCode"
          name="clientCode"
          defaultValue={client?.clientCode}
          required
          disabled={isEdit}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          title="Lowercase alphanumeric with optional hyphens (e.g. acme001)"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"
        />
        {isEdit && <p className="mt-1 text-xs text-gray-500">Client code can&apos;t be changed once created.</p>}
      </div>

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={client?.name}
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="contactEmail" className="mb-1 block text-sm font-medium text-gray-700">
          Contact email
        </label>
        <input
          id="contactEmail"
          name="contactEmail"
          type="email"
          defaultValue={client?.contactEmail ?? ''}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="contactPhone" className="mb-1 block text-sm font-medium text-gray-700">
          Contact phone
        </label>
        <input
          id="contactPhone"
          name="contactPhone"
          defaultValue={client?.contactPhone ?? ''}
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
            defaultValue={client?.status}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create client'}
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
