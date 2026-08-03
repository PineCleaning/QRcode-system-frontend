'use client';

import { useRef, useState } from 'react';
import { uploadToCloudinary } from '@/lib/api/cloudinary-upload';
import type { FeedbackMediaInput, SignedUploadParams } from '@/lib/api/public-types';
import { BrandHeader } from './BrandHeader';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;
const MAX_FILES = 5;

// Mirrors backend/src/cloudinary/media-limits.ts - kept in sync manually
// since the two apps don't share code. The backend re-checks all of this
// against the real uploaded file regardless (verifyResource), so this
// copy only affects UX (catching mistakes before a slow mobile upload),
// never security.
const ALLOWED_IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
const ALLOWED_VIDEO_EXT = ['mp4', 'mov', 'webm'];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_TOTAL_BYTES = 60 * 1024 * 1024;
const MAX_VIDEOS = 1;

function extOf(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? (parts.pop() ?? '').toLowerCase() : '';
}

function formatMb(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}

/**
 * crypto.randomUUID() only exists in a secure context (HTTPS, or
 * specifically "localhost") - it's undefined on a plain-HTTP LAN address
 * like http://192.168.x.x, which is exactly how this form gets tested on
 * a real phone during local development. Calling the missing function
 * threw during the very first render, crashing hydration for this whole
 * component silently - the file picker and submit handler stopped
 * working with no visible error, while the native text input kept
 * working since that's plain browser behavior, not React. Production
 * (Vercel, real HTTPS) won't hit this, but falling back keeps local
 * phone testing - and any old/unusual browser - working too.
 */
function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type Status = 'idle' | 'uploading' | 'submitting' | 'success' | 'error';

interface SubmitResponseMedia {
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string | null;
}
interface SubmitResponse {
  media?: SubmitResponseMedia[];
}

export function FeedbackForm({ slug, siteName, clientName }: { slug: string; siteName: string; clientName: string }) {
  // Generated once per form load - reused on every retry, so a retry
  // after a network error is a safe idempotent replay, not a
  // duplicate submission.
  const [idempotencyKey] = useState(() => generateIdempotencyKey());

  const [feedback, setFeedback] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [rejectedNotes, setRejectedNotes] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Returns an error message if the combined file list breaks a limit, or null if it's fine. */
  function validateFiles(list: File[]): string | null {
    if (list.length > MAX_FILES) {
      return `You can attach up to ${MAX_FILES} files.`;
    }

    let videoCount = 0;
    let total = 0;
    for (const file of list) {
      const ext = extOf(file.name);
      const isImage = ALLOWED_IMAGE_EXT.includes(ext);
      const isVideo = ALLOWED_VIDEO_EXT.includes(ext);

      if (!isImage && !isVideo) {
        return `"${file.name}" isn't a supported file type. Use JPEG, PNG, WebP, or HEIC/HEIF photos, or MP4, MOV, or WebM video.`;
      }
      if (isImage && file.size > MAX_IMAGE_BYTES) {
        return `"${file.name}" is too large. Photos must be ${formatMb(MAX_IMAGE_BYTES)} or smaller.`;
      }
      if (isVideo) {
        videoCount += 1;
        if (file.size > MAX_VIDEO_BYTES) {
          return `"${file.name}" is too large. Videos must be ${formatMb(MAX_VIDEO_BYTES)} or smaller.`;
        }
      }
      total += file.size;
    }
    if (videoCount > MAX_VIDEOS) {
      return 'Only one video can be attached per submission.';
    }
    if (total > MAX_TOTAL_BYTES) {
      return `These attachments add up to more than ${formatMb(MAX_TOTAL_BYTES)} total. Please remove one or choose smaller files.`;
    }
    return null;
  }

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const newlySelected = Array.from(e.target.files ?? []);
    // The native file input replaces its selection on every dialog open,
    // not adds to it - reset it here so re-selecting the same file later
    // still fires onChange, and merge into the existing list ourselves
    // so browsing multiple times (e.g. a video, then a photo) accumulates
    // instead of the second selection wiping out the first.
    e.target.value = '';

    const combined = [...files, ...newlySelected];
    const validationError = validateFiles(combined);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setFiles(combined);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus('uploading');

    try {
      const media: FeedbackMediaInput[] = [];

      if (files.length > 0) {
        const sigRes = await fetch(`${API_BASE_URL}/uploads/cloudinary-signature`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Date-nested (feedback/{slug}/{YYYY-MM-DD}/...) purely for
          // easier browsing in the Cloudinary dashboard - the app never
          // parses this path back out, it always treats public_id as an
          // opaque reference (see buildDeliveryUrl/verifyResource/destroy),
          // so nesting it deeper here needs no changes anywhere else.
          body: JSON.stringify({ folder: `feedback/${slug}/${new Date().toISOString().slice(0, 10)}` }),
        });
        if (!sigRes.ok) throw new Error('Could not prepare file upload. Please try again.');
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
      }

      setStatus('submitting');

      const feedbackRes = await fetch(`${API_BASE_URL}/feedback/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idempotencyKey,
          feedback,
          mobileNumber: mobileNumber || undefined,
          media: media.length > 0 ? media : undefined,
        }),
      });

      const feedbackBody = await feedbackRes.json().catch(() => null);

      if (!feedbackRes.ok) {
        const message = feedbackBody?.message;
        throw new Error(Array.isArray(message) ? message.join(', ') : message || 'Something went wrong. Please try again.');
      }

      // Individual bad attachments never fail the whole submission (the
      // feedback itself is already saved) - but a customer standing at a
      // job site deserves to know if a photo didn't make it through,
      // rather than assuming it did.
      const body = feedbackBody as SubmitResponse;
      const rejected = (body?.media ?? [])
        .filter((m) => m.status === 'REJECTED')
        .map((m) => m.rejectionReason ?? 'One attachment could not be included.');
      setRejectedNotes(rejected);

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  const isBusy = status === 'uploading' || status === 'submitting';

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#e6f0e3] to-[#c9ddc3] px-4 py-10 sm:py-16">
        <div className="mx-auto w-full max-w-lg rounded-3xl bg-[#eaf3e7] p-4 shadow-lg sm:p-6">
          <BrandHeader />
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm sm:p-8">
            <h1 className="text-xl font-bold text-[#2d3660]">Thank you!</h1>
            <p className="mt-2 text-sm text-gray-600">Your feedback has been received.</p>
            {rejectedNotes.length > 0 && (
              <div className="mt-4 rounded-md bg-yellow-50 p-3 text-left text-xs text-yellow-800">
                <p className="font-semibold">Your feedback was submitted, but not every attachment could be included:</p>
                <ul className="mt-1 list-disc pl-4">
                  {rejectedNotes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e6f0e3] to-[#c9ddc3] px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-lg rounded-3xl bg-[#eaf3e7] p-4 shadow-lg sm:p-6">
        <BrandHeader />

        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 space-y-4">
          <div>
            <label htmlFor="clientName" className="mb-2 block text-base font-bold text-[#2d3660]">
              Client
            </label>
            <input
              id="clientName"
              value={clientName}
              disabled
              className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-3 text-base text-gray-500"
            />
          </div>
          <div>
            <label htmlFor="siteName" className="mb-2 block text-base font-bold text-[#2d3660]">
              Site
            </label>
            <input
              id="siteName"
              value={siteName}
              disabled
              className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-3 text-base text-gray-500"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="feedback" className="mb-2 block text-base font-bold text-[#2d3660]">
              Feedback: <span className="text-red-600">*</span>
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
              maxLength={5000}
              rows={6}
              className="w-full rounded border border-gray-300 px-3 py-3 text-base text-gray-900 focus:border-[#3a6b47] focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">{feedback.length} / 5000 characters</p>
          </div>

          <div>
            <label htmlFor="mobileNumber" className="mb-2 block text-base font-bold text-[#2d3660]">
              Mobile Number <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <input
              id="mobileNumber"
              type="tel"
              inputMode="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9+\-\s()]/g, ''))}
              maxLength={32}
              className="w-full rounded border border-gray-300 px-3 py-3 text-base text-gray-900 focus:border-[#3a6b47] focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">Max 32 characters</p>
          </div>

          <div>
            <label className="mb-2 block text-base font-bold text-[#2d3660]">
              Upload File / Image <span className="font-normal text-gray-500">(optional, up to {MAX_FILES})</span>
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
              className="flex w-full flex-col items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center hover:border-[#3a6b47] hover:bg-green-50"
            >
              <svg
                className="mb-2 h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                />
              </svg>
              <span className="text-base font-bold text-slate-800">Browse Files</span>
              <span className="mt-1 text-sm text-gray-500">
                {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''} chosen` : 'Choose a file'}
              </span>
            </button>

            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="mt-2">
                <div className="flex justify-between gap-2 text-xs text-gray-500">
                  <span className="truncate">{file.name}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    {/* Only show a percentage once the upload has actually
                        started (status 'uploading') - otherwise a freshly
                        selected file always reads "0%", which looks stuck
                        even though nothing has happened yet (upload only
                        begins on Submit). */}
                    {status === 'uploading' && <span>{progress[file.name] ?? 0}%</span>}
                    {!isBusy && (
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        aria-label={`Remove ${file.name}`}
                        className="text-gray-400 hover:text-red-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                {status === 'uploading' && (
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full bg-[#3a6b47] transition-all"
                      style={{ width: `${progress[file.name] ?? 0}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isBusy}
            className="w-full rounded-md bg-[#3a6b47] px-3 py-3 text-base font-semibold text-white hover:bg-[#2f5639] disabled:opacity-50"
          >
            {status === 'uploading' ? 'Uploading…' : status === 'submitting' ? 'Submitting…' : 'Submit'}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}
