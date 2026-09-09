import Link from 'next/link';
import { apiFetch } from '@/lib/api/server-fetch';
import type { Client, Site } from '@/lib/api/types';
import { formatDate } from '@/lib/format-date';
import { findCompletedInspectionsAction } from '../actions';

export default async function InspectionHistoryPage({
  params,
}: {
  params: Promise<{ id: string; siteId: string }>;
}) {
  const { id, siteId } = await params;

  const [client, site, inspections] = await Promise.all([
    apiFetch<Client>(`/clients/${id}`),
    apiFetch<Site>(`/sites/${siteId}`),
    findCompletedInspectionsAction(siteId),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-start gap-3">
        <Link
          prefetch={false}
          href={`/clients/${id}/sites/${siteId}/inspections`}
          aria-label="Back to Site Inspection"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-ink transition hover:-translate-y-px"
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight">Past Inspections</h1>
            <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold text-page">{inspections.length}</span>
          </div>
          <p className="mt-1 text-[13.5px] text-ink-muted">
            {site.businessName} · {client.clientName} · Most recent 10 completed sessions
          </p>
        </div>
      </div>

      {inspections.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[26px] border border-line bg-surface p-12 text-center shadow-sm">
          <svg className="h-10 w-10 text-ink-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <p className="text-sm text-ink-muted">No inspections have been completed yet for this site.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[26px] border border-line bg-surface shadow-sm">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[13.5px]">
            <thead className="border-b border-line text-[10.5px] font-extrabold uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="whitespace-nowrap px-5.5 py-4">Completed</th>
                <th className="whitespace-nowrap px-5.5 py-4">Spaces</th>
                <th className="whitespace-nowrap px-5.5 py-4">Average</th>
                <th className="whitespace-nowrap px-5.5 py-4">Standard</th>
                <th className="whitespace-nowrap px-5.5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inspections.map((inspection) => (
                <tr key={inspection.id} className="border-b border-line align-top last:border-0 hover:bg-ink/[0.03]">
                  <td className="whitespace-nowrap px-5.5 py-3.5 font-semibold text-ink/80">
                    {inspection.completedAt ? formatDate(inspection.completedAt) : <span className="text-ink-muted/40">—</span>}
                  </td>
                  <td className="px-5.5 py-3.5 font-semibold tabular-nums text-ink/80">{inspection.itemCount}</td>
                  <td className="px-5.5 py-3.5 font-bold tabular-nums text-ink">
                    {inspection.averageScore !== null ? `${inspection.averageScore}%` : <span className="text-ink-muted/40">—</span>}
                  </td>
                  <td className="px-5.5 py-3.5">
                    <span
                      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                        inspection.meetsStandard ? 'bg-green/15 text-green' : 'bg-coral/15 text-coral'
                      }`}
                    >
                      {inspection.meetsStandard ? 'MEETS STANDARD' : 'BELOW STANDARD'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5.5 py-3.5 font-bold">
                    <Link
                      prefetch={false}
                      href={`/clients/${id}/sites/${siteId}/inspections/${inspection.id}`}
                      className="text-ink-muted hover:text-ink hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
