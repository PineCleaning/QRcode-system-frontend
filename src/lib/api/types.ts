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
