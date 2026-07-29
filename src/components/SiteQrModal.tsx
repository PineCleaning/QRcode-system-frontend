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
      <button type="button" onClick={() => setOpen(true)} className="text-gray-600 hover:underline">
        View
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xs rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">{siteName}</h2>
                <p className="text-xs text-gray-500">{slug}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <span
              className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                status === 'ACTIVE' ? 'bg-accent/10 text-accent' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {status}
            </span>

            <img src={qrSrc} alt={`QR code for ${siteName}`} width={200} height={200} className="mx-auto mt-4" />

            <div className="mt-4 flex justify-center gap-3 text-sm">
              <a href={qrSrc} download className="text-blue-600 hover:underline">
                PNG
              </a>
              <a href={`${qrSrc}?format=pdf&size=A4`} download className="text-blue-600 hover:underline">
                PDF A4
              </a>
              <a href={`${qrSrc}?format=pdf&size=A5`} download className="text-blue-600 hover:underline">
                PDF A5
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
