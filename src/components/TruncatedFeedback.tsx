'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const PANEL_MAX_WIDTH = 420;
const PANEL_MAX_HEIGHT = 260;
const VIEWPORT_MARGIN = 8;
/** Delay before closing on mouseleave, so moving from the clamped text down into the panel (to scroll it) doesn't close it first. */
const CLOSE_DELAY_MS = 120;

/**
 * 2-line-clamped feedback text; hovering (or focusing via keyboard,
 * for accessibility) reveals the full text in a scrollable panel.
 * Portaled into document.body at a fixed position computed from the
 * trigger - same technique as AttachmentsCell/Select in this codebase.
 * The Feedback table has an overflow-x-auto wrapper that would clip a
 * plain absolutely-positioned popover otherwise.
 *
 * Hover/focus handlers are only attached when the text is genuinely
 * clamped (scrollHeight > clientHeight) - without this, short text
 * (e.g. "Test") still renders inside a block-level <p> that spans the
 * full column width, so hovering the empty space to its right would
 * otherwise wrongly open a popover with nothing extra to show.
 */
export function TruncatedFeedback({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const triggerRef = useRef<HTMLParagraphElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function checkTruncation() {
      const el = triggerRef.current;
      if (!el) return;
      // +1 guards against subpixel rounding falsely reporting truncation on exactly-2-line text.
      setIsTruncated(el.scrollHeight > el.clientHeight + 1);
    }
    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [text]);

  function show() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(PANEL_MAX_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2);
    const left = Math.min(rect.left, window.innerWidth - width - VIEWPORT_MARGIN);
    setPosition({ top: rect.bottom + 6, left: Math.max(VIEWPORT_MARGIN, left), width });
    setOpen(true);
  }

  function scheduleHide() {
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    // Same fix as Select.tsx's own dropdown: ignore scroll events that
    // originate inside the panel itself (it's independently
    // scrollable) - only a real page scroll/resize invalidates the
    // computed position and should close it.
    function handleScrollOrResize(e: Event) {
      if (panelRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [open]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  return (
    <>
      <p
        ref={triggerRef}
        tabIndex={isTruncated ? 0 : undefined}
        onMouseEnter={isTruncated ? show : undefined}
        onMouseLeave={isTruncated ? scheduleHide : undefined}
        onFocus={isTruncated ? show : undefined}
        onBlur={isTruncated ? scheduleHide : undefined}
        className={`line-clamp-2 whitespace-pre-wrap ${isTruncated ? 'cursor-default' : ''}`}
      >
        {text}
      </p>

      {open &&
        isTruncated &&
        position &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={panelRef}
            onMouseEnter={show}
            onMouseLeave={scheduleHide}
            style={{ position: 'fixed', top: position.top, left: position.left, width: position.width, maxHeight: PANEL_MAX_HEIGHT, zIndex: 100 }}
            className="overflow-y-auto whitespace-pre-wrap rounded-xl border border-line bg-surface p-3.5 text-[13px] leading-relaxed text-ink shadow-lg [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {text}
          </div>,
          document.body,
        )}
    </>
  );
}
