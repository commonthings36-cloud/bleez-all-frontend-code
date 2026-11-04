export interface PriceDetail {
  monthly: number;
  yearly: number;
  trialDays?: number;
  introductoryPrice?: number;
  introductoryDurationMonths?: number;
}

export interface IosStoreProduct {
  monthlyProductId?: string;
  yearlyProductId?: string;
  isValidated?: boolean;
  lastValidatedAt?: string;
}

export interface AndroidStoreProduct {
  productId?: string;
  monthlyBasePlanId?: string;
  yearlyBasePlanId?: string;
  isValidated?: boolean;
  lastValidatedAt?: string;
}

export interface StoreProductMapping {
  ios?: IosStoreProduct;
  android?: AndroidStoreProduct;
}

export interface PlanFeature {
  featureCode: string;
  enabled: boolean;
  highlightText?: string;
}

export interface PlanUsageLimit {
  limitCode: string;
  limitValue?: number;
  period: 'LIFETIME' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'UNLIMITED';
  isUnlimited: boolean;
  rolloverMax?: number;
}

export interface SubscriptionPlan {
  id?: string;
  code: string;
  version?: number;
  name: string;
  tagline?: string;
  description?: string;
  audience: 'CONSUMER' | 'B2B' | 'PARTNER' | 'AGENCY' | 'PROMOTIONAL' | 'CUSTOM';
  planType: 'FREE_TIER' | 'PAID_RECURRING' | 'ONE_TIME' | 'PROMOTIONAL';
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  displayOrder?: number;
  popularFlag?: boolean;
  recommendedFlag?: boolean;
  visibility: 'PUBLIC' | 'UNLISTED' | 'PRIVATE' | 'INVITATION_ONLY';
  targetCountries?: string[];
  minAppVersion?: string;
  badgeText?: string;
  themeGradient?: string;
  pricingMatrix?: Record<string, PriceDetail>;
  storeProductMapping?: StoreProductMapping;
  features?: PlanFeature[];
  usageLimits?: PlanUsageLimit[];
  marketingBullets?: string[];
  defaultWatermarkRuleId?: string;
  migrationPolicy?: 'GRANDFATHER_EXISTING' | 'MIGRATE_ON_RENEWAL';
  createdAt?: string;
  updatedAt?: string;
}

export interface FeatureRegistryItem {
  id?: string;
  code: string;
  name: string;
  description?: string;
  category: 'CORE_GENERATION' | 'EXPORT_OUTPUT' | 'BRANDING_DESIGN' | 'B2B_COLLABORATION' | 'TRAVEL_INTELLIGENCE';
  defaultValue: boolean;
  clientVisible: boolean;
  createdAt?: string;
}

export interface UsageMetricRegistryItem {
  id?: string;
  code: string;
  name: string;
  description?: string;
  unit: string;
  defaultPeriod: string;
  overagePolicy: 'HARD_BLOCK' | 'SOFT_WARNING' | 'OVERAGE_FEE';
  supportsRollover: boolean;
  createdAt?: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  organizationId?: string;
  planId?: string;
  planCode: string;
  planVersion?: number;
  status: 'TRIALING' | 'ACTIVE' | 'GRACE_PERIOD' | 'BILLING_RETRY' | 'CANCELLED' | 'EXPIRED' | 'REVOKED';
  platform?: string;
  store?: string;
  productId?: string;
  originalTransactionId?: string;
  isAutoRenewing?: boolean;
  currentPeriodStartsAt?: string;
  currentPeriodEndsAt?: string;
  createdAt?: string;
}

export interface BillingTransaction {
  id: string;
  userId: string;
  subscriptionId?: string;
  platform?: string;
  provider: string;
  transactionId: string;
  productId?: string;
  amount?: number;
  currency?: string;
  transactionType: string;
  status: string;
  verifiedAt?: string;
  createdAt?: string;
}

export interface SubscriptionAnalytics {
  activeSubscribers: number;
  explorerSubscribers: number;
  businessSubscribers: number;
  freeUsers: number;
  estimatedMRR: number;
  currency: string;
}

export interface UserEntitlementSummary {
  userId: string;
  planCode: string;
  planName: string;
  status: string;
  expiresAt?: string;
  features: string[];
  limits: PlanUsageLimit[];
}

export interface UserUsageItem {
  limitCode: string;
  period: string;
  periodKey: string;
  used: number;
  max: number;
  isUnlimited: boolean;
  percentageUsed: number;
  remaining: number;
}
