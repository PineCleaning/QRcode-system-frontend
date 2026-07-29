import Link from 'next/link';
import { apiFetch } from '@/lib/api/server-fetch';
import type { Client } from '@/lib/api/types';
import { updateClientAction } from '../../actions';
import { ClientForm } from '../../ClientForm';

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await apiFetch<Client>(`/clients/${id}`);

  return (
    <div>
      <Link prefetch={false} href={`/clients/${id}`} className="mb-2 inline-block text-sm text-gray-500 hover:text-primary">
        ← {client.name}
      </Link>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Edit client</h1>
      <ClientForm client={client} action={updateClientAction.bind(null, id)} cancelHref="/clients" />
    </div>
  );
}
