import Link from 'next/link';
import { ConfirmDeleteButton } from '@/components/ConfirmDeleteButton';
import { apiFetch } from '@/lib/api/server-fetch';
import type { Client } from '@/lib/api/types';
import { deleteClientAction } from './actions';

function StatCard({ label, value, icon, tone = 'primary' }: { label: string; value: number; icon: React.ReactNode; tone?: 'primary' | 'accent' }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone === 'accent' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-primary">{value}</p>
        <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      </div>
    </div>
  );
}

const ICONS = {
  clients: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
  active: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  ),
  inactive: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  ),
  sites: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  ),
};

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const clients = await apiFetch<Client[]>('/clients');

  const activeCount = clients.filter((c) => c.status === 'ACTIVE').length;
  const inactiveCount = clients.length - activeCount;
  const totalSites = clients.reduce((sum, c) => sum + c._count.sites, 0);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
        <div className="flex gap-3">
          <Link
            prefetch={false}
            href="/clients/import"
            className="inline-block rounded-md border border-primary px-4 py-2 text-center text-sm font-medium text-primary hover:bg-primary/5"
          >
            Bulk Import
          </Link>
          <Link
            prefetch={false}
            href="/clients/new"
            className="inline-block rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Add client
          </Link>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Clients" value={clients.length} icon={ICONS.clients} />
        <StatCard label="Active" value={activeCount} icon={ICONS.active} tone="accent" />
        <StatCard label="Inactive" value={inactiveCount} icon={ICONS.inactive} />
        <StatCard label="Total Sites" value={totalSites} icon={ICONS.sites} />
      </div>

      {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
          <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
          <p className="text-sm text-gray-500">No clients yet.</p>
          <Link
            prefetch={false}
            href="/clients/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Add your first client
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-center">Name</th>
                <th className="whitespace-nowrap px-4 py-3 text-center">Client code</th>
                <th className="whitespace-nowrap px-4 py-3 text-center">Sites</th>
                <th className="whitespace-nowrap px-4 py-3 text-center">Status</th>
                <th className="whitespace-nowrap px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-center">
                    <Link prefetch={false} href={`/clients/${client.id}`} className="font-medium text-gray-900 hover:underline">
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">{client.clientCode}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{client._count.sites}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        client.status === 'ACTIVE' ? 'bg-accent/10 text-accent' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link prefetch={false} href={`/clients/${client.id}`} className="mr-3 text-gray-600 hover:underline">
                      View
                    </Link>
                    <Link prefetch={false} href={`/clients/${client.id}/edit`} className="mr-3 text-gray-600 hover:underline">
                      Edit
                    </Link>
                    <ConfirmDeleteButton
                      action={deleteClientAction.bind(null, client.id)}
                      itemLabel={client.name}
                      warning={
                        client._count.sites > 0
                          ? `This client has ${client._count.sites} site(s) — deletion will fail if any of them have feedback history. Deactivate instead if you're not sure.`
                          : undefined
                      }
                    />
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
