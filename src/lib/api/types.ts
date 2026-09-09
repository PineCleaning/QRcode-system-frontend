export type ClientSiteStatus = 'ACTIVE' | 'INACTIVE';

export interface Client {
  id: string;
  clientId: string;
  clientName: string;
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
  site: Pick<Site, 'id' | 'businessName' | 'address' | 'slug'> & { client: Pick<Client, 'id' | 'clientName' | 'clientId'> };
}

/** Shape returned by GET /admin/feedback?page=&pageSize= - the unpaginated array shape stays for callers that never send those params. */
export interface PaginatedFeedback {
  data: AdminFeedbackSubmission[];
  total: number;
  page: number;
  pageSize: number;
}

/** Shape returned by GET /clients/:id/sites?page=&pageSize= - the unpaginated Site[] shape stays for the Feedback/Media filter dropdowns. */
export interface PaginatedSites {
  data: Site[];
  total: number;
  page: number;
  pageSize: number;
}

/** Global media library (admin "Media" page) - VERIFIED-only, so url is never null here. */
export interface AdminMediaItem extends Omit<FeedbackMedia, 'url'> {
  url: string;
  feedback: { id: string; site: Pick<Site, 'id' | 'businessName' | 'slug'> & { client: Pick<Client, 'id' | 'clientName' | 'clientId'> } };
}

/** GET /admin/media/storage-usage - Cloudinary account usage, for the Media page's storage widget. */
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

export type ClickupConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'RECONNECT_REQUIRED';

export interface ClickupStatus {
  connected: boolean;
  /** True when a previously-CONNECTED connection got an auth-class failure (token revoked/regenerated in ClickUp) and needs an admin to paste a fresh one. */
  needsReconnect: boolean;
  workspaceId?: string;
  workspaceName?: string | null;
  status?: ClickupConnectionStatus;
  lastErrorMessage?: string | null;
  disconnectedAt?: string | null;
  /** Whether RAILWAY_API_TOKEN/PROJECT_ID/ENVIRONMENT_ID/SERVICE_ID are all set backend-side - if false, reconnecting here still fixes ClickUp instantly but won't also update Railway's copy of the token. */
  railwaySyncConfigured?: boolean;
  configured?: boolean;
}

export type AdminRole = 'ADMIN' | 'SUPERVISOR';
export type AdminStatus = 'ACTIVE' | 'INACTIVE';

export interface AdminUserRecord {
  id: string;
  email: string;
  fullName: string | null;
  role: AdminRole;
  status: AdminStatus;
  createdAt: string;
  lastLoginAt: string | null;
}

/** Only returned once, from POST /admin-users - the system-generated password, never retrievable again after this response. */
export interface CreatedAdminUser extends AdminUserRecord {
  temporaryPassword: string;
}

export type InventoryStatus = 'IN_STOCK' | 'LOW_STOCK' | 'URGENT_LOW_STOCK' | 'OUT_OF_STOCK' | 'GOOD' | 'NEEDS_REPAIR' | 'OUT_OF_SERVICE';
export type InventoryCategory =
  | 'CHEMICAL'
  | 'PPE'
  | 'CONSUMABLES'
  | 'CLEANING_TOOLS_MANUAL'
  | 'POWERED_EQUIPMENT_MACHINERY'
  | 'SPARE_PARTS'
  | 'OTHER';

export interface InventoryItem {
  id: string;
  siteId: string;
  item: string;
  category: InventoryCategory;
  status: InventoryStatus;
  quantity: number;
  lastSupplyDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryHistoryEntry {
  id: string;
  inventoryItemId: string;
  previousQuantity: number;
  previousStatus: InventoryStatus;
  previousNotes: string | null;
  changedAt: string;
}

export type InspectionRating = 'EXCELLENT' | 'ABOVE_AVERAGE' | 'AVERAGE' | 'BELOW_AVERAGE' | 'VERY_POOR';

export type InspectionSessionStatus = 'OPEN' | 'COMPLETED';

export interface InspectionItemMedia {
  id: string;
  inspectionItemId: string;
  cloudinaryPublicId: string;
  resourceType: 'IMAGE' | 'VIDEO';
  originalFilename: string | null;
  mimeType: string;
  sizeBytes: number;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  uploadedAt: string;
  /** Derived server-side at read time, never stored - null when status isn't VERIFIED. */
  url: string | null;
  /** Only populated in the response immediately after this file was submitted - not persisted. */
  rejectionReason: string | null;
}

export interface InspectionItem {
  id: string;
  inspectionId: string;
  spaceName: string;
  isNotApplicable: boolean;
  rating: InspectionRating | null;
  percentage: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  media: InspectionItemMedia[];
}

export interface SiteInspection {
  id: string;
  siteId: string;
  status: InspectionSessionStatus;
  averageScore: number | null;
  meetsStandard: boolean | null;
  startedAt: string;
  completedAt: string | null;
  items: InspectionItem[];
}

/** Shape returned by GET /sites/:siteId/inspections/completed - a lightweight summary (no items/media) for the "Past Inspections" list. */
export interface CompletedInspectionSummary {
  id: string;
  siteId: string;
  status: InspectionSessionStatus;
  averageScore: number | null;
  meetsStandard: boolean | null;
  startedAt: string;
  completedAt: string | null;
  itemCount: number;
}
