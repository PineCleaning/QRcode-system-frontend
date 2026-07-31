import { BrandHeader } from './qrfeedback/[slug]/BrandHeader';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e6f0e3] to-[#c9ddc3] px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-lg rounded-3xl bg-[#eaf3e7] p-4 shadow-lg sm:p-6">
        <BrandHeader />
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm sm:p-8">
          <h1 className="text-xl font-bold text-[#2d3660]">Page not found</h1>
          <p className="mt-2 text-sm text-gray-600">The page you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    </div>
  );
}
