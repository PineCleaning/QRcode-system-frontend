import Link from 'next/link';
import { apiFetch } from '@/lib/api/server-fetch';
import type { FeedbackSubmission, Site } from '@/lib/api/types';

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
  const [site, feedback] = await Promise.all([
    apiFetch<Site>(`/sites/${siteId}`),
    apiFetch<FeedbackSubmission[]>(`/sites/${siteId}/feedback`),
  ]);

  return (
    <div>
      <div className="mb-6">
        <Link prefetch={false} href={`/clients/${id}`} className="text-sm text-gray-500 hover:underline">
          ← {site.siteName}
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-gray-900">Feedback — {site.siteName}</h1>
        <p className="text-sm text-gray-500">{site.slug}</p>
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
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500">{item.mobileNumber ?? '—'}</td>
                  <td className="px-4 py-3">
                    {item.media.length === 0 ? (
                      <span className="text-gray-400">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {item.media.map((mediaItem) =>
                          mediaItem.url ? (
                            mediaItem.resourceType === 'IMAGE' ? (
                              <a key={mediaItem.id} href={mediaItem.url} target="_blank" rel="noreferrer">
                                <img
                                  src={mediaItem.url}
                                  alt={mediaItem.originalFilename ?? 'Feedback attachment'}
                                  className="h-12 w-12 rounded-md border border-gray-200 object-cover"
                                />
                              </a>
                            ) : (
                              <a
                                key={mediaItem.id}
                                href={mediaItem.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex h-12 w-12 items-center justify-center rounded-md border border-gray-200 text-[10px] text-blue-600 hover:underline"
                              >
                                Video
                              </a>
                            )
                          ) : (
                            <span
                              key={mediaItem.id}
                              className="flex h-12 w-12 items-center justify-center rounded-md border border-dashed border-gray-300 text-center text-[9px] text-gray-400"
                            >
                              {mediaItem.status === 'REJECTED' ? 'Rejected' : 'Unavailable'}
                            </span>
                          ),
                        )}
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
