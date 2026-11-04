export interface OrgMember {
  userId: string;
  email: string;
  name: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  joinedAt?: string;
}

export interface OrgBranding {
  companyName?: string;
  logoUrl?: string;
  primaryColorHex?: string;
  secondaryColorHex?: string;
  headerText?: string;
  footerText?: string;
  websiteUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface OrgAiConfig {
  customInstructions?: string;
  preferredHotelChains?: string[];
  itineraryStyle?: string;
  customSections?: string[];
  tone?: string;
}

export interface B2bOrganization {
  id?: string;
  name: string;
  slug?: string;
  ownerUserId?: string;
  activeSubscriptionId?: string;
  members?: OrgMember[];
  branding?: OrgBranding;
  aiConfig?: OrgAiConfig;
  createdAt?: string;
  updatedAt?: string;
}
