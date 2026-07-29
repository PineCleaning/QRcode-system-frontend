import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-page px-4 text-center text-ink">
      <h1 className="text-lg font-extrabold">Page not found</h1>
      <p className="max-w-sm text-sm text-ink-muted">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link
        href="/clients"
        className="rounded-xl bg-ink px-4 py-2 text-sm font-bold text-page hover:opacity-90"
      >
        Back to Clients
      </Link>
    </div>
  );
}
