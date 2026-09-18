import Link from 'next/link';
import { FeedbackFilters } from '@/app/(dashboard)/feedback/FeedbackFilters';
import { FilterPendingProvider } from '@/components/FilterPending';
import { Pagination } from '@/components/Pagination';
import { ResultsContainer } from '@/components/ResultsContainer';
import { COMPLETED_INSPECTIONS_SKELETON_COLUMNS } from '@/components/skeletons/completed-inspections-skeleton-columns';
import { TableRowsSkeleton } from '@/components/skeletons/TableRowsSkeleton';
import { apiFetch } from '@/lib/api/server-fetch';
import type { Client, PaginatedAdminCompletedInspections, PaginatedSites } from '@/lib/api/types';
import { formatDate } from '@/lib/format-date';

const PATH = '/inspections';
const PAGE_SIZE = 10;

export default async function GlobalCompletedInspectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ clientCode?: string; siteId?: string; page?: string }>;
}) {
  const { clientCode, siteId, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const query = new URLSearchParams();
  if (clientCode) query.set('clientCode', clientCode);
  if (siteId) query.set('siteId', siteId);
  query.set('page', String(page));
  query.set('pageSize', String(PAGE_SIZE));

  const [clients, sitesResult, { data: inspections, total }] = await Promise.all([
    apiFetch<Client[]>('/clients'),
    clientCode
      ? apiFetch<PaginatedSites>(`/clients/${clientCode}/sites?pageSize=200`)
      : Promise.resolve<PaginatedSites>({ data: [], total: 0, page: 1, pageSize: 0 }),
    apiFetch<PaginatedAdminCompletedInspections>(`/admin/inspections/completed?${query.toString()}`),
  ]);
  const sites = sitesResult.data;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filterQuery = new URLSearchParams();
  if (clientCode) filterQuery.set('clientCode', clientCode);
  if (siteId) filterQuery.set('siteId', siteId);

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-balance">Completed Inspections</h1>
          <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold text-page">{total}</span>
        </div>
        <p className="mt-1 text-[13.5px] text-ink-muted">Every completed inspection across every client and site.</p>
      </div>

      <FilterPendingProvider>
        <FeedbackFilters basePath={PATH} clients={clients} sites={sites} clientCode={clientCode} siteId={siteId} />

        <ResultsContainer skeleton={<TableRowsSkeleton columns={COMPLETED_INSPECTIONS_SKELETON_COLUMNS} minWidth={1040} />}>
          {total === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-[26px] border border-line bg-surface p-12 text-center shadow-sm">
              <svg className="h-10 w-10 text-ink-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <p className="text-sm text-ink-muted">No inspections have been completed yet.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[26px] border border-line bg-surface shadow-sm">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] text-left text-[13.5px]">
                <thead className="border-b border-line text-[12.5px] font-extrabold uppercase tracking-wide text-ink-muted">
                  <tr>
                    <th className="whitespace-nowrap px-5.5 py-4">Client</th>
                    <th className="whitespace-nowrap px-5.5 py-4">Site</th>
                    <th className="whitespace-nowrap px-5.5 py-4">Inspected By</th>
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
                      <td className="max-w-[160px] px-5.5 py-3.5 font-bold">{inspection.site.client.clientName}</td>
                      <td className="max-w-[160px] px-5.5 py-3.5 font-semibold text-ink/80">{inspection.site.businessName}</td>
                      <td className="whitespace-nowrap px-5.5 py-3.5 font-semibold text-ink/80">
                        {inspection.inspectedBy ?? <span className="text-ink-muted/40">—</span>}
                      </td>
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
                        <div className="flex items-center gap-3">
                          <Link
                            prefetch={false}
                            href={`/clients/${inspection.site.client.id}/sites/${inspection.siteId}/inspections/${inspection.id}`}
                            className="text-ink-muted hover:text-ink hover:underline"
                          >
                            View
                          </Link>
                          <a
                            href={`/api/inspection-report/${inspection.id}`}
                            download={`inspection-report-${inspection.id}.pdf`}
                            className="text-ink-muted hover:text-ink hover:underline"
                          >
                            Report
                          </a>
                        </div>
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
                itemLabel="inspections"
                buildHref={(p) => `${PATH}?${new URLSearchParams({ ...Object.fromEntries(filterQuery), page: String(p) }).toString()}`}
              />
            </div>
          )}
        </ResultsContainer>
      </FilterPendingProvider>
    </div>
  );
}
