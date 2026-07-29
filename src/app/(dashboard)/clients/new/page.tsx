import Link from 'next/link';
import { createClientAction } from '../actions';
import { ClientForm } from '../ClientForm';

export default function NewClientPage() {
  return (
    <div>
      <Link prefetch={false} href="/clients" className="mb-2 inline-block text-sm text-gray-500 hover:text-primary">
        ← Clients
      </Link>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Add client</h1>
      <ClientForm action={createClientAction} cancelHref="/clients" />
    </div>
  );
}
