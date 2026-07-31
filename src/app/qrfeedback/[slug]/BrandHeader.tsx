import Image from 'next/image';

export function BrandHeader() {
  return (
    <div className="flex justify-center py-8">
      <Image
        src="/pine-cleaning-logo.webp"
        alt="Pine Cleaning Co."
        width={1462}
        height={328}
        priority
        className="h-auto w-64 sm:w-72"
      />
    </div>
  );
}
