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
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold">Edit client</h1>
        <Link
          prefetch={false}
          href={`/clients/${id}`}
          className="inline-flex shrink-0 items-center rounded-xl border border-line px-4 py-2 text-center text-[13.5px] font-bold transition hover:-translate-y-px"
        >
          ← {client.name}
        </Link>
      </div>
      <ClientForm client={client} action={updateClientAction.bind(null, id)} cancelHref="/clients" />
    </div>
  );
}
