import Link from 'next/link';
import { ConfirmDeleteButton } from '@/components/ConfirmDeleteButton';
import { FilterPendingProvider } from '@/components/FilterPending';
import { MediaLightboxProvider, MediaReviewButton } from '@/components/MediaLightbox';
import { ResultsContainer } from '@/components/ResultsContainer';
import { CardGridSkeleton } from '@/components/skeletons/CardGridSkeleton';
import { apiFetch } from '@/lib/api/server-fetch';
import type { AdminMediaItem, Client, Site } from '@/lib/api/types';
import { deleteMediaAction } from './actions';
import { FeedbackFilters } from '../feedback/FeedbackFilters';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ clientCode?: string; siteId?: string; error?: string }>;
}) {
  const { clientCode, siteId, error } = await searchParams;

  const query = new URLSearchParams();
  if (clientCode) query.set('clientCode', clientCode);
  if (siteId) query.set('siteId', siteId);
  const queryString = query.toString() ? `?${query.toString()}` : '';

  const [clients, sites, media] = await Promise.all([
    apiFetch<Client[]>('/clients'),
    clientCode ? apiFetch<Site[]>(`/clients/${clientCode}/sites`) : Promise.resolve<Site[]>([]),
    apiFetch<AdminMediaItem[]>(`/admin/media${queryString}`),
  ]);

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-balance">Assets</h1>
          <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold text-page">{media.length}</span>
        </div>
        <p className="mt-1 text-[13.5px] text-ink-muted">All feedback attachments across every client and site.</p>
      </div>

      <FilterPendingProvider>
        <FeedbackFilters basePath="/assets" clients={clients} sites={sites} clientCode={clientCode} siteId={siteId} />

        {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

        <ResultsContainer skeleton={<CardGridSkeleton />}>
          {media.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-[26px] border border-line bg-surface p-12 text-center shadow-sm">
              <svg className="h-10 w-10 text-ink-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M18 12.75V6.75A2.25 2.25 0 0 0 15.75 4.5H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5A2.25 2.25 0 0 0 6.75 19.5h10.5A2.25 2.25 0 0 0 19.5 17.25V15M9 9h.008v.008H9V9Z"
                />
              </svg>
              <p className="text-sm text-ink-muted">No assets yet.</p>
            </div>
          ) : (
            <MediaLightboxProvider
              items={media.map((item) => ({
                url: item.url,
                label: item.originalFilename || (item.resourceType === 'IMAGE' ? 'Photo' : 'Video'),
                resourceType: item.resourceType,
                caption: `${item.feedback.site.client.name} · ${item.feedback.site.businessName}`,
              }))}
            >
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {media.map((item, index) => {
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
                        {item.feedback.site.businessName}
                      </Link>
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink-muted/70">{formatDate(item.createdAt)}</p>

                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <MediaReviewButton index={index} />
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
            </MediaLightboxProvider>
          )}
        </ResultsContainer>
      </FilterPendingProvider>
    </div>
  );
}
