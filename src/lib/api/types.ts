export type ClientSiteStatus = 'ACTIVE' | 'INACTIVE';

export interface Client {
  id: string;
  clientCode: string;
  name: string;
  contactEmail: string | null;
  contactPhone: string | null;
  status: ClientSiteStatus;
  clickupEntityId: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { sites: number };
}

export interface Site {
  id: string;
  clientId: string;
  siteCode: string;
  slug: string;
  siteName: string;
  address: string | null;
  status: ClientSiteStatus;
  clickupEntityId: string | null;
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
