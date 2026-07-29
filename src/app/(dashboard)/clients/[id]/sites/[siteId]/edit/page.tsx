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
      <Link prefetch={false} href={`/clients/${id}`} className="mb-2 inline-block text-sm text-ink-muted hover:text-ink">
        ← {site.siteName}
      </Link>
      <h1 className="mb-6 text-xl font-extrabold">Edit site</h1>
      <SiteForm site={site} action={updateSiteAction.bind(null, siteId, id)} cancelHref={`/clients/${id}`} />
    </div>
  );
}
