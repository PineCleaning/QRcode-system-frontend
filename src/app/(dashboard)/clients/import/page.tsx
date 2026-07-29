import Link from 'next/link';
import { BulkImportClient } from './BulkImportClient';

export default function BulkImportPage() {
  return (
    <div>
      <div className="mb-6">
        <Link prefetch={false} href="/clients" className="text-sm text-gray-500 hover:underline">
          ← Clients
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-gray-900">Bulk Import Clients</h1>
      </div>

      <BulkImportClient />
    </div>
  );
}
