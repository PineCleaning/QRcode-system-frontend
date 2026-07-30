'use client';

import { useState } from 'react';
import { Modal } from '@/components/Modal';
import type { Site } from '@/lib/api/types';
import { updateSiteModalAction } from './actions';
import { SiteForm } from './SiteForm';

/** "Edit" opens this instead of navigating to a full page. */
export function EditSiteModal({
  site,
  clientId,
  triggerClassName = 'text-ink-muted hover:text-ink',
}: {
  site: Site;
  clientId: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        Edit
      </button>

      {open && (
        <Modal title="Edit site" onClose={() => setOpen(false)}>
          <SiteForm
            site={site}
            action={updateSiteModalAction.bind(null, site.id, clientId)}
            onCancel={() => setOpen(false)}
            onSuccess={() => setOpen(false)}
          />
        </Modal>
      )}
    </>
  );
}
