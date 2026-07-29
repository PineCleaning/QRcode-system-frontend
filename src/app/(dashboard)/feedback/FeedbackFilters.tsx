'use client';

import { useRouter } from 'next/navigation';
import type { Client, Site } from '@/lib/api/types';

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

  function handleClientChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    router.push(value ? `${basePath}?clientId=${value}` : basePath);
  }

  function handleSiteChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    router.push(value ? `${basePath}?clientId=${clientId}&siteId=${value}` : `${basePath}?clientId=${clientId}`);
  }

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row">
      <div>
        <label htmlFor="clientFilter" className="mb-1 block text-xs font-bold text-ink-muted">
          Client
        </label>
        <select
          id="clientFilter"
          value={clientId ?? ''}
          onChange={handleClientChange}
          className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink"
        >
          <option value="">All clients</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="siteFilter" className="mb-1 block text-xs font-bold text-ink-muted">
          Site
        </label>
        <select
          id="siteFilter"
          value={siteId ?? ''}
          onChange={handleSiteChange}
          disabled={!clientId}
          className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink disabled:bg-line/40 disabled:text-ink-muted"
        >
          <option value="">{clientId ? 'All sites' : 'Select a client first'}</option>
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.siteName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
