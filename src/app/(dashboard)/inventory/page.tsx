import Link from 'next/link';
import { EditInventoryItemModal } from '@/app/(dashboard)/clients/[id]/sites/[siteId]/inventory/EditInventoryItemModal';
import { deleteInventoryItemAction } from '@/app/(dashboard)/clients/[id]/sites/[siteId]/inventory/actions';
import { CATEGORY_LABELS, STATUS_BADGE_STYLES, STATUS_LABELS } from '@/app/(dashboard)/clients/[id]/sites/[siteId]/inventory/inventory-labels';
import { FeedbackFilters } from '@/app/(dashboard)/feedback/FeedbackFilters';
import { ConfirmDeleteButton } from '@/components/ConfirmDeleteButton';
import { FilterPendingProvider } from '@/components/FilterPending';
import { Pagination } from '@/components/Pagination';
import { ResultsContainer } from '@/components/ResultsContainer';
import { INVENTORY_SKELETON_COLUMNS } from '@/components/skeletons/inventory-skeleton-columns';
import { TableRowsSkeleton } from '@/components/skeletons/TableRowsSkeleton';
import { TruncatedText } from '@/components/TruncatedText';
import { apiFetch } from '@/lib/api/server-fetch';
import { getCurrentAdmin } from '@/lib/api/current-admin';
import type { Client, PaginatedAdminInventory, PaginatedSites } from '@/lib/api/types';
import { formatDate, formatDateOnly } from '@/lib/format-date';
import { AddGlobalInventoryItemModal } from './AddGlobalInventoryItemModal';

const PATH = '/inventory';
const PAGE_SIZE = 10;

export default async function GlobalInventoryPage({
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

  const [clients, sitesResult, { data: items, total }, currentAdmin] = await Promise.all([
    apiFetch<Client[]>('/clients'),
    clientCode
      ? apiFetch<PaginatedSites>(`/clients/${clientCode}/sites?pageSize=200`)
      : Promise.resolve<PaginatedSites>({ data: [], total: 0, page: 1, pageSize: 0 }),
    apiFetch<PaginatedAdminInventory>(`/admin/inventory?${query.toString()}`),
    getCurrentAdmin(),
  ]);
  const sites = sitesResult.data;
  // Deleting an inventory item is Admin-only (backend RolesGuard) - mirrored here so Supervisors never see a button that would 403.
  const isAdmin = currentAdmin?.role === 'ADMIN';
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filterQuery = new URLSearchParams();
  if (clientCode) filterQuery.set('clientCode', clientCode);
  if (siteId) filterQuery.set('siteId', siteId);

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-balance">Inventory / Assets</h1>
              <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold text-page">{total}</span>
            </div>
            <p className="mt-1 text-[13.5px] text-ink-muted">Every tracked item across every client and site.</p>
          </div>
          <AddGlobalInventoryItemModal clients={clients} path={PATH} />
        </div>
      </div>

      <FilterPendingProvider>
        <FeedbackFilters basePath={PATH} clients={clients} sites={sites} clientCode={clientCode} siteId={siteId} />

        {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

        <ResultsContainer skeleton={<TableRowsSkeleton columns={INVENTORY_SKELETON_COLUMNS} minWidth={1100} />}>
          {total === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-[26px] border border-line bg-surface p-12 text-center shadow-sm">
              <svg className="h-10 w-10 text-ink-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375C2.754 3.75 2.25 4.254 2.25 4.875v1.5c0 .621.504 1.125 1.125 1.125Z"
                />
              </svg>
              <p className="text-sm text-ink-muted">No inventory items found.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[26px] border border-line bg-surface shadow-sm">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-[13.5px]">
                <thead className="border-b border-line text-[12.5px] font-extrabold uppercase tracking-wide text-ink-muted">
                  <tr>
                    <th className="whitespace-nowrap px-5.5 py-4">Client</th>
                    <th className="whitespace-nowrap px-5.5 py-4">Site</th>
                    <th className="whitespace-nowrap px-5.5 py-4">Item</th>
                    <th className="whitespace-nowrap px-5.5 py-4">Type</th>
                    <th className="whitespace-nowrap px-5.5 py-4">Status</th>
                    <th className="whitespace-nowrap px-5.5 py-4">Quantity</th>
                    <th className="whitespace-nowrap px-5.5 py-4">Last Supplied</th>
                    <th className="px-5.5 py-4">Notes</th>
                    <th className="whitespace-nowrap px-5.5 py-4">Last Updated</th>
                    <th className="whitespace-nowrap px-5.5 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-line align-top last:border-0 hover:bg-ink/[0.03]">
                      <td className="max-w-[160px] px-5.5 py-3.5">
                        <TruncatedText text={item.site.client.clientName} lines={1} className="break-all">
                          <Link
                            prefetch={false}
                            href={`/clients/${item.site.client.id}/sites/${item.site.id}/inventory`}
                            className="font-bold hover:underline"
                          >
                            {item.site.client.clientName}
                          </Link>
                        </TruncatedText>
                      </td>
                      <td className="max-w-[160px] px-5.5 py-3.5">
                        <TruncatedText text={item.site.businessName} lines={1}>
                          <Link
                            prefetch={false}
                            href={`/clients/${item.site.client.id}/sites/${item.site.id}/inventory`}
                            className="font-semibold text-ink/80 hover:text-ink hover:underline"
                          >
                            {item.site.businessName}
                          </Link>
                        </TruncatedText>
                      </td>
                      <td className="max-w-[180px] px-5.5 py-3.5 font-bold">
                        <TruncatedText text={item.item} lines={2} className="break-all" />
                      </td>
                      <td className="max-w-[200px] px-5.5 py-3.5 font-semibold text-ink/80">
                        <TruncatedText text={CATEGORY_LABELS[item.category]} lines={1} />
                      </td>
                      <td className="px-5.5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold ${STATUS_BADGE_STYLES[item.status]}`}
                        >
                          {STATUS_LABELS[item.status]}
                        </span>
                      </td>
                      <td className="px-5.5 py-3.5 font-semibold tabular-nums text-ink/80">{item.quantity}</td>
                      <td className="whitespace-nowrap px-5.5 py-3.5 font-semibold text-ink/80">
                        {item.lastSupplied ? formatDateOnly(item.lastSupplied) : <span className="text-ink-muted/40">—</span>}
                      </td>
                      <td className="max-w-xs px-5.5 py-3.5 text-ink/80">
                        {item.notes ? (
                          <TruncatedText text={item.notes} lines={2} className="break-all" />
                        ) : (
                          <span className="text-ink-muted/40">—</span>
                        )}
                      </td>
                      <td className="px-5.5 py-3.5 font-semibold text-ink/80">
                        <TruncatedText text={formatDate(item.updatedAt)} lines={1} />
                      </td>
                      <td className="whitespace-nowrap px-5.5 py-3.5 font-bold">
                        <EditInventoryItemModal item={item} path={PATH} />
                        {isAdmin && (
                          <ConfirmDeleteButton
                            action={deleteInventoryItemAction.bind(null, item.id, PATH)}
                            itemLabel={item.item}
                            triggerClassName="text-coral hover:underline"
                          />
                        )}
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
                itemLabel="items"
                buildHref={(p) => `${PATH}?${new URLSearchParams({ ...Object.fromEntries(filterQuery), page: String(p) }).toString()}`}
              />
            </div>
          )}
        </ResultsContainer>
      </FilterPendingProvider>
    </div>
  );
}
