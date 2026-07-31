import { publicFetch } from '@/lib/api/public-fetch';
import type { ResolvedSlug } from '@/lib/api/public-types';
import { FeedbackForm } from './FeedbackForm';
import { InactiveFallback } from './InactiveFallback';

export default async function PublicFeedbackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { ok, body } = await publicFetch<ResolvedSlug>(`/public/${slug}`);

  if (!ok || !body) {
    return <InactiveFallback />;
  }

  return <FeedbackForm slug={body.slug} siteName={body.siteName} clientName={body.clientName} />;
}
