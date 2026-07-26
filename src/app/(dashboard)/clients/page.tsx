import Link from 'next/link';
import { ConfirmDeleteButton } from '@/components/ConfirmDeleteButton';
import { apiFetch } from '@/lib/api/server-fetch';
import type { Client } from '@/lib/api/types';
import { deleteClientAction } from './actions';

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const clients = await apiFetch<Client[]>('/clients');

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
        <Link
          prefetch={false}
          href="/clients/new"
          className="inline-block rounded-md bg-gray-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-gray-800"
        >
          Add client
        </Link>
      </div>

      {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
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
            {clients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No clients yet.
                </td>
              </tr>
            )}
            {clients.map((client) => (
              <tr key={client.id} className="border-b border-gray-100 last:border-0">
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
                      client.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
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
    </div>
  );
}
