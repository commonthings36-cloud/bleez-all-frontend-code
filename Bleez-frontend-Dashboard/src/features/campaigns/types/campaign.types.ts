export interface CampaignMetrics {
  targetCount: number;
  queuedCount: number;
  deliveredCount: number;
  impressionCount: number;
  clickCount: number;
  conversionCount: number;
  attributedRevenue: number;
}

export interface PlatformContent {
  placement: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  couponCode?: string;
}

export interface CampaignContent {
  web?: PlatformContent;
  mobile?: PlatformContent;
  b2bPortal?: PlatformContent;
  dynamicVariables?: Record<string, any>;
}

export interface ScheduleConfig {
  startDate: string;
  endDate?: string;
  timezone?: string;
  sendTime?: string;
}

export interface FrequencyLimits {
  maxPerCustomerPerDay: number;
  maxPerCustomerPerWeek: number;
}

export interface AudienceCondition {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'CONTAINS' | 'WITHIN_LAST_DAYS';
  value: any;
}

export interface AudienceRule {
  operator: 'AND' | 'OR';
  conditions: AudienceCondition[];
}

export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  picture?: string;
  country?: string;
}

export interface AudienceEstimate {
  totalUsers: number;
  estimatedAudienceSize: number;
  percentageOfTotal: number;
  audienceScope: string;
}

export interface Campaign {
  id: string;
  name: string;
  paradigm: 'STATIC' | 'DYNAMIC';
  audienceScope: 'INDIVIDUAL_APP_USER' | 'MULTI_USER_BATCH' | 'DYNAMIC_SEGMENT' | 'B2B_ENTERPRISE_ACCOUNT' | 'MASS_SEGMENT_AUDIENCE';
  targetUserId?: string;
  targetUserIds?: string[];
  targetCorporateAccountId?: string;
  audienceRule?: AudienceRule;
  type: 'ADMIN_CREATED' | 'AI_RECOMMENDED' | 'EVENT_TRIGGERED' | 'JOURNEY';
  status: 'DRAFT' | 'SUBMITTED' | 'PENDING_APPROVAL' | 'APPROVED' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'REJECTED' | 'ARCHIVED';
  objective: string;
  priority: number;
  creatorUserId?: string;
  creatorUserRole?: string;
  approverUserId?: string;
  approvalTimestamp?: string;
  rejectionReason?: string;
  content?: CampaignContent;
  schedule?: ScheduleConfig;
  frequencyLimits?: FrequencyLimits;
  metrics?: CampaignMetrics;
  createdAt?: string;
  updatedAt?: string;
}

export interface CampaignOpportunity {
  id: string;
  title: string;
  status: 'DETECTED' | 'RECOMMENDED' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED' | 'CONVERTED_TO_CAMPAIGN' | 'EXPIRED';
  detectedPattern: string;
  targetDestination?: string;
  audienceScope: string;
  targetUserId?: string;
  estimatedAudienceSize: number;
  confidenceScore: number;
  rationale: string;
  recommendedContent?: {
    title: string;
    subtitle: string;
    ctaText: string;
    recommendedChannel: string;
  };
  convertedCampaignId?: string;
  detectedAt: string;
}

export interface CampaignAnalytics {
  campaignId: string;
  campaignName: string;
  status: string;
  targetCount: number;
  deliveredCount: number;
  impressionCount: number;
  clickCount: number;
  conversionCount: number;
  attributedRevenue: number;
  ctrPercent: number;
  conversionRatePercent: number;
  funnel: {
    target: number;
    delivered: number;
    views: number;
    clicks: number;
    conversions: number;
  };
}
