import Link from 'next/link';
import { AttachmentsCell } from '@/components/AttachmentsCell';
import { ConfirmDeleteButton } from '@/components/ConfirmDeleteButton';
import { MediaLightboxProvider } from '@/components/MediaLightbox';
import { RetryButton } from '@/components/RetryButton';
import { TruncatedText } from '@/components/TruncatedText';
import { apiFetch } from '@/lib/api/server-fetch';
import type { Client, FeedbackSubmission, Site } from '@/lib/api/types';
import { formatDate } from '@/lib/format-date';
import { deleteFeedbackAction, retryFeedbackAction } from '@/app/(dashboard)/feedback/actions';

const STATUS_STYLES: Record<string, string> = {
  DELIVERED: 'bg-green/15 text-green',
  SUBMITTED: 'bg-ink-muted/15 text-ink-muted',
  DELIVERY_PENDING: 'bg-amber/15 text-amber',
  DELIVERY_FAILED: 'bg-coral/15 text-coral',
  DRAFT: 'bg-ink-muted/15 text-ink-muted',
};

export default async function SiteFeedbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; siteId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id, siteId } = await params;
  const { error } = await searchParams;
  const [client, site, feedback] = await Promise.all([
    apiFetch<Client>(`/clients/${id}`),
    apiFetch<Site>(`/sites/${siteId}`),
    apiFetch<FeedbackSubmission[]>(`/sites/${siteId}/feedback`),
  ]);

  // Same shared-lightbox setup as the main Feedback page, scoped to
  // this one site's rows only.
  const verifiedMedia = feedback.flatMap((item) => item.media.filter((m) => m.url));
  const mediaIndexMap = new Map(verifiedMedia.map((m, i) => [m.id, i]));
  const lightboxItems = verifiedMedia.map((m) => ({
    url: m.url!,
    label: m.originalFilename || (m.resourceType === 'IMAGE' ? 'Photo' : 'Video'),
    resourceType: m.resourceType,
    caption: site.businessName,
  }));

  return (
    <div>
      <div className="mb-6 flex items-start gap-3">
        <Link
          prefetch={false}
          href={`/clients/${id}`}
          aria-label={`Back to ${client.clientName}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-ink transition hover:-translate-y-px"
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight">Feedback</h1>
            <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold text-page">{feedback.length}</span>
          </div>
          <p className="mt-1 text-[13.5px] text-ink-muted">{site.businessName}</p>
          <p className="mt-1 text-xs text-ink-muted/70">{site.slug}</p>
        </div>
      </div>

      {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      {feedback.length === 0 ? (
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
        <div className="overflow-x-auto rounded-[26px] border border-line bg-surface shadow-sm">
          <table className="w-full min-w-[720px] text-left text-[13.5px]">
            <thead className="border-b border-line text-[10.5px] font-extrabold uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="whitespace-nowrap px-5.5 py-4">Date</th>
                <th className="px-5.5 py-4">Feedback</th>
                <th className="whitespace-nowrap px-5.5 py-4">Mobile</th>
                <th className="whitespace-nowrap px-5.5 py-4">Attachments</th>
                <th className="whitespace-nowrap px-5.5 py-4 text-center">Status</th>
                <th className="whitespace-nowrap px-5.5 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((item) => (
                <tr key={item.id} className="border-b border-line align-top last:border-0 hover:bg-ink/[0.03]">
                  <td className="whitespace-nowrap px-5.5 py-3.5 font-semibold tabular-nums text-ink/80">{formatDate(item.submittedAt)}</td>
                  <td className="max-w-md px-5.5 py-3.5 font-semibold text-ink/80">
                    <TruncatedText text={item.feedback} lines={2} />
                  </td>
                  <td className="whitespace-nowrap px-5.5 py-3.5 font-semibold tabular-nums text-ink/80">
                    {item.mobileNumber ?? <span className="text-xs italic text-ink-muted/70">Not provided</span>}
                  </td>
                  <td className="px-5.5 py-3.5">
                    <AttachmentsCell
                      media={item.media}
                      pathToRevalidate={`/clients/${id}/sites/${siteId}/feedback`}
                      mediaIndexMap={mediaIndexMap}
                    />
                  </td>
                  <td className="px-5.5 py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <span
                        className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                          STATUS_STYLES[item.status] ?? 'bg-ink-muted/15 text-ink-muted'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                      {item.status === 'DELIVERY_FAILED' && (
                        <RetryButton
                          action={retryFeedbackAction.bind(null, item.id, `/clients/${id}/sites/${siteId}/feedback`)}
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-5.5 py-3.5 text-center">
                    <ConfirmDeleteButton
                      action={deleteFeedbackAction.bind(null, item.id, `/clients/${id}/sites/${siteId}/feedback`)}
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
        </MediaLightboxProvider>
      )}
    </div>
  );
}
