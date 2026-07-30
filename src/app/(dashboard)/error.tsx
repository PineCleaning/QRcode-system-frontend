'use client';

import Link from 'next/link';

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-[26px] border border-line bg-surface px-6 py-16 text-center shadow-sm">
      <h1 className="text-lg font-extrabold">Something went wrong</h1>
      <p className="max-w-sm text-sm text-ink-muted">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-page hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/clients"
          className="rounded-xl border border-line px-4 py-2 text-sm font-bold text-ink hover:bg-line/40"
        >
          Back to Clients
        </Link>
      </div>
    </div>
  );
}
