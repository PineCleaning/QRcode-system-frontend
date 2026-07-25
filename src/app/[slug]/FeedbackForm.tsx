'use client';

import { useRef, useState } from 'react';
import { uploadToCloudinary } from '@/lib/api/cloudinary-upload';
import type { FeedbackMediaInput, SignedUploadParams } from '@/lib/api/public-types';
import { BrandHeader } from './BrandHeader';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;
const MAX_FILES = 5;

type Status = 'idle' | 'uploading' | 'submitting' | 'success' | 'error';

export function FeedbackForm({ slug, siteName, clientName }: { slug: string; siteName: string; clientName: string }) {
  // Generated once per form load - reused on every retry, so a retry
  // after a network error is a safe idempotent replay, not a
  // duplicate submission.
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const [feedback, setFeedback] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length > MAX_FILES) {
      setError(`You can attach up to ${MAX_FILES} files.`);
      return;
    }
    setError(null);
    setFiles(selected);
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
          body: JSON.stringify({ folder: `feedback/${slug}` }),
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

      if (!feedbackRes.ok) {
        const body = await feedbackRes.json().catch(() => null);
        const message = body?.message;
        throw new Error(Array.isArray(message) ? message.join(', ') : message || 'Something went wrong. Please try again.');
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  const isBusy = status === 'uploading' || status === 'submitting';

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-100 px-4 pb-12">
        <BrandHeader />
        <div className="mx-auto w-full max-w-lg rounded-md border border-gray-300 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">Thank you!</h1>
          <p className="mt-2 text-sm text-gray-600">Your feedback has been received.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 pb-12">
      <BrandHeader />

      <div className="mx-auto w-full max-w-lg rounded-md border border-gray-300 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-lg font-bold text-slate-800">{clientName}</p>
          <p className="text-sm text-gray-500">{siteName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="feedback" className="mb-2 block text-base font-bold text-slate-800">
              Feedback: <span className="text-red-600">*</span>
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
              maxLength={5000}
              rows={6}
              className="w-full rounded border border-gray-300 px-3 py-3 text-base text-gray-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="mobileNumber" className="mb-2 block text-base font-bold text-slate-800">
              Mobile Number <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <input
              id="mobileNumber"
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-3 text-base text-gray-900 focus:border-blue-600 focus:outline-none"
            />
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-800">
              This lets us send you a text update
            </p>
          </div>

          <div>
            <label className="mb-2 block text-base font-bold text-slate-800">
              Upload File / Image <span className="font-normal text-gray-500">(optional, up to {MAX_FILES})</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center hover:border-blue-500 hover:bg-blue-50"
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

            {files.map((file) => (
              <div key={file.name} className="mt-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span className="truncate">{file.name}</span>
                  {/* Only show a percentage once the upload has actually
                      started (status 'uploading') - otherwise a freshly
                      selected file always reads "0%", which looks stuck
                      even though nothing has happened yet (upload only
                      begins on Submit). */}
                  {status === 'uploading' && <span>{progress[file.name] ?? 0}%</span>}
                </div>
                {status === 'uploading' && (
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full bg-blue-700 transition-all"
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
            className="w-full rounded-md bg-blue-700 px-3 py-3 text-base font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {status === 'uploading' ? 'Uploading…' : status === 'submitting' ? 'Submitting…' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}
