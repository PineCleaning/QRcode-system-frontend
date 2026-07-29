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
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">1. Download the template</h2>
            <p className="mt-1 text-sm text-gray-500">
              Columns: Client Name, Client Code (optional), Contact Email, Contact Phone, Site Name, Address.
            </p>
          </div>
          <a
            href="/client-import-template.csv"
            download
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Download Template
          </a>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">2. Choose your completed CSV file</h2>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileSelected}
          className="mt-3 block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-50"
        />
        {previewError && <p className="mt-2 text-sm text-red-600">{previewError}</p>}
      </div>

      {previewRows.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-gray-900">
              3. Preview ({previewTotal} row{previewTotal === 1 ? '' : 's'} total{previewTotal > PREVIEW_LIMIT ? `, showing first ${PREVIEW_LIMIT}` : ''})
            </h2>
            <button
              type="button"
              onClick={handleUpload}
              disabled={isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? 'Uploading…' : 'Confirm Upload'}
            </button>
          </div>

          <div className="mt-4 overflow-x-auto rounded-md border border-gray-200">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="border-b border-gray-200 bg-gray-50 uppercase text-gray-500">
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
                  <tr key={i} className="border-b border-gray-100 last:border-0">
                    {previewHeaders.map((header) => (
                      <td key={header} className="whitespace-nowrap px-3 py-2 text-gray-700">
                        {row[header] || <span className="text-gray-300">—</span>}
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
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Results</h2>
          <p className="mt-1 text-sm text-gray-600">
            {result.batch.totalRows} row{result.batch.totalRows === 1 ? '' : 's'} processed —{' '}
            <span className="text-accent">{result.batch.successCount} succeeded</span>
            {result.batch.errorCount > 0 && (
              <>
                , <span className="text-red-600">{result.batch.errorCount} failed</span>
              </>
            )}
            .
          </p>

          <div className="mt-4 overflow-x-auto rounded-md border border-gray-200">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="whitespace-nowrap px-3 py-2">Row</th>
                  <th className="whitespace-nowrap px-3 py-2">Status</th>
                  <th className="px-3 py-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 last:border-0">
                    <td className="whitespace-nowrap px-3 py-2 text-gray-500">{row.rowNumber}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          row.status === 'SUCCESS' ? 'bg-accent/10 text-accent' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-700">{row.errorMessage ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <Link prefetch={false} href="/clients" className="text-sm text-blue-600 hover:underline">
              ← Back to Clients
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
