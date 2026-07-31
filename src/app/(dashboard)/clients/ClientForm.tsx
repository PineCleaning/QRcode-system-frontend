'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Select } from '@/components/Select';
import type { Client } from '@/lib/api/types';

type FormAction = (prevState: string | null, formData: FormData) => Promise<string | null>;

/**
 * Matches the backend's CLIENT_CODE_PATTERN (create-client.dto.ts):
 * lowercase alphanumeric, single hyphens between segments, max 50 chars.
 * This is purely a UX convenience for the live preview - the backend
 * re-validates format/length/uniqueness regardless (and rejects a real
 * duplicate with a 409 the form already surfaces), so nothing here
 * needs to be authoritative. The 4-digit suffix makes an accidental
 * collision between two similarly-named clients (e.g. two "School"s)
 * astronomically unlikely without needing a new backend endpoint just
 * to pre-check availability.
 */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 46); // leaves room for "-" + 4 digits within the 50-char limit
}

function randomSuffix(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function buildClientCode(name: string): string {
  const base = slugify(name);
  return base ? `${base}-${randomSuffix()}` : '';
}

export function ClientForm({
  client,
  action,
  onCancel,
  onSuccess,
}: {
  client?: Client;
  action: FormAction;
  /** Closes the modal without submitting. */
  onCancel: () => void;
  /** Called once the action resolves with no error - the modal uses this to close itself. */
  onSuccess?: () => void;
}) {
  const [error, formAction, isPending] = useActionState(action, null);
  const isEdit = Boolean(client);

  const [clientCode, setClientCode] = useState(client?.clientCode ?? '');
  const [nameValue, setNameValue] = useState(client?.name ?? '');
  // Once the admin types directly into Client code, stop overwriting it
  // from Name changes - same "auto-slug until manually touched" pattern
  // used by most CMS permalink fields.
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(isEdit);
  const [status, setStatus] = useState<string>(client?.status ?? 'ACTIVE');

  // useActionState has no discrete "just succeeded" event - only a value
  // that stays null both before the first submit and after a successful
  // one. Track whether a submission is actually in flight so onSuccess
  // fires once, only after a real submit resolves without an error.
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
        <label htmlFor="clientCode" className="mb-1 block text-sm font-bold text-ink">
          Client code
        </label>
        <div className="flex gap-2">
          <input
            id="clientCode"
            name="clientCode"
            value={clientCode}
            onChange={(e) => {
              setClientCode(e.target.value);
              setCodeManuallyEdited(true);
            }}
            required
            disabled={isEdit}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="Lowercase alphanumeric with optional hyphens (e.g. acme001)"
            className="w-full rounded-xl border border-line bg-page px-3 py-2 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green disabled:bg-line/40 disabled:text-ink-muted"
          />
          {!isEdit && (
            <button
              type="button"
              onClick={() => setClientCode(buildClientCode(nameValue))}
              disabled={!nameValue.trim()}
              title="Regenerate"
              className="flex shrink-0 items-center gap-1 rounded-xl border border-line px-3 py-2 text-sm text-ink-muted hover:bg-line/40 disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
              Regenerate
            </button>
          )}
        </div>
        <p className="mt-1 text-xs text-ink-muted">Lowercase letters, numbers, and hyphens only — no spaces, capitals, or punctuation.</p>
        {isEdit ? (
          <p className="mt-1 text-xs text-ink-muted">Client code can&apos;t be changed once created.</p>
        ) : (
          <p className="mt-1 text-xs text-ink-muted">
            Auto-generated from the client name below — you can still edit it, or regenerate a new random suffix.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-bold text-ink">
          Name
        </label>
        <input
          id="name"
          name="name"
          value={nameValue}
          onChange={(e) => {
            setNameValue(e.target.value);
            if (!isEdit && !codeManuallyEdited) {
              setClientCode(buildClientCode(e.target.value));
            }
          }}
          required
          className="w-full rounded-xl border border-line bg-page px-3 py-2 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
        />
      </div>

      <div>
        <label htmlFor="contactEmail" className="mb-1 block text-sm font-bold text-ink">
          Contact email
        </label>
        <input
          id="contactEmail"
          name="contactEmail"
          type="email"
          defaultValue={client?.contactEmail ?? ''}
          className="w-full rounded-xl border border-line bg-page px-3 py-2 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
        />
      </div>

      <div>
        <label htmlFor="contactPhone" className="mb-1 block text-sm font-bold text-ink">
          Contact phone
        </label>
        <input
          id="contactPhone"
          name="contactPhone"
          type="tel"
          defaultValue={client?.contactPhone ?? ''}
          pattern="[0-9+-]+"
          title="Only digits, + and - are allowed (e.g. +61-2-1111-1111)"
          className="w-full rounded-xl border border-line bg-page px-3 py-2 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
        />
      </div>

      {isEdit && (
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-bold text-ink">
            Status
          </label>
          <input type="hidden" name="status" value={status} />
          <Select
            id="status"
            value={status}
            onChange={setStatus}
            placeholder="Active"
            options={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
            ]}
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-page hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create client'}
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
