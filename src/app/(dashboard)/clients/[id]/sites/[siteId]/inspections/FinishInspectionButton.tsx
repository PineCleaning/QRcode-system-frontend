'use client';

import { useRouter } from 'next/navigation';
import { startTransition, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import type { InspectionItem } from '@/lib/api/types';
import { finishInspectionAction } from './actions';

export function FinishInspectionButton({ inspectionId, items }: { inspectionId: string; items: InspectionItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, startSubmit] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ averageScore: number; meetsStandard: boolean } | null>(null);

  const ratedItems = items.filter((item) => !item.isNotApplicable && item.percentage !== null);
  const naCount = items.length - ratedItems.length;
  const previewAverage =
    ratedItems.length > 0 ? Math.round(ratedItems.reduce((sum, item) => sum + (item.percentage ?? 0), 0) / ratedItems.length) : null;

  function handleConfirm() {
    startSubmit(async () => {
      const res = await finishInspectionAction(inspectionId);
      if (res.error) {
        setError(res.error);
        return;
      }
      setError(null);
      // averageScore/meetsStandard are always both present together on
      // success - the non-null assertion just reflects that, TypeScript
      // can't see it from the optional-fields shape alone.
      setResult({ averageScore: res.averageScore!, meetsStandard: res.meetsStandard! });
    });
  }

  function handleDone() {
    setOpen(false);
    setResult(null);
    // Only refresh the underlying page now, after the result has
    // actually been shown - see the long comment on finishInspectionAction
    // for why this can't happen any earlier. startTransition keeps it
    // non-blocking so closing the modal itself is instant.
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="inline-flex items-center rounded-xl border border-line px-4.5 py-2.5 text-[13.5px] font-bold text-ink transition hover:-translate-y-px"
      >
        Finish Inspection
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-sm rounded-[26px] bg-surface p-6 shadow-lg">
              {result ? (
                <>
                  <h2 className="text-base font-extrabold">Inspection completed</h2>
                  <p className="mt-2 text-sm text-ink-muted">
                    Average score: <span className="font-bold text-ink">{result.averageScore}%</span>
                  </p>
                  <p className={`mt-1 text-sm font-bold ${result.meetsStandard ? 'text-green' : 'text-coral'}`}>
                    {result.meetsStandard ? 'Meets the 80% standard' : 'Does not meet the 80% standard'}
                  </p>
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={handleDone}
                      className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-page hover:opacity-90"
                    >
                      Done
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-base font-extrabold">Finish this inspection?</h2>
                  <p className="mt-2 text-sm text-ink-muted">
                    {ratedItems.length} rated space{ratedItems.length === 1 ? '' : 's'}
                    {naCount > 0 ? `, ${naCount} marked Not Applicable` : ''}.
                    {previewAverage !== null && ` Estimated average: ${previewAverage}%.`} This locks the session - no more
                    spaces can be added or edited afterward.
                  </p>
                  {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      disabled={isSubmitting}
                      className="rounded-xl border border-line px-4 py-2 text-sm font-bold text-ink hover:bg-line/40 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={isSubmitting}
                      className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-page hover:opacity-90 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Finishing…' : 'Finish Inspection'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
