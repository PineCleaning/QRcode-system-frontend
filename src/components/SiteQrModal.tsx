'use client';

import { useState } from 'react';

export function SiteQrModal({
  siteId,
  siteName,
  slug,
  status,
}: {
  siteId: string;
  siteName: string;
  slug: string;
  status: 'ACTIVE' | 'INACTIVE';
}) {
  const [open, setOpen] = useState(false);
  const qrSrc = `/api/qr/${siteId}`;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="text-ink-muted hover:text-ink">
        View
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xs rounded-[26px] bg-surface p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-extrabold">{siteName}</h2>
                <p className="text-xs text-ink-muted">{slug}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-md p-1 text-ink-muted hover:bg-line/40 hover:text-ink"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <span
              className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold before:h-1.5 before:w-1.5 before:rounded-full before:bg-current ${
                status === 'ACTIVE' ? 'bg-green/15 text-green' : 'bg-ink-muted/15 text-ink-muted'
              }`}
            >
              {status}
            </span>

            <img src={qrSrc} alt={`QR code for ${siteName}`} width={200} height={200} className="mx-auto mt-4" />

            <div className="mt-4 flex justify-center gap-3 text-sm">
              <a href={qrSrc} download className="text-sky hover:underline">
                PNG
              </a>
              <a href={`${qrSrc}?format=pdf&size=A4`} download className="text-sky hover:underline">
                PDF A4
              </a>
              <a href={`${qrSrc}?format=pdf&size=A5`} download className="text-sky hover:underline">
                PDF A5
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
