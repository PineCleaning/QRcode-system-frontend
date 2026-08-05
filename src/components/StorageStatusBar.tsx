'use client';

import { useEffect, useRef, useState } from 'react';
import type { CloudinaryUsage } from '@/lib/api/types';

const BYTES_PER_GB = 1024 ** 3;
const BYTES_PER_MB = 1024 ** 2;

/** Green under 50%, amber 50-79%, coral 80%+ - same semantic tokens already used for status pills elsewhere in the app. */
function barColorClass(percent: number): string {
  if (percent >= 80) return 'bg-coral';
  if (percent >= 50) return 'bg-amber';
  return 'bg-green';
}

function formatGb(bytes: number): string {
  const gb = bytes / BYTES_PER_GB;
  return gb >= 10 ? gb.toFixed(0) : gb.toFixed(1);
}

function formatMb(bytes: number): string {
  return `${(bytes / BYTES_PER_MB).toFixed(1)} MB`;
}

export function StorageStatusBar({ usage }: { usage: CloudinaryUsage }) {
  const percent = Math.min(100, Math.round((usage.storageUsedBytes / usage.storageLimitBytes) * 100));
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative w-full sm:w-72">
      <div className="rounded-[20px] border border-line bg-surface px-4 py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Storage</span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="text-[11px] font-bold text-ink-muted hover:text-ink"
          >
            See Details ›
          </button>
        </div>
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-line">
          <div
            className={`h-full rounded-full transition-[width] ${barColorClass(percent)}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-1.5 text-[12px] text-ink-muted">
          {formatGb(usage.storageUsedBytes)} of {formatGb(usage.storageLimitBytes)} GB used
        </p>
      </div>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-full min-w-[260px] rounded-[18px] border border-line bg-surface p-4 shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
            {usage.plan} plan &mdash; where you stand
          </p>
          <dl className="space-y-2 text-[13px]">
            <div className="flex items-center justify-between">
              <dt className="text-ink-muted">Storage</dt>
              <dd className="font-bold text-ink">
                {usage.breakdown.storageCredits.toFixed(2)} credits ({formatMb(usage.storageUsedBytes)})
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ink-muted">Bandwidth</dt>
              <dd className="font-bold text-ink">
                {usage.breakdown.bandwidthCredits.toFixed(2)} credits ({formatMb(usage.breakdown.bandwidthBytes)})
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ink-muted">Transformations</dt>
              <dd className="font-bold text-ink">
                {usage.breakdown.transformationsCredits.toFixed(2)} credits ({usage.breakdown.transformationsCount})
              </dd>
            </div>
          </dl>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[13px]">
            <span className="font-bold text-ink">Total</span>
            <span className="font-bold text-ink">
              {usage.totalCreditsUsed.toFixed(2)} / {usage.totalCreditsLimit} credits ({usage.creditsUsedPercent.toFixed(2)}%)
            </span>
          </div>
          <a
            href="https://console.cloudinary.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block text-center text-[12px] font-bold text-sky hover:underline"
          >
            Open Cloudinary console ›
          </a>
        </div>
      )}
    </div>
  );
}
