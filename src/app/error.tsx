'use client';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-page px-4 text-center text-ink">
      <h1 className="text-lg font-extrabold">Something went wrong</h1>
      <p className="max-w-sm text-sm text-ink-muted">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-page hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
