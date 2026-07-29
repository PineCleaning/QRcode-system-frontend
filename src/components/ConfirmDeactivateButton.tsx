'use client';

import { useState, useTransition } from 'react';

/**
 * Same confirm-modal pattern as ConfirmDeleteButton, but for a
 * non-destructive status change - wording and styling reflect that
 * nothing is actually removed and the action is reversible.
 */
export function ConfirmDeactivateButton({
  action,
  itemLabel,
  description = "Its QR code will stop accepting new feedback submissions. Nothing is deleted - existing feedback stays intact, and you can reactivate this site anytime from Edit.",
  triggerClassName = 'text-ink-muted hover:text-ink',
}: {
  action: () => Promise<void>;
  itemLabel: string;
  /** Defaults to site-specific wording; pass a client-specific message when deactivating a client instead. */
  description?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await action();
      setOpen(false);
    });
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        Deactivate
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-[26px] bg-surface p-6 shadow-lg">
            <h2 className="text-base font-extrabold">Deactivate {itemLabel}?</h2>
            <p className="mt-2 text-sm text-ink-muted">{description}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="rounded-xl border border-line px-4 py-2 text-sm font-bold text-ink hover:bg-line/40 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
                className="rounded-xl bg-amber px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? 'Deactivating…' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
