'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Select } from '@/components/Select';
import type { InventoryItem } from '@/lib/api/types';
import { CATEGORY_OPTIONS, STATUS_OPTIONS } from './inventory-labels';

type FormAction = (prevState: string | null, formData: FormData) => Promise<string | null>;

export function InventoryItemForm({
  item,
  action,
  onCancel,
  onSuccess,
}: {
  item?: InventoryItem;
  action: FormAction;
  /** Closes the modal without submitting. */
  onCancel: () => void;
  /** Called once the action resolves with no error - the modal uses this to close itself. */
  onSuccess?: () => void;
}) {
  const [error, formAction, isPending] = useActionState(action, null);
  const isEdit = Boolean(item);
  const [category, setCategory] = useState<string>(item?.category ?? '');
  const [status, setStatus] = useState<string>(item?.status ?? '');

  const submittedRef = useRef(false);
  useEffect(() => {
    if (isPending) {
      submittedRef.current = true;
    } else if (submittedRef.current && !error) {
      submittedRef.current = false;
      onSuccess?.();
    }
  }, [isPending, error, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="item" className="mb-1 block text-sm font-bold text-ink">
          Item <span className="text-coral">*</span>
        </label>
        <input
          id="item"
          name="item"
          defaultValue={item?.item}
          required
          placeholder="e.g. Toilet Paper"
          className="w-full rounded-xl border border-line bg-page px-3 py-2 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
        />
      </div>

      <div>
        <label htmlFor="category" className="mb-1 block text-sm font-bold text-ink">
          Types <span className="text-coral">*</span>
        </label>
        <input type="hidden" name="category" value={category} />
        <Select id="category" value={category} onChange={setCategory} placeholder="Select a type" options={CATEGORY_OPTIONS} />
      </div>

      <div>
        <label htmlFor="status" className="mb-1 block text-sm font-bold text-ink">
          Status <span className="text-coral">*</span>
        </label>
        <input type="hidden" name="status" value={status} />
        <Select id="status" value={status} onChange={setStatus} placeholder="Select a status" options={STATUS_OPTIONS} />
      </div>

      <div>
        <label htmlFor="quantity" className="mb-1 block text-sm font-bold text-ink">
          Quantity <span className="text-coral">*</span>
        </label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min={0}
          step={1}
          defaultValue={item?.quantity}
          required
          className="w-full rounded-xl border border-line bg-page px-3 py-2 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
        />
      </div>

      <div>
        <label htmlFor="lastSupplyDate" className="mb-1 block text-sm font-bold text-ink">
          Last Supply Date
        </label>
        <input
          id="lastSupplyDate"
          name="lastSupplyDate"
          type="date"
          defaultValue={item?.lastSupplyDate ? item.lastSupplyDate.slice(0, 10) : ''}
          className="w-full rounded-xl border border-line bg-page px-3 py-2 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
        />
      </div>

      <div>
        <label htmlFor="notes" className="mb-1 block text-sm font-bold text-ink">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={item?.notes ?? ''}
          rows={3}
          className="w-full rounded-xl border border-line bg-page px-3 py-2 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-page hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Add item'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-line px-4 py-2 text-sm font-bold text-ink hover:bg-line/40"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
