'use client';

import { useState } from 'react';
import { Modal } from '@/components/Modal';
import type { InventoryItem } from '@/lib/api/types';
import { updateInventoryItemModalAction } from './actions';
import { InventoryItemForm } from './InventoryItemForm';

export function EditInventoryItemModal({ item, path }: { item: InventoryItem; path: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="mr-3.5 font-bold text-ink-muted hover:text-ink">
        Edit
      </button>

      {open && (
        <Modal title="Edit inventory item" onClose={() => setOpen(false)}>
          <InventoryItemForm
            item={item}
            action={updateInventoryItemModalAction.bind(null, item.id, path)}
            onCancel={() => setOpen(false)}
            onSuccess={() => setOpen(false)}
          />
        </Modal>
      )}
    </>
  );
}
