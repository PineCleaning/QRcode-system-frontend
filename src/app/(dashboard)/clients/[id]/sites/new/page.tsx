import Link from 'next/link';
import { createSiteAction } from '../actions';
import { SiteForm } from '../SiteForm';

export default async function NewSitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <Link prefetch={false} href={`/clients/${id}`} className="mb-2 inline-block text-sm text-ink-muted hover:text-ink">
        ← Back
      </Link>
      <h1 className="mb-6 text-xl font-extrabold">Add site</h1>
      <SiteForm action={createSiteAction.bind(null, id)} cancelHref={`/clients/${id}`} />
    </div>
  );
}
