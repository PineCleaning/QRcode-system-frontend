'use client';

import { useActionState } from 'react';
import { reconnectClickupAction } from './actions';

export function ClickupTokenForm() {
  const [error, formAction, isPending] = useActionState(reconnectClickupAction, null);

  return (
    <form action={formAction} className="mt-5 max-w-md space-y-3">
      <div>
        <label htmlFor="token" className="mb-1 block text-sm font-bold text-ink">
          ClickUp API token
        </label>
        <input
          id="token"
          name="token"
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="pk_..."
          required
          className="w-full rounded-xl border border-line bg-page px-3 py-2 font-mono text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-page hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? 'Reconnecting…' : 'Reconnect'}
      </button>
    </form>
  );
}
