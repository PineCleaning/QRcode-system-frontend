'use client';

import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { createInventoryItemModalAction } from './actions';
import { InventoryItemForm } from './InventoryItemForm';

export function AddInventoryItemModal({
  siteId,
  path,
  triggerLabel = '+ Add item',
  triggerClassName = 'inline-flex items-center rounded-xl bg-primary px-4.5 py-2.5 text-[13.5px] font-bold text-page transition hover:-translate-y-px',
}: {
  siteId: string;
  path: string;
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
        <Modal title="Add inventory item" onClose={() => setOpen(false)}>
          <InventoryItemForm
            action={createInventoryItemModalAction.bind(null, siteId, path)}
            onCancel={() => setOpen(false)}
            onSuccess={() => setOpen(false)}
          />
        </Modal>
      )}
    </>
  );
}
