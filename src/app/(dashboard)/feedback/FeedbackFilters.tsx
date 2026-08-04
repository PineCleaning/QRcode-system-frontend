'use client';

import { useRouter } from 'next/navigation';
import type { Client, Site } from '@/lib/api/types';
import { useFilterPending } from '@/components/FilterPending';
import { Select } from '@/components/Select';

export function FeedbackFilters({
  basePath,
  clients,
  sites,
  clientCode,
  siteId,
}: {
  basePath: string;
  clients: Client[];
  sites: Site[];
  clientCode?: string;
  siteId?: string;
}) {
  const router = useRouter();
  const { isPending, startTransition } = useFilterPending();

  function handleClientChange(value: string) {
    startTransition(() => {
      router.push(value ? `${basePath}?clientCode=${value}` : basePath);
    });
  }

  function handleSiteChange(value: string) {
    startTransition(() => {
      router.push(value ? `${basePath}?clientCode=${clientCode}&siteId=${value}` : `${basePath}?clientCode=${clientCode}`);
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
          value={clientCode ?? ''}
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
          disabled={!clientCode || isPending}
          placeholder={clientCode ? 'All sites' : 'Select a client first'}
          options={[
            { value: '', label: clientCode ? 'All sites' : 'Select a client first' },
            ...sites.map((s) => ({ value: s.id, label: s.businessName })),
          ]}
        />
      </div>
    </div>
  );
}
