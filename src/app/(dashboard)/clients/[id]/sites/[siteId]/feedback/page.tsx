import Link from 'next/link';
import { RetryButton } from '@/components/RetryButton';
import { apiFetch } from '@/lib/api/server-fetch';
import type { Client, FeedbackSubmission, Site } from '@/lib/api/types';
import { retryFeedbackAction } from '@/app/(dashboard)/feedback/actions';

const STATUS_STYLES: Record<string, string> = {
  DELIVERED: 'bg-green/15 text-green',
  SUBMITTED: 'bg-ink-muted/15 text-ink-muted',
  DELIVERY_PENDING: 'bg-amber/15 text-amber',
  DELIVERY_FAILED: 'bg-coral/15 text-coral',
  DRAFT: 'bg-ink-muted/15 text-ink-muted',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

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

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 rounded-[26px] border border-line bg-surface px-5 py-4.5 sm:flex-row sm:items-center sm:justify-between sm:px-6.5">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-extrabold">Feedback</h1>
            <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold text-page">{feedback.length}</span>
          </div>
          <p className="mt-1 text-sm text-ink-muted">{site.siteName}</p>
          <p className="mt-1 text-xs text-ink-muted/70">{site.slug}</p>
        </div>
        <Link
          prefetch={false}
          href={`/clients/${id}`}
          className="inline-flex shrink-0 items-center rounded-xl border border-line px-4 py-2 text-center text-[13.5px] font-bold transition hover:-translate-y-px"
        >
          ← {client.name}
        </Link>
      </div>

      {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      {feedback.length === 0 ? (
        <div className="rounded-[26px] border border-line bg-surface p-8 text-center text-sm text-ink-muted shadow-sm">
          No Feedback Submitted
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[26px] border border-line bg-surface shadow-sm">
          <table className="w-full min-w-[720px] text-left text-[13.5px]">
            <thead className="border-b border-line text-[10.5px] font-extrabold uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="whitespace-nowrap px-5.5 py-4">Date</th>
                <th className="px-5.5 py-4">Feedback</th>
                <th className="whitespace-nowrap px-5.5 py-4">Mobile</th>
                <th className="whitespace-nowrap px-5.5 py-4">Attachments</th>
                <th className="whitespace-nowrap px-5.5 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((item) => (
                <tr key={item.id} className="border-b border-line align-top last:border-0 hover:bg-ink/[0.03]">
                  <td className="whitespace-nowrap px-5.5 py-3.5 text-ink-muted">{formatDate(item.submittedAt)}</td>
                  <td className="max-w-md px-5.5 py-3.5">
                    <p className="whitespace-pre-wrap">{item.feedback}</p>
                  </td>
                  <td className="whitespace-nowrap px-5.5 py-3.5 text-ink-muted">
                    {item.mobileNumber ?? <span className="text-xs italic text-ink-muted/70">Not provided</span>}
                  </td>
                  <td className="px-5.5 py-3.5">
                    {item.media.length === 0 ? (
                      <span className="text-xs italic text-ink-muted/70">No attachments</span>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {item.media.map((mediaItem) => {
                          const label =
                            mediaItem.originalFilename || (mediaItem.resourceType === 'IMAGE' ? 'Photo' : 'Video');
                          const icon =
                            mediaItem.resourceType === 'IMAGE' ? (
                              <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M2.25 15.75 8.69 9.31a1.125 1.125 0 0 1 1.591 0L15.75 15m-2.25-2.25 1.72-1.72a1.125 1.125 0 0 1 1.591 0L21.75 15m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6.75a1.5 1.5 0 0 0-1.5-1.5H3.75a1.5 1.5 0 0 0-1.5 1.5v10.5a1.5 1.5 0 0 0 1.5 1.5Z"
                                />
                              </svg>
                            ) : (
                              <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m15.75 10.5 4.72-2.72a.75.75 0 0 1 1.28.53v7.38a.75.75 0 0 1-1.28.53l-4.72-2.72M4.5 18.75h9a1.5 1.5 0 0 0 1.5-1.5v-9a1.5 1.5 0 0 0-1.5-1.5h-9a1.5 1.5 0 0 0-1.5 1.5v9a1.5 1.5 0 0 0 1.5 1.5Z"
                                />
                              </svg>
                            );

                          if (mediaItem.url) {
                            return (
                              <a
                                key={mediaItem.id}
                                href={mediaItem.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex max-w-[180px] items-center gap-1.5 text-sky hover:underline"
                              >
                                {icon}
                                <span className="truncate">{label}</span>
                              </a>
                            );
                          }

                          return (
                            <span key={mediaItem.id} className="flex max-w-[180px] items-center gap-1.5 text-ink-muted/70">
                              {icon}
                              <span className="truncate">{label}</span>
                              <span className="shrink-0 text-[10px] text-coral">
                                ({mediaItem.status === 'REJECTED' ? 'Rejected' : 'Unavailable'})
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    )}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
