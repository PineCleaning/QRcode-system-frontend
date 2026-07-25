import { BrandHeader } from './BrandHeader';

export function InactiveFallback() {
  return (
    <div className="min-h-screen bg-gray-100 px-4 pb-12">
      <BrandHeader />
      <div className="mx-auto w-full max-w-lg rounded-md border border-gray-300 bg-white p-6 text-center shadow-sm sm:p-8">
        <h1 className="text-xl font-bold text-slate-800">This page isn&apos;t available</h1>
        <p className="mt-2 text-sm text-gray-600">
          This QR code isn&apos;t active right now. If you think this is a mistake, please contact the business
          directly.
        </p>
      </div>
    </div>
  );
}
