import Link from 'next/link';
import { ConfirmDeactivateButton } from '@/components/ConfirmDeactivateButton';
import { CopyLinkButton } from '@/components/CopyLinkButton';
import { Pagination } from '@/components/Pagination';
import { SiteQrModal } from '@/components/SiteQrModal';
import { apiFetch } from '@/lib/api/server-fetch';
import type { Client, PaginatedSites } from '@/lib/api/types';
import { AddSiteModal } from './sites/AddSiteModal';
import { EditSiteModal } from './sites/EditSiteModal';
import { setSiteStatusAction } from './sites/actions';

const PAGE_SIZE = 50;

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; page?: string }>;
}) {
  const { id } = await params;
  const { error, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [client, { data: sites, total }] = await Promise.all([
    apiFetch<Client>(`/clients/${id}`),
    apiFetch<PaginatedSites>(`/clients/${id}/sites?page=${page}&pageSize=${PAGE_SIZE}`),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  // Deactivating a client never touches its sites' own status rows (see
  // setSiteStatusAction) - a site's real ACTIVE/INACTIVE value is
  // untouched the whole time. This only changes what's *displayed*:
  // every site under an inactive client shows "Client Inactive"
  // regardless of its own real status, and reverts to showing that
  // real status the instant the client is reactivated - nothing to
  // restore, since it was never overwritten.
  const clientInactive = client.status === 'INACTIVE';

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
        <h1 className="text-2xl font-extrabold tracking-tight break-words">{client.name}</h1>
      </div>

      {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold">Sites</h2>
        <AddSiteModal clientId={id} />
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[26px] border border-line bg-surface p-12 text-center shadow-sm">
          <svg className="h-10 w-10 text-ink-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.14-7.5 11.25-7.5 11.25S4.5 17.64 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
            />
          </svg>
          <p className="text-sm text-ink-muted">No sites yet.</p>
          <AddSiteModal
            clientId={id}
            triggerClassName="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-page transition hover:-translate-y-px"
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-[26px] border border-line bg-surface shadow-sm">
          <div className="overflow-x-auto">
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
                  <td className="max-w-[180px] px-5.5 py-3.5 font-bold">{site.siteName}</td>
                  <td className="max-w-[200px] px-5.5 py-3.5 text-ink-muted">{site.address || <span className="text-ink-muted/40">—</span>}</td>
                  <td className="px-5.5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[12.5px] text-ink-muted">{site.slug}</span>
                      <CopyLinkButton url={site.feedbackUrl} />
                    </div>
                  </td>
                  <td className="px-5.5 py-3.5">
                    <span
                      title={clientInactive ? `This site's own status is ${site.status}, but its QR code is blocked because ${client.name} is deactivated.` : undefined}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold before:h-1.5 before:w-1.5 before:rounded-full before:bg-current ${
                        clientInactive
                          ? 'bg-coral/15 text-coral'
                          : site.status === 'ACTIVE'
                            ? 'bg-green/15 text-green'
                            : 'bg-ink-muted/15 text-ink-muted'
                      }`}
                    >
                      {clientInactive ? 'CLIENT INACTIVE' : site.status}
                    </span>
                  </td>
                  <td className="px-5.5 py-3.5 font-bold">
                    <div className="flex gap-3 text-[12.5px]">
                      <SiteQrModal
                        siteId={site.id}
                        siteName={site.siteName}
                        slug={site.slug}
                        status={site.status}
                        feedbackUrl={site.feedbackUrl}
                      />
                      <Link
                        prefetch={false}
                        href={`/clients/${id}/sites/${site.id}/feedback`}
                        className="text-ink-muted hover:text-ink"
                      >
                        Feedback
                      </Link>
                      {!clientInactive && (
                        <>
                          <EditSiteModal site={site} clientId={id} />
                          <ConfirmDeactivateButton
                            currentStatus={site.status}
                            action={setSiteStatusAction.bind(null, site.id, id)}
                            itemLabel={site.siteName}
                          />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            itemLabel="sites"
            buildHref={(p) => `/clients/${id}?page=${p}`}
          />
        </div>
      )}
    </div>
  );
}
