import Link from 'next/link';
import { AttachmentsCell } from '@/components/AttachmentsCell';
import { RetryButton } from '@/components/RetryButton';
import { apiFetch } from '@/lib/api/server-fetch';
import type { AdminFeedbackSubmission, Client, Site } from '@/lib/api/types';
import { retryFeedbackAction } from './actions';
import { FeedbackFilters } from './FeedbackFilters';

const STATUS_STYLES: Record<string, string> = {
  DELIVERED: 'bg-green/15 text-green',
  SUBMITTED: 'bg-ink-muted/15 text-ink-muted',
  DELIVERY_PENDING: 'bg-amber/15 text-amber',
  DELIVERY_FAILED: 'bg-coral/15 text-coral',
  DRAFT: 'bg-ink-muted/15 text-ink-muted',
};

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; siteId?: string; error?: string }>;
}) {
  const { clientId, siteId, error } = await searchParams;

  const query = new URLSearchParams();
  if (clientId) query.set('clientId', clientId);
  if (siteId) query.set('siteId', siteId);
  const queryString = query.toString() ? `?${query.toString()}` : '';

  const [clients, sites, feedback] = await Promise.all([
    apiFetch<Client[]>('/clients'),
    clientId ? apiFetch<Site[]>(`/clients/${clientId}/sites`) : Promise.resolve<Site[]>([]),
    apiFetch<AdminFeedbackSubmission[]>(`/admin/feedback${queryString}`),
  ]);

  return (
    <div>
      <div className="mb-6 rounded-[26px] border border-line bg-surface px-5 py-4.5 sm:px-6.5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-extrabold">Feedback</h1>
          <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold text-page">{feedback.length}</span>
        </div>
        <p className="mt-1 text-[13.5px] text-ink-muted">All feedback across every client and site.</p>
      </div>

      <FeedbackFilters basePath="/feedback" clients={clients} sites={sites} clientId={clientId} siteId={siteId} />

      {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      {feedback.length === 0 ? (
        <div className="rounded-[26px] border border-line bg-surface p-8 text-center text-sm text-ink-muted shadow-sm">
          No Feedback Submitted
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[26px] border border-line bg-surface shadow-sm">
          <table className="w-full min-w-[880px] text-left text-[13.5px]">
            <thead className="border-b border-line text-[10.5px] font-extrabold uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="whitespace-nowrap px-5.5 py-4">Client</th>
                <th className="whitespace-nowrap px-5.5 py-4">Site</th>
                <th className="px-5.5 py-4">Feedback</th>
                <th className="whitespace-nowrap px-5.5 py-4">Mobile</th>
                <th className="whitespace-nowrap px-5.5 py-4">Attachments</th>
                <th className="whitespace-nowrap px-5.5 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((item) => (
                <tr key={item.id} className="border-b border-line align-top last:border-0 hover:bg-ink/[0.03]">
                  <td className="whitespace-nowrap px-5.5 py-3.5">
                    <Link
                      prefetch={false}
                      href={`/clients/${item.site.client.id}/sites/${item.site.id}/feedback`}
                      className="font-bold hover:underline"
                    >
                      {item.site.client.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-5.5 py-3.5">
                    <Link
                      prefetch={false}
                      href={`/clients/${item.site.client.id}/sites/${item.site.id}/feedback`}
                      className="text-ink-muted hover:text-ink hover:underline"
                    >
                      {item.site.siteName}
                    </Link>
                  </td>
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
                        <RetryButton action={retryFeedbackAction.bind(null, item.id, '/feedback')} />
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
