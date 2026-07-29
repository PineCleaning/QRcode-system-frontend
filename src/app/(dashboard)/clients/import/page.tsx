import Link from 'next/link';
import { BulkImportClient } from './BulkImportClient';

export default function BulkImportPage() {
  return (
    <div>
      <div className="mb-6">
        <Link prefetch={false} href="/clients" className="text-sm text-ink-muted hover:text-ink">
          ← Clients
        </Link>
        <h1 className="mt-1 text-xl font-extrabold">Bulk Import Clients</h1>
      </div>

      <BulkImportClient />
    </div>
  );
}
