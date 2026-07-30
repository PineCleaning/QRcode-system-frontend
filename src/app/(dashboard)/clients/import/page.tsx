import Link from 'next/link';
import { BulkImportClient } from './BulkImportClient';

export default function BulkImportPage() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          prefetch={false}
          href="/clients"
          aria-label="Back to Clients"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-ink transition hover:-translate-y-px"
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight">Bulk Import Clients</h1>
      </div>

      <BulkImportClient />
    </div>
  );
}
