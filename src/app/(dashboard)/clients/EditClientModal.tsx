'use client';

import { useState } from 'react';
import { Modal } from '@/components/Modal';
import type { Client } from '@/lib/api/types';
import { updateClientModalAction } from './actions';
import { ClientForm } from './ClientForm';

/** "Edit" opens this instead of navigating to /clients/[id]/edit - same reasoning as AddClientModal. */
export function EditClientModal({
  client,
  triggerClassName = 'mr-3.5 text-ink-muted hover:text-ink',
}: {
  client: Client;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        Edit
      </button>

      {open && (
        <Modal title="Edit client" onClose={() => setOpen(false)}>
          <ClientForm
            client={client}
            action={updateClientModalAction.bind(null, client.id)}
            onCancel={() => setOpen(false)}
            onSuccess={() => setOpen(false)}
            bare
          />
        </Modal>
      )}
    </>
  );
}
