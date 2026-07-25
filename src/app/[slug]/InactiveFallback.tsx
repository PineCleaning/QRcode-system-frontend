export function InactiveFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900">This page isn&apos;t available</h1>
        <p className="mt-2 text-sm text-gray-500">
          This QR code isn&apos;t active right now. If you think this is a mistake, please contact the business
          directly.
        </p>
      </div>
    </div>
  );
}
