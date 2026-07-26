import { createSiteAction } from '../actions';
import { SiteForm } from '../SiteForm';

export default async function NewSitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Add site</h1>
      <SiteForm action={createSiteAction.bind(null, id)} cancelHref={`/clients/${id}`} />
    </div>
  );
}
