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
      <div className="mb-6 flex flex-col gap-3 rounded-[26px] border border-line bg-surface px-5 py-4.5 sm:flex-row sm:items-center sm:justify-between sm:px-6.5">
        <h1 className="text-xl font-extrabold break-words">{client.name}</h1>
        <Link
          prefetch={false}
          href="/clients"
          className="inline-flex shrink-0 items-center rounded-xl border border-line px-4 py-2 text-center text-[13.5px] font-bold transition hover:-translate-y-px"
        >
          ← Clients
        </Link>
      </div>

      {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold">Sites</h2>
        <Link
          prefetch={false}
          href={`/clients/${id}/sites/new`}
          className="inline-flex items-center rounded-xl bg-ink px-4 py-2 text-center text-[13.5px] font-bold text-page transition hover:-translate-y-px"
        >
          + Add site
        </Link>
      </div>

      {sites.length === 0 ? (
        <p className="text-sm text-ink-muted">No sites yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-[26px] border border-line bg-surface shadow-sm">
          <table className="w-full min-w-[760px] text-left text-[13.5px]">
            <thead className="border-b border-line text-[10.5px] font-extrabold uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="whitespace-nowrap px-5.5 py-4">Site name</th>
                <th className="whitespace-nowrap px-5.5 py-4">Address</th>
                <th className="whitespace-nowrap px-5.5 py-4">Slug</th>
                <th className="whitespace-nowrap px-5.5 py-4">Status</th>
                <th className="whitespace-nowrap px-5.5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site) => (
                <tr key={site.id} className="border-b border-line last:border-0 hover:bg-ink/[0.03]">
                  <td className="px-5.5 py-3.5 font-bold">{site.siteName}</td>
                  <td className="px-5.5 py-3.5 text-ink-muted">{site.address || <span className="text-ink-muted/40">—</span>}</td>
                  <td className="px-5.5 py-3.5 font-mono text-[12.5px] text-ink-muted">{site.slug}</td>
                  <td className="px-5.5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold before:h-1.5 before:w-1.5 before:rounded-full before:bg-current ${
                        site.status === 'ACTIVE' ? 'bg-green/15 text-green' : 'bg-ink-muted/15 text-ink-muted'
                      }`}
                    >
                      {site.status}
                    </span>
                  </td>
                  <td className="px-5.5 py-3.5 font-bold">
                    <div className="flex gap-3 text-[12.5px]">
                      <SiteQrModal siteId={site.id} siteName={site.siteName} slug={site.slug} status={site.status} />
                      <Link
                        prefetch={false}
                        href={`/clients/${id}/sites/${site.id}/feedback`}
                        className="text-ink-muted hover:text-ink"
                      >
                        Feedback
                      </Link>
                      <Link
                        prefetch={false}
                        href={`/clients/${id}/sites/${site.id}/edit`}
                        className="text-ink-muted hover:text-ink"
                      >
                        Edit
                      </Link>
                      <ConfirmDeleteButton
                        action={deleteSiteAction.bind(null, site.id, id)}
                        itemLabel={site.siteName}
                        warning="This will fail if the site has any feedback history — deactivate instead if you're not sure."
                        triggerClassName="text-coral hover:underline"
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
