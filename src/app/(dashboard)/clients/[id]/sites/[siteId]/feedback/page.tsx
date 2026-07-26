import Link from 'next/link';
import { apiFetch } from '@/lib/api/server-fetch';
import type { Client, FeedbackSubmission, Site } from '@/lib/api/types';

const STATUS_STYLES: Record<string, string> = {
  DELIVERED: 'bg-green-100 text-green-700',
  SUBMITTED: 'bg-gray-100 text-gray-600',
  DELIVERY_PENDING: 'bg-yellow-100 text-yellow-700',
  DELIVERY_FAILED: 'bg-red-100 text-red-700',
  DRAFT: 'bg-gray-100 text-gray-600',
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
}: {
  params: Promise<{ id: string; siteId: string }>;
}) {
  const { id, siteId } = await params;
  const [client, site, feedback] = await Promise.all([
    apiFetch<Client>(`/clients/${id}`),
    apiFetch<Site>(`/sites/${siteId}`),
    apiFetch<FeedbackSubmission[]>(`/sites/${siteId}/feedback`),
  ]);

  return (
    <div>
      <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Feedback</h1>
          <span className="rounded-full bg-gray-900 px-2.5 py-0.5 text-xs font-semibold text-white">
            {feedback.length}
          </span>
        </div>
        <nav className="mt-1 flex flex-wrap items-center gap-1 text-sm text-gray-500">
          <Link prefetch={false} href="/clients" className="hover:underline">
            Clients
          </Link>
          <span>/</span>
          <Link prefetch={false} href={`/clients/${id}`} className="hover:underline">
            {client.name}
          </Link>
          <span>/</span>
          <span className="text-gray-700">{site.siteName}</span>
        </nav>
        <p className="mt-1 text-xs text-gray-400">{site.slug}</p>
      </div>

      {feedback.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          No Feedback Submitted
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="whitespace-nowrap px-4 py-3">Date</th>
                <th className="px-4 py-3">Feedback</th>
                <th className="whitespace-nowrap px-4 py-3">Mobile</th>
                <th className="whitespace-nowrap px-4 py-3">Attachments</th>
                <th className="whitespace-nowrap px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 align-top last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500">{formatDate(item.submittedAt)}</td>
                  <td className="max-w-md px-4 py-3 text-gray-900">
                    <p className="whitespace-pre-wrap">{item.feedback}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                    {item.mobileNumber ?? <span className="text-xs italic text-gray-400">Not provided</span>}
                  </td>
                  <td className="px-4 py-3">
                    {item.media.length === 0 ? (
                      <span className="text-xs italic text-gray-400">No attachments</span>
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
                                className="flex max-w-[180px] items-center gap-1.5 text-blue-600 hover:underline"
                              >
                                {icon}
                                <span className="truncate">{label}</span>
                              </a>
                            );
                          }

                          return (
                            <span key={mediaItem.id} className="flex max-w-[180px] items-center gap-1.5 text-gray-400">
                              {icon}
                              <span className="truncate">{label}</span>
                              <span className="shrink-0 text-[10px] text-red-500">
                                ({mediaItem.status === 'REJECTED' ? 'Rejected' : 'Unavailable'})
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[item.status] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
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
