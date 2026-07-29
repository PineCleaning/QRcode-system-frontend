import Link from 'next/link';
import { ConfirmDeleteButton } from '@/components/ConfirmDeleteButton';
import { SiteQrModal } from '@/components/SiteQrModal';
import { apiFetch } from '@/lib/api/server-fetch';
import type { Client, Site } from '@/lib/api/types';
import { deleteSiteAction } from './sites/actions';

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const [client, sites] = await Promise.all([
    apiFetch<Client>(`/clients/${id}`),
    apiFetch<Site[]>(`/clients/${id}/sites`),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <h1 className="text-xl font-bold text-gray-900 break-words">{client.name}</h1>
        <Link
          prefetch={false}
          href="/clients"
          className="inline-block shrink-0 rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ← Clients
        </Link>
      </div>

      {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-medium text-gray-900">Sites</h2>
        <Link
          prefetch={false}
          href={`/clients/${id}/sites/new`}
          className="inline-block rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Add site
        </Link>
      </div>

      {sites.length === 0 ? (
        <p className="text-sm text-gray-500">No sites yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="whitespace-nowrap px-4 py-3">Site name</th>
                <th className="whitespace-nowrap px-4 py-3">Address</th>
                <th className="whitespace-nowrap px-4 py-3 text-center">Slug</th>
                <th className="whitespace-nowrap px-4 py-3 text-center">Status</th>
                <th className="whitespace-nowrap px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site) => (
                <tr key={site.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{site.siteName}</td>
                  <td className="px-4 py-3 text-gray-500">{site.address || <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{site.slug}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        site.status === 'ACTIVE' ? 'bg-accent/10 text-accent' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {site.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-3 text-xs">
                      <SiteQrModal siteId={site.id} siteName={site.siteName} slug={site.slug} status={site.status} />
                      <Link
                        prefetch={false}
                        href={`/clients/${id}/sites/${site.id}/feedback`}
                        className="text-gray-600 hover:underline"
                      >
                        Feedback
                      </Link>
                      <Link
                        prefetch={false}
                        href={`/clients/${id}/sites/${site.id}/edit`}
                        className="text-gray-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <ConfirmDeleteButton
                        action={deleteSiteAction.bind(null, site.id, id)}
                        itemLabel={site.siteName}
                        warning="This will fail if the site has any feedback history — deactivate instead if you're not sure."
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
