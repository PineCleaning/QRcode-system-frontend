import Link from 'next/link';
import { AttachmentsCell } from '@/components/AttachmentsCell';
import { ConfirmDeleteButton } from '@/components/ConfirmDeleteButton';
import { FilterPendingProvider } from '@/components/FilterPending';
import { MediaLightboxProvider } from '@/components/MediaLightbox';
import { Pagination } from '@/components/Pagination';
import { RetryButton } from '@/components/RetryButton';
import { ResultsContainer } from '@/components/ResultsContainer';
import { TableRowsSkeleton } from '@/components/skeletons/TableRowsSkeleton';
import { TruncatedText } from '@/components/TruncatedText';
import { apiFetch } from '@/lib/api/server-fetch';
import type { Client, PaginatedFeedback, PaginatedSites } from '@/lib/api/types';
import { formatDate } from '@/lib/format-date';
import { deleteFeedbackAction, retryFeedbackAction } from './actions';
import { FeedbackFilters } from './FeedbackFilters';

const STATUS_STYLES: Record<string, string> = {
  DELIVERED: 'bg-green/15 text-green',
  SUBMITTED: 'bg-ink-muted/15 text-ink-muted',
  DELIVERY_PENDING: 'bg-amber/15 text-amber',
  DELIVERY_FAILED: 'bg-coral/15 text-coral',
  DRAFT: 'bg-ink-muted/15 text-ink-muted',
};

const PAGE_SIZE = 50;

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ clientCode?: string; siteId?: string; error?: string; page?: string }>;
}) {
  const { clientCode, siteId, error, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const query = new URLSearchParams();
  if (clientCode) query.set('clientCode', clientCode);
  if (siteId) query.set('siteId', siteId);
  query.set('page', String(page));
  query.set('pageSize', String(PAGE_SIZE));

  const [clients, sitesResult, { data: feedback, total }] = await Promise.all([
    apiFetch<Client[]>('/clients'),
    clientCode ? apiFetch<PaginatedSites>(`/clients/${clientCode}/sites?pageSize=200`) : Promise.resolve<PaginatedSites>({ data: [], total: 0, page: 1, pageSize: 0 }),
    apiFetch<PaginatedFeedback>(`/admin/feedback?${query.toString()}`),
  ]);
  const sites = sitesResult.data;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filterQuery = new URLSearchParams();
  if (clientCode) filterQuery.set('clientCode', clientCode);
  if (siteId) filterQuery.set('siteId', siteId);

  // Every verified attachment across every row on this page, flattened
  // into one shared list - lets any attachment link open the lightbox
  // and Prev/Next through every other one, not just the ones in its
  // own row. mediaIndexMap maps a media id back to its position in
  // this flat list so AttachmentsCell can open the right item.
  const verifiedMedia = feedback.flatMap((item) => item.media.filter((m) => m.url));
  const mediaIndexMap = new Map(verifiedMedia.map((m, i) => [m.id, i]));
  const lightboxItems = verifiedMedia.map((m) => {
    const parentFeedback = feedback.find((f) => f.media.some((fm) => fm.id === m.id))!;
    return {
      url: m.url!,
      label: m.originalFilename || (m.resourceType === 'IMAGE' ? 'Photo' : 'Video'),
      resourceType: m.resourceType,
      caption: `${parentFeedback.site.client.clientName} · ${parentFeedback.site.businessName}`,
    };
  });

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-balance">Feedback</h1>
          <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold text-page">{total}</span>
        </div>
        <p className="mt-1 text-[13.5px] text-ink-muted">All feedback across every client and site.</p>
      </div>

      <FilterPendingProvider>
        <FeedbackFilters basePath="/feedback" clients={clients} sites={sites} clientCode={clientCode} siteId={siteId} />

        {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

        <ResultsContainer skeleton={<TableRowsSkeleton />}>
          {total === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-[26px] border border-line bg-surface p-12 text-center shadow-sm">
              <svg className="h-10 w-10 text-ink-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                />
              </svg>
              <p className="text-sm text-ink-muted">No feedback submitted yet.</p>
            </div>
          ) : (
            <MediaLightboxProvider items={lightboxItems}>
            <div className="overflow-hidden rounded-[26px] border border-line bg-surface shadow-sm">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[1020px] table-fixed text-left text-[13.5px]">
                <colgroup>
                  <col className="w-[10%]" />
                  <col className="w-[11%]" />
                  <col className="w-[11%]" />
                  <col className="w-[18%]" />
                  <col className="w-[9%]" />
                  <col className="w-[10%]" />
                  <col className="w-[13%]" />
                  <col className="w-[11%]" />
                  <col className="w-[7%]" />
                </colgroup>
                <thead className="border-b border-line text-[10.5px] font-extrabold uppercase tracking-wide text-ink-muted">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-4">Client</th>
                    <th className="whitespace-nowrap px-4 py-4">Site</th>
                    <th className="whitespace-nowrap px-4 py-4">Address</th>
                    <th className="px-4 py-4">Feedback</th>
                    <th className="whitespace-nowrap px-4 py-4">Mobile</th>
                    <th className="whitespace-nowrap px-4 py-4">Attachments</th>
                    <th className="whitespace-nowrap px-4 py-4">Date</th>
                    <th className="whitespace-nowrap px-4 py-4 text-center">Status</th>
                    <th className="whitespace-nowrap px-4 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {feedback.map((item) => (
                    <tr key={item.id} className="border-b border-line align-top last:border-0 hover:bg-ink/[0.03]">
                      <td className="px-4 py-3.5">
                        <TruncatedText text={item.site.client.clientName} lines={1}>
                          <Link
                            prefetch={false}
                            href={`/clients/${item.site.client.id}/sites/${item.site.id}/feedback`}
                            className="font-bold hover:underline"
                          >
                            {item.site.client.clientName}
                          </Link>
                        </TruncatedText>
                      </td>
                      <td className="px-4 py-3.5">
                        <TruncatedText text={item.site.businessName} lines={1}>
                          <Link
                            prefetch={false}
                            href={`/clients/${item.site.client.id}/sites/${item.site.id}/feedback`}
                            className="font-semibold text-ink/80 hover:text-ink hover:underline"
                          >
                            {item.site.businessName}
                          </Link>
                        </TruncatedText>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-ink/80">
                        {item.site.address ? (
                          <TruncatedText text={item.site.address} lines={1} />
                        ) : (
                          <span className="text-xs italic text-ink-muted/70">Not provided</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-ink/80">
                        <TruncatedText text={item.feedback} lines={2} />
                      </td>
                      <td className="truncate px-4 py-3.5 font-semibold tabular-nums text-ink/80">
                        {item.mobileNumber ?? <span className="text-xs italic text-ink-muted/70">Not provided</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <AttachmentsCell media={item.media} pathToRevalidate="/feedback" mediaIndexMap={mediaIndexMap} />
                      </td>
                      <td className="px-4 py-3.5 font-semibold tabular-nums text-ink/80">
                        <TruncatedText text={formatDate(item.submittedAt)} lines={1} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <span
                            className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                              STATUS_STYLES[item.status] ?? 'bg-ink-muted/15 text-ink-muted'
                            }`}
                          >
                            {item.status.replace('_', ' ')}
                          </span>
                          {item.status === 'DELIVERY_FAILED' && (
                            <RetryButton action={retryFeedbackAction.bind(null, item.id, '/feedback')} />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <ConfirmDeleteButton
                          action={deleteFeedbackAction.bind(null, item.id, '/feedback')}
                          itemLabel="this feedback submission"
                          warning={
                            item.clickupTaskId
                              ? 'This also deletes its ClickUp ticket and every attachment - none of it can be recovered.'
                              : 'This also deletes every attachment - none of it can be recovered.'
                          }
                          triggerClassName="rounded-lg border border-coral/30 px-2.5 py-1 text-[11.5px] font-bold text-coral hover:bg-coral/10"
                        />
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
                itemLabel="feedback submissions"
                buildHref={(p) => `/feedback?${new URLSearchParams({ ...Object.fromEntries(filterQuery), page: String(p) }).toString()}`}
              />
            </div>
            </MediaLightboxProvider>
          )}
        </ResultsContainer>
      </FilterPendingProvider>
    </div>
  );
}
