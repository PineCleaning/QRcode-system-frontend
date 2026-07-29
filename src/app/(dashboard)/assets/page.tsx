import Link from 'next/link';
import { ConfirmDeleteButton } from '@/components/ConfirmDeleteButton';
import { FilterPendingProvider } from '@/components/FilterPending';
import { ResultsContainer } from '@/components/ResultsContainer';
import { CardGridSkeleton } from '@/components/skeletons/CardGridSkeleton';
import { apiFetch } from '@/lib/api/server-fetch';
import type { AdminMediaItem, Client, Site } from '@/lib/api/types';
import { deleteMediaAction } from './actions';
import { FeedbackFilters } from '../feedback/FeedbackFilters';

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; siteId?: string; error?: string }>;
}) {
  const { clientId, siteId, error } = await searchParams;

  const query = new URLSearchParams();
  if (clientId) query.set('clientId', clientId);
  if (siteId) query.set('siteId', siteId);
  const queryString = query.toString() ? `?${query.toString()}` : '';

  const [clients, sites, media] = await Promise.all([
    apiFetch<Client[]>('/clients'),
    clientId ? apiFetch<Site[]>(`/clients/${clientId}/sites`) : Promise.resolve<Site[]>([]),
    apiFetch<AdminMediaItem[]>(`/admin/media${queryString}`),
  ]);

  return (
    <div>
      <div className="mb-6 rounded-[26px] border border-line bg-surface px-5 py-4.5 sm:px-6.5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-extrabold">Assets</h1>
          <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold text-page">{media.length}</span>
        </div>
        <p className="mt-1 text-[13.5px] text-ink-muted">All feedback attachments across every client and site.</p>
      </div>

      <FilterPendingProvider>
        <FeedbackFilters basePath="/assets" clients={clients} sites={sites} clientId={clientId} siteId={siteId} />

        {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

        <ResultsContainer skeleton={<CardGridSkeleton />}>
          {media.length === 0 ? (
            <div className="rounded-[26px] border border-line bg-surface p-8 text-center text-sm text-ink-muted shadow-sm">
              No Assets
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {media.map((item) => {
                const label = item.originalFilename || (item.resourceType === 'IMAGE' ? 'Photo' : 'Video');
                const itemLabel = item.originalFilename || (item.resourceType === 'IMAGE' ? 'this photo' : 'this video');

                return (
                  <div
                    key={item.id}
                    data-testid="asset-card"
                    className="rounded-[22px] border border-line bg-surface p-3 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                  >
                    {item.resourceType === 'IMAGE' ? (
                      <img
                        src={item.url}
                        alt={label}
                        className="aspect-square w-full rounded-2xl border border-line object-cover"
                      />
                    ) : (
                      <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-line bg-page">
                        <svg className="h-10 w-10 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m15.75 10.5 4.72-2.72a.75.75 0 0 1 1.28.53v7.38a.75.75 0 0 1-1.28.53l-4.72-2.72M4.5 18.75h9a1.5 1.5 0 0 0 1.5-1.5v-9a1.5 1.5 0 0 0-1.5-1.5h-9a1.5 1.5 0 0 0-1.5 1.5v9a1.5 1.5 0 0 0 1.5 1.5Z"
                          />
                        </svg>
                      </div>
                    )}

                    <p className="mt-2 truncate text-sm font-bold">{label}</p>
                    <p className="truncate text-xs text-ink-muted">
                      <Link prefetch={false} href={`/clients/${item.feedback.site.client.id}`} className="hover:underline">
                        {item.feedback.site.client.name}
                      </Link>
                      {' · '}
                      <Link
                        prefetch={false}
                        href={`/clients/${item.feedback.site.client.id}/sites/${item.feedback.site.id}/feedback`}
                        className="hover:underline"
                      >
                        {item.feedback.site.siteName}
                      </Link>
                    </p>

                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 rounded-xl border border-green py-1.5 text-center font-bold text-green hover:bg-green/10"
                      >
                        Review
                      </a>
                      <ConfirmDeleteButton
                        action={deleteMediaAction.bind(null, item.id)}
                        itemLabel={itemLabel}
                        warning="This permanently deletes the file from Cloudinary storage, not just from this list."
                        triggerClassName="flex-1 rounded-xl border border-coral/40 py-1.5 text-center font-bold text-coral hover:bg-coral/10"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ResultsContainer>
      </FilterPendingProvider>
    </div>
  );
}
