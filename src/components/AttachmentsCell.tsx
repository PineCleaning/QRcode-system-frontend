'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { deleteAttachmentAction } from '@/app/(dashboard)/feedback/actions';
import { ConfirmDeleteButton } from './ConfirmDeleteButton';
import { useOpenLightbox } from './MediaLightbox';

interface MediaItem {
  id: string;
  originalFilename: string | null;
  resourceType: 'IMAGE' | 'VIDEO';
  url: string | null;
  status: string;
}

function ImageIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15.75 8.69 9.31a1.125 1.125 0 0 1 1.591 0L15.75 15m-2.25-2.25 1.72-1.72a1.125 1.125 0 0 1 1.591 0L21.75 15m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6.75a1.5 1.5 0 0 0-1.5-1.5H3.75a1.5 1.5 0 0 0-1.5 1.5v10.5a1.5 1.5 0 0 0 1.5 1.5Z"
      />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m15.75 10.5 4.72-2.72a.75.75 0 0 1 1.28.53v7.38a.75.75 0 0 1-1.28.53l-4.72-2.72M4.5 18.75h9a1.5 1.5 0 0 0 1.5-1.5v-9a1.5 1.5 0 0 0-1.5-1.5h-9a1.5 1.5 0 0 0-1.5 1.5v9a1.5 1.5 0 0 0 1.5 1.5Z"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
      />
    </svg>
  );
}

function mediaLabel(item: MediaItem): string {
  return item.originalFilename || (item.resourceType === 'IMAGE' ? 'Photo' : 'Video');
}

function AttachmentLink({
  item,
  lightboxIndex,
  underlineOnHover = true,
  onSelect,
}: {
  item: MediaItem;
  /** Index of this item within the page's shared MediaLightboxProvider items list - undefined when this item has no url (nothing to open). */
  lightboxIndex: number | undefined;
  underlineOnHover?: boolean;
  /** Called right before opening the lightbox - lets the caller close its own dropdown panel first, so it doesn't stay open behind the lightbox. */
  onSelect?: () => void;
}) {
  const openLightbox = useOpenLightbox();
  const icon = item.resourceType === 'IMAGE' ? <ImageIcon /> : <VideoIcon />;
  const label = mediaLabel(item);

  if (item.url && lightboxIndex !== undefined) {
    return (
      <button
        type="button"
        onClick={() => {
          onSelect?.();
          openLightbox(lightboxIndex);
        }}
        className={`flex min-w-0 items-center gap-1.5 text-sky ${underlineOnHover ? 'hover:underline' : ''}`}
      >
        {icon}
        <span className="truncate">{label}</span>
      </button>
    );
  }

  return (
    <span className="flex min-w-0 items-center gap-1.5 text-ink-muted/70">
      {icon}
      <span className="truncate">{label}</span>
      <span className="shrink-0 text-[10px] text-coral">({item.status === 'REJECTED' ? 'Rejected' : 'Unavailable'})</span>
    </span>
  );
}

/** Delete icon + confirmation, reused for both the single-attachment and dropdown-row cases. Permanently removes the file from Cloudinary, the feedback record, and the Assets page. */
function DeleteAttachmentButton({ item, pathToRevalidate }: { item: MediaItem; pathToRevalidate: string }) {
  return (
    <ConfirmDeleteButton
      action={deleteAttachmentAction.bind(null, item.id, pathToRevalidate)}
      itemLabel={mediaLabel(item)}
      warning="This permanently removes the file from Cloudinary storage, and it will also disappear from the Assets page - not just from this list."
      triggerLabel={<TrashIcon />}
      triggerAriaLabel={`Delete ${mediaLabel(item)}`}
      triggerClassName="shrink-0 rounded p-1 text-ink-muted/50 hover:bg-coral/10 hover:text-coral"
    />
  );
}

const PANEL_WIDTH = 260;
const VIEWPORT_MARGIN = 8;

/**
 * A single attachment renders as a plain link (previous behavior).
 * Multiple attachments collapse to the first file's name + a dropdown
 * arrow, so every row stays the same height regardless of attachment
 * count - the full list only appears in a popover on click. Both cases
 * now also show a delete icon per file.
 *
 * The popover is rendered through a portal into document.body at a
 * fixed position computed from the trigger button, NOT as a normal
 * absolutely-positioned child. The table this lives in has an
 * overflow-x-auto wrapper (for horizontal scroll on narrow screens),
 * which would clip or scroll away a plain absolute-positioned dropdown
 * - the portal is what lets the popover float freely above the whole
 * page regardless of the table's own scroll/clipping box, the same
 * technique real component libraries (Radix, Headless UI) use for
 * exactly this reason.
 */
export function AttachmentsCell({
  media,
  pathToRevalidate,
  mediaIndexMap,
}: {
  media: MediaItem[];
  pathToRevalidate: string;
  /** Maps each media id to its index in the page's shared MediaLightboxProvider items list - lets any attachment on the page open the lightbox at the right item and Prev/Next through every other one. */
  mediaIndexMap: Map<string, number>;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function updatePosition() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const left = Math.min(rect.left, window.innerWidth - PANEL_WIDTH - VIEWPORT_MARGIN);
    setPosition({ top: rect.bottom + 4, left: Math.max(VIEWPORT_MARGIN, left) });
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
    // Scroll/resize invalidate the computed position - closing is
    // simpler and safer than trying to keep a fixed-position portal
    // element glued to a trigger that just moved out from under it.
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

  if (media.length === 0) {
    return <span className="text-xs italic text-ink-muted/70">No attachments</span>;
  }

  if (media.length === 1) {
    return (
      <div className="flex max-w-[200px] items-center gap-1 text-xs">
        <AttachmentLink item={media[0]} lightboxIndex={mediaIndexMap.get(media[0].id)} />
        <DeleteAttachmentButton item={media[0]} pathToRevalidate={pathToRevalidate} />
      </div>
    );
  }

  return (
    <div className="max-w-[180px] text-xs">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleOpen}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex w-full items-center gap-1 text-sky hover:underline"
      >
        <span className="flex min-w-0 items-center gap-1.5">
          {media[0].resourceType === 'IMAGE' ? <ImageIcon /> : <VideoIcon />}
          <span className="truncate">{mediaLabel(media[0])}</span>
        </span>
        <svg
          className={`h-3 w-3 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open &&
        position &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: 'fixed', top: position.top, left: position.left, width: PANEL_WIDTH, zIndex: 100 }}
            className="rounded-xl border border-line bg-surface p-1.5 shadow-lg"
          >
            <div className="flex flex-col gap-0.5">
              {media.map((item) => (
                <div key={item.id} className="flex items-center gap-1 rounded-lg px-2 py-1.5 transition-colors hover:bg-ink/[0.06]">
                  <AttachmentLink
                    item={item}
                    lightboxIndex={mediaIndexMap.get(item.id)}
                    underlineOnHover={false}
                    onSelect={() => setOpen(false)}
                  />
                  <DeleteAttachmentButton item={item} pathToRevalidate={pathToRevalidate} />
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
