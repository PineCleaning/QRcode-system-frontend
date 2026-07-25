/**
 * Text placeholder for the client's actual logo (a pine-tree mark +
 * "PINE CLEANING CO." wordmark, per their Jotform). Swap this for an
 * <img> once the real logo file is available - layout/spacing here is
 * sized to drop one in without other changes.
 */
export function BrandHeader() {
  return (
    <div className="py-8 text-center">
      <span className="text-3xl font-extrabold tracking-tight text-slate-800">PINE</span>{' '}
      <span className="text-3xl font-extrabold tracking-tight text-slate-800">CLEANING CO.</span>
    </div>
  );
}
