import Link from 'next/link';
import { createClientAction } from '../actions';
import { ClientForm } from '../ClientForm';

export default function NewClientPage() {
  return (
    <div>
      <Link prefetch={false} href="/clients" className="mb-2 inline-block text-sm text-ink-muted hover:text-ink">
        ← Clients
      </Link>
      <h1 className="mb-6 text-xl font-extrabold">Add client</h1>
      <ClientForm action={createClientAction} cancelHref="/clients" />
    </div>
  );
}
