'use client';

import { useState } from 'react';
import { createInventoryItemModalAction } from '@/app/(dashboard)/clients/[id]/sites/[siteId]/inventory/actions';
import { InventoryItemForm } from '@/app/(dashboard)/clients/[id]/sites/[siteId]/inventory/InventoryItemForm';
import { Modal } from '@/components/Modal';
import { Select } from '@/components/Select';
import type { Client, Site } from '@/lib/api/types';

/**
 * The per-site "Add item" modal always knows its siteId from the route -
 * this one doesn't, since it lives on the cross-site /inventory tab, so
 * it adds a Client -> Site picker step in front of the same shared
 * InventoryItemForm. Sites are fetched client-side once a client is
 * picked (same two-step pattern as FeedbackFilters), not pre-loaded for
 * every client up front.
 */
export function AddGlobalInventoryItemModal({
  clients,
  path,
  triggerLabel = '+ Add item',
  triggerClassName = 'inline-flex items-center rounded-xl bg-primary px-4.5 py-2.5 text-[13.5px] font-bold text-page transition hover:-translate-y-px',
}: {
  clients: Client[];
  path: string;
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const [siteId, setSiteId] = useState('');
  const [sites, setSites] = useState<Site[]>([]);
  const [sitesLoading, setSitesLoading] = useState(false);

  async function handleClientChange(value: string) {
    setClientId(value);
    setSiteId('');
    setSites([]);
    if (!value) return;
    setSitesLoading(true);
    try {
      const res = await fetch(`/api/sites-for-client/${value}`);
      const data = await res.json();
      setSites(Array.isArray(data) ? data : (data.data ?? []));
    } finally {
      setSitesLoading(false);
    }
  }

  function close() {
    setOpen(false);
    setClientId('');
    setSiteId('');
    setSites([]);
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>

      {open && (
        <Modal title="Add inventory item" onClose={close}>
          <div className="space-y-4">
            <div>
              <label htmlFor="addInvClient" className="mb-1 block text-sm font-bold text-ink">
                Client <span className="text-coral">*</span>
              </label>
              <Select
                id="addInvClient"
                value={clientId}
                onChange={handleClientChange}
                placeholder="Select a client"
                options={clients.map((c) => ({ value: c.id, label: c.clientName }))}
              />
            </div>

            <div>
              <label htmlFor="addInvSite" className="mb-1 block text-sm font-bold text-ink">
                Site <span className="text-coral">*</span>
              </label>
              <Select
                id="addInvSite"
                value={siteId}
                onChange={setSiteId}
                disabled={!clientId || sitesLoading}
                placeholder={!clientId ? 'Select a client first' : sitesLoading ? 'Loading sites…' : 'Select a site'}
                options={sites.map((s) => ({ value: s.id, label: s.businessName }))}
              />
            </div>

            {siteId && (
              <InventoryItemForm
                action={createInventoryItemModalAction.bind(null, siteId, path)}
                onCancel={close}
                onSuccess={close}
              />
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
