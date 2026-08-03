'use client';

import { useState, useTransition } from 'react';

/**
 * Same confirm-modal pattern as ConfirmDeleteButton, but for a
 * non-destructive status change - wording, color, and the action taken
 * flip based on the item's *current* status, so an already-inactive
 * row offers "Activate" (and really sends status: ACTIVE) instead of
 * repeating a no-op "Deactivate".
 */
export function ConfirmDeactivateButton({
  currentStatus,
  action,
  itemLabel,
  deactivateDescription = "Its QR code will stop accepting new feedback submissions. Nothing is deleted - existing feedback stays intact, and you can reactivate this site anytime using the Activate button.",
  activateDescription = 'Its QR code will start accepting new feedback submissions again.',
}: {
  currentStatus: 'ACTIVE' | 'INACTIVE';
  action: (status: 'ACTIVE' | 'INACTIVE') => Promise<void>;
  itemLabel: string;
  /** Shown when deactivating (currentStatus is ACTIVE). Defaults to site-specific wording; pass a client-specific message when this button is for a client instead. */
  deactivateDescription?: string;
  /** Shown when reactivating (currentStatus is INACTIVE). */
  activateDescription?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isActivating = currentStatus === 'INACTIVE';
  const verb = isActivating ? 'Activate' : 'Deactivate';
  const pendingVerb = isActivating ? 'Activating' : 'Deactivating';
  const description = isActivating ? activateDescription : deactivateDescription;

  function handleConfirm() {
    startTransition(async () => {
      await action(isActivating ? 'ACTIVE' : 'INACTIVE');
      setOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={isActivating ? 'text-green' : 'text-coral'}
      >
        {verb}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-[26px] bg-surface p-6 shadow-lg">
            <h2 className="text-base font-extrabold">
              {verb} {itemLabel}?
            </h2>
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
                className={`rounded-xl px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 ${
                  isActivating ? 'bg-green' : 'bg-amber'
                }`}
              >
                {isPending ? `${pendingVerb}…` : verb}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
