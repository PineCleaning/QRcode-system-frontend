'use client';

import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { createInspectionItemModalAction } from './actions';
import { InspectionItemForm } from './InspectionItemForm';

export function AddInspectionItemModal({ inspectionId, path }: { inspectionId: string; path: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-xl bg-primary px-4.5 py-2.5 text-[13.5px] font-bold text-page transition hover:-translate-y-px"
      >
        + Add item
      </button>

      {open && (
        <Modal title="Add inspection item" onClose={() => setOpen(false)}>
          <InspectionItemForm
            folder={`inspections/${inspectionId}`}
            action={createInspectionItemModalAction.bind(null, inspectionId, path)}
            onCancel={() => setOpen(false)}
            onSuccess={() => setOpen(false)}
          />
        </Modal>
      )}
    </>
  );
}
