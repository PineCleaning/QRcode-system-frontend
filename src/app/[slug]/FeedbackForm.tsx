'use client';

import { useState } from 'react';
import { uploadToCloudinary } from '@/lib/api/cloudinary-upload';
import type { FeedbackMediaInput, SignedUploadParams } from '@/lib/api/public-types';

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

  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
        <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">Thank you!</h1>
          <p className="mt-2 text-sm text-gray-500">Your feedback has been received.</p>
        </div>
      </div>
    );
  }

  const isBusy = status === 'uploading' || status === 'submitting';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-lg font-semibold text-gray-900">{clientName}</h1>
          <p className="text-sm text-gray-500">{siteName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="feedback" className="mb-1 block text-sm font-medium text-gray-700">
              Your feedback
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
              maxLength={5000}
              rows={5}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-base focus:border-gray-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="mobileNumber" className="mb-1 block text-sm font-medium text-gray-700">
              Mobile number <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="mobileNumber"
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-base focus:border-gray-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="media" className="mb-1 block text-sm font-medium text-gray-700">
              Photo/video <span className="text-gray-400">(optional, up to {MAX_FILES})</span>
            </label>
            <input
              id="media"
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFilesSelected}
              className="w-full text-sm"
            />
            {files.map((file) => (
              <div key={file.name} className="mt-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span className="truncate">{file.name}</span>
                  <span>{progress[file.name] ?? 0}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full bg-gray-900 transition-all"
                    style={{ width: `${progress[file.name] ?? 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isBusy}
            className="w-full rounded-md bg-gray-900 px-3 py-3 text-base font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {status === 'uploading' ? 'Uploading…' : status === 'submitting' ? 'Submitting…' : 'Submit feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}
