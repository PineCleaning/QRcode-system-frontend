import { apiFetch } from '@/lib/api/server-fetch';
import type { Client } from '@/lib/api/types';
import { updateClientAction } from '../../actions';
import { ClientForm } from '../../ClientForm';

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await apiFetch<Client>(`/clients/${id}`);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Edit client</h1>
      <ClientForm client={client} action={updateClientAction.bind(null, id)} />
    </div>
  );
}
