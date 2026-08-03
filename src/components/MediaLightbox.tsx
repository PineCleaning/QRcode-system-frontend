'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface LightboxItem {
  url: string;
  label: string;
  resourceType: 'IMAGE' | 'VIDEO';
  caption: string;
}

const LightboxContext = createContext<((index: number) => void) | null>(null);

/** Returns the shared `open(index)` function for whichever MediaLightboxProvider wraps the caller. */
export function useOpenLightbox() {
  const ctx = useContext(LightboxContext);
  if (!ctx) throw new Error('useOpenLightbox must be used inside a MediaLightboxProvider');
  return ctx;
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={direction === 'left' ? 'M15.75 19.5 8.25 12l7.5-7.5' : 'm8.25 4.5 7.5 7.5-7.5 7.5'}
      />
    </svg>
  );
}

/**
 * Wraps an entire media grid (Assets page) so any card's Review button
 * can open a shared full-screen lightbox and navigate Prev/Next across
 * every item, not just the one it was opened from. A single instance
 * lives once per page, not per-card - context is what lets any card's
 * trigger reach it.
 *
 * Follows the standard lightbox accessibility pattern (role="dialog",
 * focus moves into the dialog on open and back to the trigger on
 * close, Escape closes, Left/Right arrow keys navigate) rather than a
 * bespoke one - matches how every other overlay in this app is built
 * (portaled to document.body, not a plain absolutely-positioned child,
 * so it's never clipped by an ancestor's overflow).
 */
export function MediaLightboxProvider({ items, children }: { items: LightboxItem[]; children: React.ReactNode }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerElRef = useRef<HTMLElement | null>(null);

  function open(index: number) {
    triggerElRef.current = document.activeElement as HTMLElement;
    setOpenIndex(index);
  }
  function close() {
    setOpenIndex(null);
    triggerElRef.current?.focus();
  }
  function showPrev() {
    setOpenIndex((i) => (i === null ? null : (i - 1 + items.length) % items.length));
  }
  function showNext() {
    setOpenIndex((i) => (i === null ? null : (i + 1) % items.length));
  }

  useEffect(() => {
    if (openIndex === null) return;
    closeButtonRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft' && items.length > 1) showPrev();
      else if (e.key === 'ArrowRight' && items.length > 1) showNext();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIndex, items.length]);

  const item = openIndex !== null ? items[openIndex] : null;
  const navButtonClass =
    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20';

  return (
    <LightboxContext.Provider value={open}>
      {children}

      {item &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={item.label}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
            onClick={close}
          >
            <button ref={closeButtonRef} type="button" onClick={close} aria-label="Close" className={`absolute right-4 top-4 ${navButtonClass}`}>
              <CloseIcon />
            </button>

            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showPrev();
                  }}
                  aria-label="Previous asset"
                  className={`absolute left-2 sm:left-4 ${navButtonClass}`}
                >
                  <ChevronIcon direction="left" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showNext();
                  }}
                  aria-label="Next asset"
                  className={`absolute right-2 sm:right-4 ${navButtonClass}`}
                >
                  <ChevronIcon direction="right" />
                </button>
              </>
            )}

            <div className="flex max-h-[90vh] max-w-4xl flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
              {item.resourceType === 'IMAGE' ? (
                <img src={item.url} alt={item.label} className="max-h-[78vh] max-w-full rounded-2xl object-contain shadow-2xl" />
              ) : (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video src={item.url} controls autoPlay className="max-h-[78vh] max-w-full rounded-2xl bg-black shadow-2xl" />
              )}
              <div className="text-center">
                <p className="text-sm font-bold text-white">{item.label}</p>
                <p className="text-xs text-white/60">
                  {item.caption}
                  {items.length > 1 ? ` · ${(openIndex ?? 0) + 1} of ${items.length}` : ''}
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </LightboxContext.Provider>
  );
}

/** Drop-in replacement for the old `<a href target="_blank">` Review link - opens the shared lightbox at this card's index instead. */
export function MediaReviewButton({ index }: { index: number }) {
  const open = useOpenLightbox();
  return (
    <button
      type="button"
      onClick={() => open(index)}
      className="flex-1 rounded-xl border border-green py-1.5 text-center font-bold text-green hover:bg-green/10"
    >
      Review
    </button>
  );
}
