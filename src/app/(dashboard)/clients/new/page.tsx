import { createClientAction } from '../actions';
import { ClientForm } from '../ClientForm';

export default function NewClientPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Add client</h1>
      <ClientForm action={createClientAction} cancelHref="/clients" />
    </div>
  );
}
