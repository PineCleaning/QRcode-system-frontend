'use client';

import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { createClientModalAction } from './actions';
import { ClientForm } from './ClientForm';

/** "+ Add client" opens this - a 5-field form doesn't need a full page + loading skeleton round trip. */
export function AddClientModal({
  triggerLabel = '+ Add client',
  triggerClassName = 'inline-flex items-center rounded-xl bg-primary px-4.5 py-2.5 text-[13.5px] font-bold text-page transition hover:-translate-y-px',
}: {
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>

      {open && (
        <Modal title="Add client" onClose={() => setOpen(false)}>
          <ClientForm action={createClientModalAction} onCancel={() => setOpen(false)} onSuccess={() => setOpen(false)} />
        </Modal>
      )}
    </>
  );
}
