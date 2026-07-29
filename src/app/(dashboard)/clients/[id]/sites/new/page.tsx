import Link from 'next/link';
import { createSiteAction } from '../actions';
import { SiteForm } from '../SiteForm';

export default async function NewSitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold">Add site</h1>
        <Link
          prefetch={false}
          href={`/clients/${id}`}
          className="inline-flex shrink-0 items-center rounded-xl border border-line px-4 py-2 text-center text-[13.5px] font-bold transition hover:-translate-y-px"
        >
          ← Back
        </Link>
      </div>
      <SiteForm action={createSiteAction.bind(null, id)} cancelHref={`/clients/${id}`} />
    </div>
  );
}
