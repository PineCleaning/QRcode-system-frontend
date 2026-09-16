import Link from 'next/link';
import { AttachmentsCell } from '@/components/AttachmentsCell';
import { FlagButton } from '@/components/FlagButton';
import { MediaLightboxProvider } from '@/components/MediaLightbox';
import { TruncatedText } from '@/components/TruncatedText';
import { apiFetch } from '@/lib/api/server-fetch';
import type { AdminFeedbackSubmission, FlaggedInspectionItem } from '@/lib/api/types';
import { formatDate } from '@/lib/format-date';
import { setFeedbackFlaggedAction } from '../feedback/actions';
import { deleteInspectionMediaAction, setInspectionItemFlaggedAction } from '../clients/[id]/sites/[siteId]/inspections/actions';
import { RATING_BADGE_STYLES, RATING_LABELS } from '../clients/[id]/sites/[siteId]/inspections/inspection-labels';
import { FlaggedTabs } from './FlaggedTabs';

const PATH = '/flagged';

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[26px] border border-line bg-surface p-10 text-center shadow-sm">
      <svg className="h-8 w-8 text-ink-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18M3 4.5h13.5l-1.5 3 1.5 3H3" />
      </svg>
      <p className="text-sm text-ink-muted">{text}</p>
    </div>
  );
}

export default async function FlaggedPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [feedback, items] = await Promise.all([
    apiFetch<AdminFeedbackSubmission[]>('/admin/feedback?flagged=true'),
    apiFetch<FlaggedInspectionItem[]>('/inspections/items/flagged'),
  ]);

  const verifiedFeedbackMedia = feedback.flatMap((f) => f.media.filter((m) => m.url));
  const feedbackMediaIndexMap = new Map(verifiedFeedbackMedia.map((m, i) => [m.id, i]));
  const feedbackLightboxItems = verifiedFeedbackMedia.map((m) => {
    const parent = feedback.find((f) => f.media.some((fm) => fm.id === m.id))!;
    return {
      url: m.url!,
      label: m.originalFilename || (m.resourceType === 'IMAGE' ? 'Photo' : 'Video'),
      resourceType: m.resourceType,
      caption: `${parent.site.client.clientName} · ${parent.site.businessName}`,
    };
  });

  const verifiedItemMedia = items.flatMap((item) => item.media.filter((m) => m.url));
  const itemMediaIndexMap = new Map(verifiedItemMedia.map((m, i) => [m.id, i]));
  const itemLightboxItems = verifiedItemMedia.map((m) => {
    const parent = items.find((item) => item.media.some((im) => im.id === m.id))!;
    return {
      url: m.url!,
      label: m.originalFilename || (m.resourceType === 'IMAGE' ? 'Photo' : 'Video'),
      resourceType: m.resourceType,
      caption: `${parent.inspection.site.client.clientName} · ${parent.inspection.site.businessName} · ${parent.spaceName}`,
    };
  });

  const feedbackContent = (
    <>
      {feedback.length === 0 ? (
          <EmptyState text="No flagged feedback right now." />
        ) : (
          <MediaLightboxProvider items={feedbackLightboxItems}>
            <div className="overflow-hidden rounded-[26px] border border-line bg-surface shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-[13.5px]">
                  <thead className="border-b border-line text-[10.5px] font-extrabold uppercase tracking-wide text-ink-muted">
                    <tr>
                      <th className="whitespace-nowrap px-5.5 py-4">Client</th>
                      <th className="whitespace-nowrap px-5.5 py-4">Site</th>
                      <th className="px-5.5 py-4">Feedback</th>
                      <th className="whitespace-nowrap px-5.5 py-4">Attachments</th>
                      <th className="whitespace-nowrap px-5.5 py-4">Date</th>
                      <th className="whitespace-nowrap px-5.5 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedback.map((item) => (
                      <tr key={item.id} className="border-b border-line align-top last:border-0 hover:bg-ink/[0.03]">
                        <td className="px-5.5 py-3.5">
                          <Link prefetch={false} href={`/clients/${item.site.client.id}/sites/${item.site.id}/feedback`} className="font-bold hover:underline">
                            {item.site.client.clientName}
                          </Link>
                        </td>
                        <td className="px-5.5 py-3.5 font-semibold text-ink/80">{item.site.businessName}</td>
                        <td className="max-w-md px-5.5 py-3.5 font-semibold text-ink/80">
                          <TruncatedText text={item.feedback} lines={2} />
                        </td>
                        <td className="px-5.5 py-3.5">
                          <AttachmentsCell media={item.media} pathToRevalidate={PATH} mediaIndexMap={feedbackMediaIndexMap} />
                        </td>
                        <td className="whitespace-nowrap px-5.5 py-3.5 font-semibold tabular-nums text-ink/80">{formatDate(item.submittedAt)}</td>
                        <td className="px-5.5 py-3.5">
                          <FlagButton flagged={item.flagged} action={setFeedbackFlaggedAction.bind(null, item.id, false, PATH)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </MediaLightboxProvider>
        )}
    </>
  );

  const itemsContent = (
    <>
      {items.length === 0 ? (
          <EmptyState text="No flagged inspection items right now." />
        ) : (
          <MediaLightboxProvider items={itemLightboxItems}>
            <div className="overflow-hidden rounded-[26px] border border-line bg-surface shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-[13.5px]">
                  <thead className="border-b border-line text-[10.5px] font-extrabold uppercase tracking-wide text-ink-muted">
                    <tr>
                      <th className="whitespace-nowrap px-5.5 py-4">Client</th>
                      <th className="whitespace-nowrap px-5.5 py-4">Site</th>
                      <th className="whitespace-nowrap px-5.5 py-4">Space / Area</th>
                      <th className="whitespace-nowrap px-5.5 py-4">Rating</th>
                      <th className="px-5.5 py-4">Notes</th>
                      <th className="whitespace-nowrap px-5.5 py-4">Photos</th>
                      <th className="whitespace-nowrap px-5.5 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const basePath = `/clients/${item.inspection.site.client.id}/sites/${item.inspection.site.id}/inspections`;
                      const sitePath = item.inspection.status === 'COMPLETED' ? `${basePath}/${item.inspection.id}` : basePath;
                      return (
                        <tr key={item.id} className="border-b border-line align-top last:border-0 hover:bg-ink/[0.03]">
                          <td className="px-5.5 py-3.5">
                            <Link prefetch={false} href={sitePath} className="font-bold hover:underline">
                              {item.inspection.site.client.clientName}
                            </Link>
                          </td>
                          <td className="px-5.5 py-3.5 font-semibold text-ink/80">{item.inspection.site.businessName}</td>
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
                            {item.notes ? <TruncatedText text={item.notes} lines={2} className="break-all" /> : <span className="text-ink-muted/40">—</span>}
                          </td>
                          <td className="px-5.5 py-3.5">
                            <AttachmentsCell
                              media={item.media}
                              pathToRevalidate={PATH}
                              mediaIndexMap={itemMediaIndexMap}
                              deleteAction={deleteInspectionMediaAction}
                              deleteWarning="This permanently removes the file from Cloudinary storage - it cannot be recovered."
                            />
                          </td>
                          <td className="px-5.5 py-3.5">
                            <FlagButton flagged={item.flagged} action={setInspectionItemFlaggedAction.bind(null, item.id, false, PATH)} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </MediaLightboxProvider>
        )}
    </>
  );

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-balance">Flagged</h1>
          <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold text-page">{feedback.length + items.length}</span>
        </div>
        <p className="mt-1 text-[13.5px] text-ink-muted">Feedback and inspection items marked as needing attention.</p>
      </div>

      {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      <FlaggedTabs feedbackCount={feedback.length} itemsCount={items.length} feedbackContent={feedbackContent} itemsContent={itemsContent} />
    </div>
  );
}
