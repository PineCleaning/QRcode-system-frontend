'use client';

import { useRouter } from 'next/navigation';
import type { Client, Site } from '@/lib/api/types';

export function FeedbackFilters({
  clients,
  sites,
  clientId,
  siteId,
}: {
  clients: Client[];
  sites: Site[];
  clientId?: string;
  siteId?: string;
}) {
  const router = useRouter();

  function handleClientChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    router.push(value ? `/feedback?clientId=${value}` : '/feedback');
  }

  function handleSiteChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    router.push(value ? `/feedback?clientId=${clientId}&siteId=${value}` : `/feedback?clientId=${clientId}`);
  }

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row">
      <div>
        <label htmlFor="clientFilter" className="mb-1 block text-xs font-medium text-gray-500">
          Client
        </label>
        <select
          id="clientFilter"
          value={clientId ?? ''}
          onChange={handleClientChange}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
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
        <label htmlFor="siteFilter" className="mb-1 block text-xs font-medium text-gray-500">
          Site
        </label>
        <select
          id="siteFilter"
          value={siteId ?? ''}
          onChange={handleSiteChange}
          disabled={!clientId}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-400"
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
