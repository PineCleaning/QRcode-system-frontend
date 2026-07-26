import Link from 'next/link';
import { ConfirmDeleteButton } from '@/components/ConfirmDeleteButton';
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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link prefetch={false} href="/clients" className="text-sm text-gray-500 hover:underline">
            ← Clients
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-gray-900 break-words">{client.name}</h1>
          <p className="text-sm text-gray-500">
            {client.clientCode} ·{' '}
            <span className={client.status === 'ACTIVE' ? 'text-green-700' : 'text-gray-500'}>{client.status}</span>
          </p>
        </div>
        <Link
          prefetch={false}
          href={`/clients/${id}/edit`}
          className="inline-block shrink-0 rounded-md border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Edit client
        </Link>
      </div>

      {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-medium text-gray-900">Sites</h2>
        <Link
          prefetch={false}
          href={`/clients/${id}/sites/new`}
          className="inline-block rounded-md bg-gray-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-gray-800"
        >
          Add site
        </Link>
      </div>

      {sites.length === 0 && <p className="text-sm text-gray-500">No sites yet.</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sites.map((site) => (
          <div key={site.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <img
              src={`/api/qr/${site.id}`}
              alt={`QR code for ${site.siteName}`}
              width={140}
              height={140}
              className="mx-auto"
            />
            <div className="mt-3 text-center">
              <p className="font-medium text-gray-900">{site.siteName}</p>
              <p className="text-xs text-gray-500">{site.slug}</p>
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  site.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {site.status}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
              <a href={`/api/qr/${site.id}`} download className="text-blue-600 hover:underline">
                PNG
              </a>
              <a href={`/api/qr/${site.id}?format=pdf&size=A4`} download className="text-blue-600 hover:underline">
                PDF A4
              </a>
              <a href={`/api/qr/${site.id}?format=pdf&size=A5`} download className="text-blue-600 hover:underline">
                PDF A5
              </a>
            </div>

            <div className="mt-3 flex justify-center gap-3 text-xs">
              <Link prefetch={false} href={`/clients/${id}/sites/${site.id}/edit`} className="text-gray-600 hover:underline">
                Edit
              </Link>
              <ConfirmDeleteButton
                action={deleteSiteAction.bind(null, site.id, id)}
                itemLabel={site.siteName}
                warning="This will fail if the site has any feedback history — deactivate instead if you're not sure."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
