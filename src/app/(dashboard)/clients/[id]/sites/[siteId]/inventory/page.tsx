import Link from 'next/link';
import { ConfirmDeleteButton } from '@/components/ConfirmDeleteButton';
import { TruncatedText } from '@/components/TruncatedText';
import { apiFetch } from '@/lib/api/server-fetch';
import { getCurrentAdmin } from '@/lib/api/current-admin';
import type { Client, InventoryItem, Site } from '@/lib/api/types';
import { formatDate, formatDateOnly } from '@/lib/format-date';
import { AddInventoryItemModal } from './AddInventoryItemModal';
import { deleteInventoryItemAction } from './actions';
import { EditInventoryItemModal } from './EditInventoryItemModal';
import { CATEGORY_LABELS, STATUS_BADGE_STYLES, STATUS_LABELS } from './inventory-labels';

export default async function SiteInventoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; siteId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id, siteId } = await params;
  const { error } = await searchParams;
  const path = `/clients/${id}/sites/${siteId}/inventory`;

  const [client, site, items, currentAdmin] = await Promise.all([
    apiFetch<Client>(`/clients/${id}`),
    apiFetch<Site>(`/sites/${siteId}`),
    apiFetch<InventoryItem[]>(`/sites/${siteId}/inventory`),
    getCurrentAdmin(),
  ]);
  // Deleting an inventory item is Admin-only (backend RolesGuard) - mirrored here so Supervisors never see a button that would 403.
  const isAdmin = currentAdmin?.role === 'ADMIN';

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
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-extrabold tracking-tight">Inventory / Assets</h1>
                <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold text-page">{items.length}</span>
              </div>
              <p className="mt-1 text-[13.5px] text-ink-muted">{site.businessName}</p>
            </div>
            <AddInventoryItemModal siteId={siteId} path={path} />
          </div>
        </div>
      </div>

      {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[26px] border border-line bg-surface p-12 text-center shadow-sm">
          <svg className="h-10 w-10 text-ink-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375C2.754 3.75 2.25 4.254 2.25 4.875v1.5c0 .621.504 1.125 1.125 1.125Z"
            />
          </svg>
          <p className="text-sm text-ink-muted">No inventory items yet.</p>
          <AddInventoryItemModal
            siteId={siteId}
            path={path}
            triggerLabel="Add your first item"
            triggerClassName="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-page transition hover:-translate-y-px"
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-[26px] border border-line bg-surface shadow-sm">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-[13.5px]">
            <thead className="border-b border-line text-[10.5px] font-extrabold uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="whitespace-nowrap px-5.5 py-4">Item</th>
                <th className="whitespace-nowrap px-5.5 py-4">Types</th>
                <th className="whitespace-nowrap px-5.5 py-4">Status</th>
                <th className="whitespace-nowrap px-5.5 py-4">Quantity</th>
                <th className="whitespace-nowrap px-5.5 py-4">Last Supply Date</th>
                <th className="px-5.5 py-4">Notes</th>
                <th className="whitespace-nowrap px-5.5 py-4">Last Edited Date/Time</th>
                <th className="whitespace-nowrap px-5.5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-line align-top last:border-0 hover:bg-ink/[0.03]">
                  <td className="max-w-[200px] px-5.5 py-3.5 font-bold">{item.item}</td>
                  <td className="max-w-[220px] px-5.5 py-3.5 font-semibold text-ink/80">
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
                    {item.lastSupplyDate ? formatDateOnly(item.lastSupplyDate) : <span className="text-ink-muted/40">—</span>}
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
                    <EditInventoryItemModal item={item} path={path} />
                    {isAdmin && (
                      <ConfirmDeleteButton
                        action={deleteInventoryItemAction.bind(null, item.id, path)}
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
        </div>
      )}
    </div>
  );
}
