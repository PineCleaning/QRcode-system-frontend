import Link from 'next/link';
import { apiFetch } from '@/lib/api/server-fetch';
import type { Site } from '@/lib/api/types';
import { updateSiteAction } from '../../actions';
import { SiteForm } from '../../SiteForm';

export default async function EditSitePage({ params }: { params: Promise<{ id: string; siteId: string }> }) {
  const { id, siteId } = await params;
  const site = await apiFetch<Site>(`/sites/${siteId}`);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold">Edit site</h1>
        <Link
          prefetch={false}
          href={`/clients/${id}`}
          className="inline-flex shrink-0 items-center rounded-xl border border-line px-4 py-2 text-center text-[13.5px] font-bold transition hover:-translate-y-px"
        >
          ← {site.siteName}
        </Link>
      </div>
      <SiteForm site={site} action={updateSiteAction.bind(null, siteId, id)} cancelHref={`/clients/${id}`} />
    </div>
  );
}
