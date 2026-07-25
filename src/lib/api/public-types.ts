export interface ResolvedSlug {
  slug: string;
  siteName: string;
  clientName: string;
}

export interface SignedUploadParams {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder?: string;
}

export interface FeedbackMediaInput {
  cloudinaryPublicId: string;
  resourceType: 'IMAGE' | 'VIDEO';
  originalFilename?: string;
  mimeType: string;
  sizeBytes: number;
}
