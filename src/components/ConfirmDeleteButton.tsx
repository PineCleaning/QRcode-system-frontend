'use client';

import { useState, useTransition } from 'react';

/**
 * Wraps a bound Server Action (e.g. `deleteClientAction.bind(null, id)`)
 * behind a confirmation modal instead of firing immediately on click.
 * Server Actions can be invoked directly as functions from a Client
 * Component (not just via a <form action>) - calling it inside
 * useTransition is what gives us the pending state for "Deleting…".
 */
export function ConfirmDeleteButton({
  action,
  itemLabel,
  warning,
  triggerClassName = 'text-red-600 hover:underline',
}: {
  action: () => Promise<void>;
  itemLabel: string;
  warning?: string;
  /** Defaults to the plain text-link style used in tables; pass a pill/button style for card layouts (e.g. the Assets grid). */
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await action();
    });
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        Delete
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-base font-semibold text-gray-900">Delete {itemLabel}?</h2>
            <p className="mt-2 text-sm text-gray-500">This can&apos;t be undone.{warning ? ` ${warning}` : ''}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
