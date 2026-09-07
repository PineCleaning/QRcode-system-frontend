import Link from 'next/link';
import { AttachmentsCell } from '@/components/AttachmentsCell';
import { MediaLightboxProvider } from '@/components/MediaLightbox';
import { TruncatedText } from '@/components/TruncatedText';
import { apiFetch } from '@/lib/api/server-fetch';
import type { Client, Site } from '@/lib/api/types';
import { formatDate } from '@/lib/format-date';
import { deleteInspectionMediaAction, openOrResumeInspectionAction } from './actions';
import { AddInspectionItemModal } from './AddInspectionItemModal';
import { EditInspectionItemModal } from './EditInspectionItemModal';
import { RATING_BADGE_STYLES, RATING_LABELS } from './inspection-labels';

const DELETE_MEDIA_WARNING = 'This permanently removes the file from Cloudinary storage - it cannot be recovered.';

export default async function SiteInspectionsPage({
  params,
}: {
  params: Promise<{ id: string; siteId: string }>;
}) {
  const { id, siteId } = await params;
  const path = `/clients/${id}/sites/${siteId}/inspections`;

  const [client, site, inspection] = await Promise.all([
    apiFetch<Client>(`/clients/${id}`),
    apiFetch<Site>(`/sites/${siteId}`),
    openOrResumeInspectionAction(siteId),
  ]);

  // Every verified attachment across every item in this session,
  // flattened into one shared list - same pattern as the Feedback
  // page - so any attachment link opens the lightbox and can Prev/Next
  // through every other one in the session, not just its own item's.
  const verifiedMedia = inspection.items.flatMap((item) => item.media.filter((m) => m.url));
  const mediaIndexMap = new Map(verifiedMedia.map((m, i) => [m.id, i]));
  const lightboxItems = verifiedMedia.map((m) => {
    const parentItem = inspection.items.find((it) => it.media.some((im) => im.id === m.id))!;
    return {
      url: m.url!,
      label: m.originalFilename || (m.resourceType === 'IMAGE' ? 'Photo' : 'Video'),
      resourceType: m.resourceType,
      caption: parentItem.spaceName,
    };
  });

  return (
    <div>
      <div className="mb-6 flex items-start gap-3">
        <Link
          prefetch={false}
          href={`/clients/${id}`}
          aria-label={`Back to ${client.clientName}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-ink transition hover:-translate-y-px"
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-extrabold tracking-tight">Site Inspection</h1>
                <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold text-page">{inspection.items.length}</span>
              </div>
              <p className="mt-1 text-[13.5px] text-ink-muted">
                {site.businessName} · Session started {formatDate(inspection.startedAt)}
              </p>
            </div>
            <AddInspectionItemModal inspectionId={inspection.id} path={path} />
          </div>
        </div>
      </div>

      {inspection.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[26px] border border-line bg-surface p-12 text-center shadow-sm">
          <svg className="h-10 w-10 text-ink-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <p className="text-sm text-ink-muted">No spaces inspected yet in this session.</p>
        </div>
      ) : (
        <MediaLightboxProvider items={lightboxItems}>
        <div className="overflow-hidden rounded-[26px] border border-line bg-surface shadow-sm">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-[13.5px]">
            <thead className="border-b border-line text-[10.5px] font-extrabold uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="whitespace-nowrap px-5.5 py-4">Space / Area</th>
                <th className="whitespace-nowrap px-5.5 py-4">Rating</th>
                <th className="px-5.5 py-4">Notes</th>
                <th className="whitespace-nowrap px-5.5 py-4">Photos</th>
                <th className="whitespace-nowrap px-5.5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inspection.items.map((item) => (
                <tr key={item.id} className="border-b border-line align-top last:border-0 hover:bg-ink/[0.03]">
                  <td className="max-w-[200px] px-5.5 py-3.5 font-bold">{item.spaceName}</td>
                  <td className="px-5.5 py-3.5">
                    {item.isNotApplicable ? (
                      <span className="inline-flex items-center whitespace-nowrap rounded-full bg-ink-muted/15 px-2.5 py-1 text-[11px] font-extrabold text-ink-muted">
                        NOT APPLICABLE
                      </span>
                    ) : (
                      item.rating && (
                        <span
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold ${RATING_BADGE_STYLES[item.rating]}`}
                        >
                          {RATING_LABELS[item.rating]} · {item.percentage}%
                        </span>
                      )
                    )}
                  </td>
                  <td className="max-w-40 px-5.5 py-3.5 text-ink/80">
                    {item.notes ? (
                      <TruncatedText text={item.notes} lines={2} className="break-all" />
                    ) : (
                      <span className="text-ink-muted/40">—</span>
                    )}
                  </td>
                  <td className="px-5.5 py-3.5">
                    <AttachmentsCell
                      media={item.media}
                      pathToRevalidate={path}
                      mediaIndexMap={mediaIndexMap}
                      deleteAction={deleteInspectionMediaAction}
                      deleteWarning={DELETE_MEDIA_WARNING}
                    />
                  </td>
                  <td className="whitespace-nowrap px-5.5 py-3.5 font-bold">
                    <EditInspectionItemModal item={item} path={path} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
        </MediaLightboxProvider>
      )}
    </div>
  );
}
