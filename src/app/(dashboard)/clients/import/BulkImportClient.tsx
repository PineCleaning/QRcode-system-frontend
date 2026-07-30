'use client';

import Papa from 'papaparse';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import type { CsvImportResult } from '@/lib/api/types';
import { bulkUploadAction } from './actions';

const PREVIEW_LIMIT = 20;

export function BulkImportClient() {
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [previewTotal, setPreviewTotal] = useState(0);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setResult(null);
    setUploadError(null);
    setPreviewError(null);
    setPreviewRows([]);
    setPreviewTotal(0);
    setFile(selected);

    if (!selected) return;

    Papa.parse<Record<string, string>>(selected, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setPreviewError(results.errors[0].message);
          return;
        }
        setPreviewTotal(results.data.length);
        setPreviewRows(results.data.slice(0, PREVIEW_LIMIT));
      },
      error: (err) => setPreviewError(err.message),
    });
  }

  function handleUpload() {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    startTransition(async () => {
      try {
        const uploadResult = await bulkUploadAction(formData);
        setResult(uploadResult);
        setUploadError(null);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Upload failed');
      }
    });
  }

  const previewHeaders = previewRows.length > 0 ? Object.keys(previewRows[0]) : [];

  return (
    <div className="space-y-6">
      <div className="rounded-[26px] border border-line bg-surface p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-extrabold">1. Download the template</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Columns: Client Name, Client Code (optional), Contact Email, Contact Phone, Site Name, Address.
            </p>
            <p className="mt-1 text-xs text-ink-muted">Contact Phone: digits only, optionally with + or - (no spaces, letters, or brackets).</p>
          </div>
          <a
            href="/client-import-template.csv"
            download
            className="rounded-xl border border-line px-4 py-2 text-sm font-bold text-ink hover:bg-line/40"
          >
            Download Template
          </a>
        </div>
      </div>

      <div className="rounded-[26px] border border-line bg-surface p-6 shadow-sm">
        <h2 className="text-sm font-extrabold">2. Choose your completed CSV file</h2>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileSelected}
          className="mt-3 block w-full text-sm text-ink file:mr-3 file:rounded-xl file:border file:border-line file:bg-page file:px-3 file:py-2 file:text-sm file:font-bold file:text-ink hover:file:bg-line/40"
        />
        {previewError && <p className="mt-2 text-sm text-red-600">{previewError}</p>}
      </div>

      {previewRows.length > 0 && (
        <div className="rounded-[26px] border border-line bg-surface p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-extrabold">
              3. Preview ({previewTotal} row{previewTotal === 1 ? '' : 's'} total{previewTotal > PREVIEW_LIMIT ? `, showing first ${PREVIEW_LIMIT}` : ''})
            </h2>
            <button
              type="button"
              onClick={handleUpload}
              disabled={isPending}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-page hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? 'Uploading…' : 'Confirm Upload'}
            </button>
          </div>

          <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="border-b border-line uppercase text-ink-muted">
                <tr>
                  {previewHeaders.map((header) => (
                    <th key={header} className="whitespace-nowrap px-3 py-2">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr key={i} className="border-b border-line last:border-0">
                    {previewHeaders.map((header) => (
                      <td key={header} className="whitespace-nowrap px-3 py-2 text-ink-muted">
                        {row[header] || <span className="text-ink-muted/40">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {uploadError && <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{uploadError}</p>}

      {result && (
        <div className="rounded-[26px] border border-line bg-surface p-6 shadow-sm">
          <h2 className="text-sm font-extrabold">Results</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {result.batch.totalRows} row{result.batch.totalRows === 1 ? '' : 's'} processed —{' '}
            <span className="text-green">{result.batch.successCount} succeeded</span>
            {result.batch.errorCount > 0 && (
              <>
                , <span className="text-coral">{result.batch.errorCount} failed</span>
              </>
            )}
            .
          </p>

          <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase text-ink-muted">
                <tr>
                  <th className="whitespace-nowrap px-3 py-2">Row</th>
                  <th className="whitespace-nowrap px-3 py-2">Status</th>
                  <th className="px-3 py-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-line last:border-0">
                    <td className="whitespace-nowrap px-3 py-2 text-ink-muted">{row.rowNumber}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          row.status === 'SUCCESS' ? 'bg-green/15 text-green' : 'bg-coral/15 text-coral'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-ink-muted">{row.errorMessage ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <Link prefetch={false} href="/clients" className="text-sm text-sky hover:underline">
              ← Back to Clients
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
