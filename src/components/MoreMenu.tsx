'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const MENU_ITEMS = [
  {
    href: '/media',
    label: 'Media',
    icon: (
      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M18 12.75V6.75A2.25 2.25 0 0 0 15.75 4.5H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5A2.25 2.25 0 0 0 6.75 19.5h10.5A2.25 2.25 0 0 0 19.5 17.25V15M9 9h.008v.008H9V9Z"
        />
      </svg>
    ),
  },
  {
    href: '/settings/clickup',
    label: 'Integrations',
    icon: (
      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.558-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
  },
];

const PANEL_WIDTH = 190;
const VIEWPORT_MARGIN = 8;

/**
 * Three-dot "more" menu holding Media and Integrations - moved out of
 * the main sidebar per explicit request (2026-09-17) to declutter it,
 * and restricted to Admins only (both pages were previously open to
 * every role in the sidebar; narrowing that is a deliberate scope
 * change agreed with the user, not an accident). Rendered next to
 * ProfileButton in both the desktop top strip (layout.tsx) and the
 * mobile top bar (DashboardNav.tsx) so it's reachable everywhere the
 * profile icon is, not just on desktop.
 *
 * Portal-positioned the same way as Select.tsx/AttachmentsCell's
 * dropdowns - right-aligned to the trigger instead of left, since this
 * sits at the far right of the header and a left-aligned panel would
 * run off the viewport edge.
 */
export function MoreMenu() {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function updatePosition() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({ top: rect.bottom + 4, right: Math.max(VIEWPORT_MARGIN, window.innerWidth - rect.right) });
  }

  function toggleOpen() {
    if (!open) updatePosition();
    setOpen((o) => !o);
  }

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function handleScrollOrResize() {
      setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleOpen}
        aria-label="More"
        aria-haspopup="menu"
        aria-expanded={open}
        title="More"
        className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition hover:bg-line/50 hover:text-ink"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 6.75a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Zm0 7a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Zm0 7a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Z" />
        </svg>
      </button>

      {open &&
        position &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={panelRef}
            role="menu"
            style={{ position: 'fixed', top: position.top, right: position.right, width: PANEL_WIDTH, zIndex: 100 }}
            className="rounded-xl border border-line bg-surface p-1.5 shadow-lg"
          >
            {MENU_ITEMS.map((item) => (
              <Link
                key={item.href}
                prefetch={false}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-ink/[0.06]"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
