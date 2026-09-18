'use client';

import { useTransition } from 'react';

/**
 * Toggles a `flagged` boolean - shared by the Feedback page and the
 * Inspections page. Not destructive, no confirmation needed - just
 * flips the marker, same non-blocking pattern as RetryButton.
 */
export function FlagButton({ flagged, action }: { flagged: boolean; action: () => Promise<void> }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => action())}
      disabled={isPending}
      aria-label={flagged ? 'Unflag' : 'Flag as needing attention'}
      title={flagged ? 'Unflag' : 'Flag as needing attention'}
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full border transition disabled:opacity-50 ${
        flagged
          ? 'border-coral bg-coral/15 text-coral hover:bg-coral/25'
          : 'border-line text-ink-muted hover:border-coral hover:text-coral'
      }`}
    >
      <svg className={`h-3.5 w-3.5 ${isPending ? 'animate-pulse' : ''}`} fill={flagged ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3v18M3 4.5h13.5l-1.5 3 1.5 3H3"
        />
      </svg>
    </button>
  );
}
