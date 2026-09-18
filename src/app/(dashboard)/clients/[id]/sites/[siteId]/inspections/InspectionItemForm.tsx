'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Select } from '@/components/Select';
import { uploadToCloudinary } from '@/lib/api/cloudinary-upload';
import type { SignedUploadParams } from '@/lib/api/public-types';
import type { InspectionItem, InspectionRating } from '@/lib/api/types';
import type { InspectionItemMediaInput } from './actions';
import { RATING_OPTIONS, RATING_RANGES } from './inspection-labels';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;
const MAX_ATTACHMENTS = 5;

// Mirrors backend/src/cloudinary/media-limits.ts - UX-only pre-check,
// same reasoning as the public feedback form's copy of these constants
// (see FeedbackForm.tsx). verifyResource() on the backend is the real
// enforcement either way.
const ALLOWED_IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
const ALLOWED_VIDEO_EXT = ['mp4', 'mov', 'webm'];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

function extOf(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? (parts.pop() ?? '').toLowerCase() : '';
}

type FormAction = (prevState: string | null, formData: FormData) => Promise<string | null>;

/**
 * Two-phase submit: when there are new files to upload, the first
 * onSubmit intercepts (preventDefault), does the async Cloudinary
 * upload, stashes the result into a hidden `media` field, then calls
 * requestSubmit() to re-fire submission - which this time has no
 * pending files, so it falls through and the native <form action>
 * dispatch actually proceeds.
 *
 * This exists specifically so the mutation itself is dispatched through
 * React's real action mechanism (useActionState + <form action>), not a
 * plain awaited function call - only that dispatch path gets Next.js's
 * combined mutation+revalidation single round trip, which is what makes
 * the modal closing and the table showing new data land together, the
 * same way InventoryItemForm already does. A plain call (even wrapped
 * in startTransition) triggers the page's revalidated data as a
 * separate, later network round trip - confirmed by timing both forms:
 * Inventory's modal-close and table-update landed ~50ms apart, while
 * the previous (non-form-action) version of this component showed a
 * ~3.6s gap between them.
 */
export function InspectionItemForm({
  item,
  folder,
  action,
  onCancel,
  onSuccess,
}: {
  item?: InspectionItem;
  /** Cloudinary folder prefix for any new uploads - purely organizational, see CloudinaryController. */
  folder: string;
  action: FormAction;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [actionError, formAction, isPending] = useActionState(action, null);
  const isEdit = Boolean(item);
  const existingMediaCount = item?.media.length ?? 0;
  const remainingSlots = MAX_ATTACHMENTS - existingMediaCount;

  const [spaceName, setSpaceName] = useState(item?.spaceName ?? '');
  const [isNotApplicable, setIsNotApplicable] = useState(item?.isNotApplicable ?? false);
  const [rating, setRating] = useState<string>(item?.rating ?? '');
  const [percentage, setPercentage] = useState<number>(item?.percentage ?? RATING_RANGES.AVERAGE[0]);
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const mediaFieldRef = useRef<HTMLInputElement>(null);
  // Whether `files` has already been uploaded and baked into the hidden
  // `media` field - reset whenever the file list itself changes, so a
  // second submit attempt doesn't skip re-uploading a newly added file.
  const filesUploadedRef = useRef(false);

  const submittedRef = useRef(false);
  useEffect(() => {
    if (isPending) {
      submittedRef.current = true;
    } else if (submittedRef.current && !actionError) {
      submittedRef.current = false;
      onSuccess();
    }
  }, [isPending, actionError, onSuccess]);

  const range = rating ? RATING_RANGES[rating as InspectionRating] : null;
  const error = localError ?? actionError;

  function handleRatingChange(value: string) {
    setRating(value);
    const newRange = RATING_RANGES[value as InspectionRating];
    if (newRange && (percentage < newRange[0] || percentage > newRange[1])) {
      setPercentage(newRange[0]);
    }
  }

  function validateFiles(list: File[]): string | null {
    if (list.length > remainingSlots) {
      return `You can attach up to ${remainingSlots} more file${remainingSlots === 1 ? '' : 's'} to this item.`;
    }
    for (const file of list) {
      const ext = extOf(file.name);
      const isImage = ALLOWED_IMAGE_EXT.includes(ext);
      const isVideo = ALLOWED_VIDEO_EXT.includes(ext);
      if (!isImage && !isVideo) {
        return `"${file.name}" isn't a supported file type.`;
      }
      if (isImage && file.size > MAX_IMAGE_BYTES) {
        return `"${file.name}" is too large (max ${MAX_IMAGE_BYTES / (1024 * 1024)}MB for photos).`;
      }
      if (isVideo && file.size > MAX_VIDEO_BYTES) {
        return `"${file.name}" is too large (max ${MAX_VIDEO_BYTES / (1024 * 1024)}MB for video).`;
      }
    }
    return null;
  }

  /** Shared by the file input's onChange and the dropzone's onDrop - both end up with a plain File[] to merge in. */
  function addFiles(newlySelected: File[]) {
    const combined = [...files, ...newlySelected];
    const validationError = validateFiles(combined);
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    setLocalError(null);
    filesUploadedRef.current = false;
    setFiles(combined);
  }

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const newlySelected = Array.from(e.target.files ?? []);
    e.target.value = '';
    addFiles(newlySelected);
  }

  function handleDrop(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files ?? []));
  }

  function removeFile(index: number) {
    filesUploadedRef.current = false;
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setLocalError(null);
  }

  async function uploadThenSubmit() {
    setLocalError(null);
    setUploading(true);
    const media: InspectionItemMediaInput[] = [];
    try {
      const sigRes = await fetch(`${API_BASE_URL}/uploads/cloudinary-signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder }),
      });
      if (!sigRes.ok) {
        throw new Error('Could not prepare file upload. Please try again.');
      }
      const sig: SignedUploadParams = await sigRes.json();

      for (const file of files) {
        const result = await uploadToCloudinary(file, sig, (percent) => {
          setProgress((prev) => ({ ...prev, [file.name]: percent }));
        });
        media.push({
          cloudinaryPublicId: result.public_id,
          resourceType: result.resource_type.toUpperCase() as 'IMAGE' | 'VIDEO',
          originalFilename: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        });
      }
    } catch (err) {
      setUploading(false);
      setLocalError(err instanceof Error ? err.message : 'One or more files failed to upload.');
      return;
    }
    setUploading(false);

    if (mediaFieldRef.current) {
      mediaFieldRef.current.value = JSON.stringify(media);
    }
    filesUploadedRef.current = true;
    formRef.current?.requestSubmit();
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!isNotApplicable && !rating) {
      e.preventDefault();
      setLocalError('Choose a rating, or mark this space Not Applicable.');
      return;
    }
    if (files.length > 0 && !filesUploadedRef.current) {
      e.preventDefault();
      void uploadThenSubmit();
      return;
    }
    setLocalError(null);
  }

  const isBusy = uploading || isPending;

  return (
    <form ref={formRef} action={formAction} onSubmit={handleFormSubmit} className="space-y-4">
      <div>
        <label htmlFor="spaceName" className="mb-1 block text-sm font-bold text-ink">
          Space / Area <span className="text-coral">*</span>
        </label>
        <input
          id="spaceName"
          name="spaceName"
          value={spaceName}
          onChange={(e) => setSpaceName(e.target.value)}
          required
          placeholder="e.g. Kitchen"
          className="w-full rounded-xl border border-line bg-page px-3 py-2 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
        />
      </div>

      <input type="hidden" name="isNotApplicable" value={isNotApplicable ? 'true' : 'false'} />
      <label className="flex items-center gap-2 text-sm font-semibold text-ink">
        <input
          type="checkbox"
          checked={isNotApplicable}
          onChange={(e) => setIsNotApplicable(e.target.checked)}
          className="h-4 w-4 rounded border-line"
        />
        Not Applicable
      </label>

      {!isNotApplicable && (
        <>
          <div>
            <label htmlFor="rating" className="mb-1 block text-sm font-bold text-ink">
              Rating <span className="text-coral">*</span>
            </label>
            <input type="hidden" name="rating" value={rating} />
            <Select id="rating" value={rating} onChange={handleRatingChange} placeholder="Select a rating" options={RATING_OPTIONS} />
          </div>

          {range && (
            <div>
              <label htmlFor="percentage" className="mb-1 flex items-center justify-between text-sm font-bold text-ink">
                <span>Percentage</span>
                <span className="tabular-nums text-ink-muted">{percentage}%</span>
              </label>
              <input
                id="percentage"
                name="percentage"
                type="range"
                min={range[0]}
                max={range[1]}
                step={1}
                value={percentage}
                onChange={(e) => setPercentage(Number(e.target.value))}
                className="w-full accent-green"
              />
              <div className="flex justify-between text-[11px] text-ink-muted">
                <span>{range[0]}%</span>
                <span>{range[1]}%</span>
              </div>
            </div>
          )}
        </>
      )}

      <div>
        <label htmlFor="notes" className="mb-1 block text-sm font-bold text-ink">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={item?.notes ?? ''}
          rows={3}
          className="w-full rounded-xl border border-line bg-page px-3 py-2 text-sm text-ink focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
        />
      </div>

      <input type="hidden" name="media" ref={mediaFieldRef} defaultValue="" />

      {remainingSlots > 0 && (
        <div>
          <label className="mb-1 block text-sm font-bold text-ink">
            Photos <span className="font-normal text-ink-muted">(optional, up to {remainingSlots} more)</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime,video/webm"
            multiple
            onChange={handleFilesSelected}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-4 text-sm font-semibold transition ${
              isDragging ? 'border-green bg-green/5 text-ink' : 'border-line bg-page text-ink-muted hover:border-green hover:text-ink'
            }`}
          >
            {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''} chosen` : isDragging ? 'Drop to add' : 'Browse files or drag & drop'}
          </button>
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="mt-1.5 flex items-center justify-between gap-2 text-xs text-ink-muted">
              <span className="truncate">{file.name}</span>
              <div className="flex shrink-0 items-center gap-2">
                {uploading && <span>{progress[file.name] ?? 0}%</span>}
                {!isBusy && (
                  <button type="button" onClick={() => removeFile(index)} aria-label={`Remove ${file.name}`} className="text-ink-muted hover:text-coral">
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isBusy}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-page hover:opacity-90 disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Add item'}
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
