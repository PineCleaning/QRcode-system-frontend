import Link from 'next/link';
import { AttachmentsCell } from '@/components/AttachmentsCell';
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
      <div className="mb-6 flex items-start gap-3">
        <Link
          prefetch={false}
          href={`/clients/${id}`}
          aria-label={`Back to ${client.name}`}
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
          <p className="mt-1 text-[13.5px] text-ink-muted">{site.siteName}</p>
          <p className="mt-1 text-xs text-ink-muted/70">{site.slug}</p>
        </div>
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
                    <AttachmentsCell media={item.media} />
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
