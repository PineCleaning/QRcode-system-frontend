'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Shared shell for the "Add client"/"Edit client" popups (and future
 * form modals) - the same rounded-card-on-backdrop shell already used
 * by ConfirmDeleteButton/ConfirmDeactivateButton, just wide enough for
 * a form and with a title + close (X) instead of a confirm prompt.
 *
 * Portaled into document.body, same reasoning as every other overlay
 * in this app - rendering it as a plain nested child instead let it
 * silently inherit CSS from wherever it happened to be opened. Real
 * bug hit and fixed: the "No sites yet" empty state has text-center
 * on its container, and since text-align inherits, opening Add Site
 * from that state centered every label/input inside the modal too -
 * the same modal opened from the toolbar (not inside that container)
 * rendered correctly. Portaling escapes any ancestor's styling
 * entirely, which is the actual fix, not a one-off text-left patch.
 *
 * Deliberately does NOT lock document.body's own scroll (no other
 * overlay in this app does either, e.g. ConfirmDeleteButton,
 * MediaLightbox) - toggling body overflow:hidden removes the page's
 * scrollbar, which reclaims its width and shifts the whole page's
 * content rightward for as long as the modal is open. Real bug hit
 * and fixed: this was the one modal in the app that did that, and it
 * was the only one with a visible layout shift on open/close.
 */
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 sm:items-center">
      <div className="w-full max-w-md rounded-[26px] bg-surface p-6 text-left shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-ink-muted hover:bg-line/50 hover:text-ink"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
