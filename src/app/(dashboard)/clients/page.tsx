import Link from 'next/link';
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
        <Link
          prefetch={false}
          href="/clients/new"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Add client
        </Link>
      </div>

      {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Client code</th>
              <th className="px-4 py-3">Sites</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
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
                <td className="px-4 py-3">
                  <Link prefetch={false} href={`/clients/${client.id}`} className="font-medium text-gray-900 hover:underline">
                    {client.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-500">{client.clientCode}</td>
                <td className="px-4 py-3 text-gray-500">{client._count.sites}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      client.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {client.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link prefetch={false} href={`/clients/${client.id}/edit`} className="mr-3 text-gray-600 hover:underline">
                    Edit
                  </Link>
                  <form action={deleteClientAction.bind(null, client.id)} className="inline">
                    <button type="submit" className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
