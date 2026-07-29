'use client';

import { useRouter } from 'next/navigation';
import type { Client, Site } from '@/lib/api/types';
import { useFilterPending } from '@/components/FilterPending';
import { Select } from '@/components/Select';

export function FeedbackFilters({
  basePath,
  clients,
  sites,
  clientId,
  siteId,
}: {
  basePath: string;
  clients: Client[];
  sites: Site[];
  clientId?: string;
  siteId?: string;
}) {
  const router = useRouter();
  const { isPending, startTransition } = useFilterPending();

  function handleClientChange(value: string) {
    startTransition(() => {
      router.push(value ? `${basePath}?clientId=${value}` : basePath);
    });
  }

  function handleSiteChange(value: string) {
    startTransition(() => {
      router.push(value ? `${basePath}?clientId=${clientId}&siteId=${value}` : `${basePath}?clientId=${clientId}`);
    });
  }

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="w-full sm:w-56">
        <label htmlFor="clientFilter" className="mb-1 block text-xs font-bold text-ink-muted">
          Client
        </label>
        <Select
          id="clientFilter"
          value={clientId ?? ''}
          onChange={handleClientChange}
          disabled={isPending}
          placeholder="All clients"
          options={[{ value: '', label: 'All clients' }, ...clients.map((c) => ({ value: c.id, label: c.name }))]}
        />
      </div>

      <div className="w-full sm:w-56">
        <label htmlFor="siteFilter" className="mb-1 block text-xs font-bold text-ink-muted">
          Site
        </label>
        <Select
          id="siteFilter"
          value={siteId ?? ''}
          onChange={handleSiteChange}
          disabled={!clientId || isPending}
          placeholder={clientId ? 'All sites' : 'Select a client first'}
          options={[
            { value: '', label: clientId ? 'All sites' : 'Select a client first' },
            ...sites.map((s) => ({ value: s.id, label: s.siteName })),
          ]}
        />
      </div>
    </div>
  );
}
