'use client';

import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { createSiteModalAction } from './actions';
import { SiteForm } from './SiteForm';

/** "+ Add site" opens this instead of navigating to /clients/[id]/sites/new - same reasoning as AddClientModal. */
export function AddSiteModal({
  clientId,
  triggerClassName = 'inline-flex items-center rounded-xl bg-primary px-4 py-2 text-center text-[13.5px] font-bold text-page transition hover:-translate-y-px',
}: {
  clientId: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        + Add site
      </button>

      {open && (
        <Modal title="Add site" onClose={() => setOpen(false)}>
          <SiteForm
            action={createSiteModalAction.bind(null, clientId)}
            onCancel={() => setOpen(false)}
            onSuccess={() => setOpen(false)}
            bare
          />
        </Modal>
      )}
    </>
  );
}
