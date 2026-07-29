import { BrandHeader } from './BrandHeader';

export function InactiveFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e6f0e3] to-[#c9ddc3] px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-lg rounded-3xl bg-[#eaf3e7] p-4 shadow-lg sm:p-6">
        <BrandHeader />
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm sm:p-8">
          <h1 className="text-xl font-bold text-[#2d3660]">This page isn&apos;t available</h1>
          <p className="mt-2 text-sm text-gray-600">
            This QR code isn&apos;t active right now. If you think this is a mistake, please contact the business
            directly.
          </p>
        </div>
      </div>
    </div>
  );
}
