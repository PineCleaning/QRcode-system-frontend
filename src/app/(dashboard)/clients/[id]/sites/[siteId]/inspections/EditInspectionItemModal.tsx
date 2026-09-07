'use client';

import { useState } from 'react';
import { Modal } from '@/components/Modal';
import type { InspectionItem } from '@/lib/api/types';
import { updateInspectionItemModalAction } from './actions';
import { InspectionItemForm } from './InspectionItemForm';

export function EditInspectionItemModal({ item, path }: { item: InspectionItem; path: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="text-ink-muted hover:text-ink hover:underline">
        Edit
      </button>

      {open && (
        <Modal title={`Edit ${item.spaceName}`} onClose={() => setOpen(false)}>
          <InspectionItemForm
            item={item}
            folder={`inspections/${item.inspectionId}/${item.id}`}
            action={updateInspectionItemModalAction.bind(null, item.id, path)}
            onCancel={() => setOpen(false)}
            onSuccess={() => setOpen(false)}
          />
        </Modal>
      )}
    </>
  );
}
