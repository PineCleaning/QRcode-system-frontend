export type ClientSiteStatus = 'ACTIVE' | 'INACTIVE';

export interface Client {
  id: string;
  clientId: string;
  clientName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  status: ClientSiteStatus;
  clickupEntityId: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { sites: number };
}

/** Shape returned by GET /clients?page=&pageSize= - the unpaginated Client[] shape stays for callers that never send those params. */
export interface PaginatedClients {
  data: Client[];
  total: number;
  page: number;
  pageSize: number;
  activeCount: number;
  inactiveCount: number;
  totalSites: number;
  multiSiteCount: number;
}

export interface Site {
  id: string;
  clientCode: string;
  siteCode: string;
  slug: string;
  businessName: string;
  address: string | null;
  status: ClientSiteStatus;
  clickupEntityId: string | null;
  /** Full public feedback form URL for this site - server-computed from BASE_DOMAIN, same value baked into the generated QR image. */
  feedbackUrl: string;
  createdAt: string;
  updatedAt: string;
}

export type FeedbackStatus = 'DRAFT' | 'SUBMITTED' | 'DELIVERY_PENDING' | 'DELIVERED' | 'DELIVERY_FAILED';
export type MediaResourceType = 'IMAGE' | 'VIDEO';
export type MediaStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface FeedbackMedia {
  id: string;
  feedbackId: string;
  cloudinaryPublicId: string;
  resourceType: MediaResourceType;
  originalFilename: string | null;
  mimeType: string;
  sizeBytes: number;
  status: MediaStatus;
  createdAt: string;
  url: string | null;
}

export interface FeedbackSubmission {
  id: string;
  siteId: string;
  idempotencyKey: string;
  feedback: string;
  mobileNumber: string | null;
  status: FeedbackStatus;
  clickupTaskId: string | null;
  submittedAt: string;
  deliveredAt: string | null;
  media: FeedbackMedia[];
}

/** Global feedback list (admin "Feedbacks" page) - each row also carries its site + client. */
export interface AdminFeedbackSubmission extends FeedbackSubmission {
  site: Pick<Site, 'id' | 'businessName' | 'slug'> & { client: Pick<Client, 'id' | 'clientName' | 'clientId'> };
}

/** Shape returned by GET /admin/feedback?page=&pageSize= - the unpaginated array shape stays for callers that never send those params. */
export interface PaginatedFeedback {
  data: AdminFeedbackSubmission[];
  total: number;
  page: number;
  pageSize: number;
}

/** Shape returned by GET /clients/:id/sites?page=&pageSize= - the unpaginated Site[] shape stays for the Feedback/Assets filter dropdowns. */
export interface PaginatedSites {
  data: Site[];
  total: number;
  page: number;
  pageSize: number;
}

/** Global media library (admin "Assets" page) - VERIFIED-only, so url is never null here. */
export interface AdminMediaItem extends Omit<FeedbackMedia, 'url'> {
  url: string;
  feedback: { id: string; site: Pick<Site, 'id' | 'businessName' | 'slug'> & { client: Pick<Client, 'id' | 'clientName' | 'clientId'> } };
}

/** GET /admin/media/storage-usage - Cloudinary account usage, for the Assets page's storage widget. */
export interface CloudinaryUsage {
  plan: string;
  storageUsedBytes: number;
  storageLimitBytes: number;
  creditsUsedPercent: number;
  breakdown: {
    storageCredits: number;
    bandwidthCredits: number;
    bandwidthBytes: number;
    transformationsCredits: number;
    transformationsCount: number;
  };
  totalCreditsUsed: number;
  totalCreditsLimit: number;
}

export type CsvBatchStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type CsvRowStatus = 'SUCCESS' | 'ERROR';

export interface CsvImportBatch {
  id: string;
  filename: string;
  status: CsvBatchStatus;
  totalRows: number;
  successCount: number;
  errorCount: number;
  createdAt: string;
}

export interface CsvImportRow {
  id: string;
  batchId: string;
  rowNumber: number;
  clientCode: string | null;
  siteId: string | null;
  status: CsvRowStatus;
  errorMessage: string | null;
  createdAt: string;
}

export interface CsvImportResult {
  batch: CsvImportBatch;
  rows: CsvImportRow[];
}
