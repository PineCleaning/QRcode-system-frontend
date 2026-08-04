import Link from 'next/link';
import { ClickableRow } from '@/components/ClickableRow';
import { ConfirmDeactivateButton } from '@/components/ConfirmDeactivateButton';
import { Pagination } from '@/components/Pagination';
import { apiFetch } from '@/lib/api/server-fetch';
import type { PaginatedClients } from '@/lib/api/types';
import { AddClientModal } from './AddClientModal';
import { EditClientModal } from './EditClientModal';
import { setClientStatusAction } from './actions';

const PAGE_SIZE = 50;

function MiniStat({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: 'green' | 'coral' | 'sky' }) {
  const toneClass = {
    green: 'bg-green/15 text-green',
    coral: 'bg-coral/15 text-coral',
    sky: 'bg-sky/15 text-sky',
  }[tone];

  return (
    <div className="col-span-2 flex items-center gap-3.5 rounded-[26px] border border-line bg-surface p-4.5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:col-span-1 lg:col-span-2">
      <div className={`flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-[11px] ${toneClass}`}>{icon}</div>
      <div>
        <div className="text-[22px] font-extrabold">{value}</div>
        <div className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{label}</div>
      </div>
    </div>
  );
}

const ICONS = {
  active: (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  ),
  inactive: (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  ),
  sites: (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.14-7.5 11.25-7.5 11.25S4.5 17.64 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  ),
  multiSite: (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  ),
};

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; page?: string }>;
}) {
  const { error, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const { data: clients, total, activeCount, inactiveCount, totalSites, multiSiteCount } = await apiFetch<PaginatedClients>(
    `/clients?page=${page}&pageSize=${PAGE_SIZE}`,
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-balance">Clients</h1>
          <p className="mt-1 text-[13.5px] text-ink-muted">Every client and site on the QR feedback network.</p>
        </div>
        <div className="flex gap-2.5">
          <Link
            prefetch={false}
            href="/clients/import"
            className="inline-flex items-center rounded-xl border border-line bg-surface px-4.5 py-2.5 text-[13.5px] font-bold text-ink transition hover:-translate-y-px"
          >
            Bulk Import
          </Link>
          <AddClientModal />
        </div>
      </div>

      {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[26px] border border-line bg-surface p-12 text-center shadow-sm">
          <svg className="h-10 w-10 text-ink-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
          <p className="text-sm text-ink-muted">No clients yet.</p>
          <AddClientModal
            triggerLabel="Add your first client"
            triggerClassName="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-page transition hover:-translate-y-px"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          <div className="col-span-2 row-span-2 flex flex-col justify-between rounded-[26px] p-6.5 text-white" style={{ background: 'linear-gradient(280deg, var(--hero-grad-1) 0%, var(--hero-grad-2) 100%)', color: 'var(--hero-text)' }}>
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--hero-tag)', opacity: 0.85 }}>
              Total Clients
            </span>
            <span className="text-[52px] font-extrabold tracking-tight">{total}</span>
            <span className="text-[12.5px]" style={{ color: 'var(--hero-tag)', opacity: 0.85 }}>
              Across {totalSites} site{totalSites === 1 ? '' : 's'} on the network
            </span>
          </div>

          <MiniStat label="Active" value={activeCount} icon={ICONS.active} tone="green" />
          <MiniStat label="Inactive" value={inactiveCount} icon={ICONS.inactive} tone="coral" />
          <MiniStat label="Total Sites" value={totalSites} icon={ICONS.sites} tone="sky" />
          <MiniStat label="Multi-Site Clients" value={multiSiteCount} icon={ICONS.multiSite} tone="green" />

          <div className="col-span-2 mt-2 overflow-hidden rounded-[26px] border border-line bg-surface sm:col-span-4 lg:col-span-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-[13.5px]">
                <thead className="border-b border-line text-[10.5px] font-extrabold uppercase tracking-wide text-ink-muted">
                  <tr>
                    <th className="whitespace-nowrap px-5.5 py-4">Name</th>
                    <th className="whitespace-nowrap px-5.5 py-4">Client ID</th>
                    <th className="whitespace-nowrap px-5.5 py-4">Sites</th>
                    <th className="whitespace-nowrap px-5.5 py-4">Status</th>
                    <th className="whitespace-nowrap px-5.5 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <ClickableRow
                      key={client.id}
                      href={`/clients/${client.id}`}
                      className="border-b border-line last:border-0 hover:bg-ink/[0.03]"
                    >
                      <td className="max-w-[220px] px-5.5 py-3.5 font-bold">{client.name}</td>
                      <td className="px-5.5 py-3.5 font-mono text-[12.5px] text-ink-muted">{client.clientId}</td>
                      <td className="px-5.5 py-3.5 text-ink-muted">{client._count.sites}</td>
                      <td className="px-5.5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold before:h-1.5 before:w-1.5 before:rounded-full before:bg-current ${
                            client.status === 'ACTIVE' ? 'bg-green/15 text-green' : 'bg-ink-muted/15 text-ink-muted'
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>
                      <td className="px-5.5 py-3.5 font-bold">
                        <EditClientModal client={client} />
                        <ConfirmDeactivateButton
                          currentStatus={client.status}
                          action={setClientStatusAction.bind(null, client.id)}
                          itemLabel={client.name}
                          deactivateDescription={
                            client._count.sites > 0
                              ? `This will also stop every one of its ${client._count.sites} site(s) from accepting new feedback submissions. Nothing is deleted, and you can reactivate anytime using the Activate button.`
                              : 'Its QR codes will stop accepting new feedback submissions. Nothing is deleted, and you can reactivate anytime using the Activate button.'
                          }
                          activateDescription={
                            client._count.sites > 0
                              ? "Its QR codes will start accepting new feedback submissions again, but only for sites that are also Active; reactivate any inactive sites individually from the site page."
                              : 'Its QR codes will start accepting new feedback submissions again.'
                          }
                        />
                      </td>
                    </ClickableRow>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={PAGE_SIZE}
              itemLabel="clients"
              buildHref={(p) => `/clients?page=${p}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
