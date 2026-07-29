import Link from 'next/link';
import { createClientAction } from '../actions';
import { ClientForm } from '../ClientForm';

export default function NewClientPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold">Add client</h1>
        <Link
          prefetch={false}
          href="/clients"
          className="inline-flex shrink-0 items-center rounded-xl border border-line px-4 py-2 text-center text-[13.5px] font-bold transition hover:-translate-y-px"
        >
          ← Clients
        </Link>
      </div>
      <ClientForm action={createClientAction} cancelHref="/clients" />
    </div>
  );
}
