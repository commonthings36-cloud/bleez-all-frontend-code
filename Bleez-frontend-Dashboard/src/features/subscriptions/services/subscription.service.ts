import { apiClient } from '@/services/apiClient';
import {
  SubscriptionPlan,
  FeatureRegistryItem,
  UsageMetricRegistryItem,
  UserSubscription,
  BillingTransaction,
  SubscriptionAnalytics,
  UserEntitlementSummary,
  UserUsageItem,
} from '../types/subscription.types';

export const subscriptionService = {
  // Admin Plan APIs
  getAllPlans: async (): Promise<SubscriptionPlan[]> => {
    const res = await apiClient.get('/admin/subscriptions/plans');
    return res.data;
  },

  createPlan: async (plan: SubscriptionPlan): Promise<SubscriptionPlan> => {
    const res = await apiClient.post('/admin/subscriptions/plans', plan);
    return res.data;
  },

  updatePlan: async (id: string, plan: SubscriptionPlan): Promise<SubscriptionPlan> => {
    const res = await apiClient.put(`/admin/subscriptions/plans/${id}`, plan);
    return res.data;
  },

  clonePlan: async (id: string, newCode?: string, newName?: string): Promise<SubscriptionPlan> => {
    const res = await apiClient.post(`/admin/subscriptions/plans/${id}/clone`, null, {
      params: { newCode, newName },
    });
    return res.data;
  },

  archivePlan: async (id: string): Promise<SubscriptionPlan> => {
    const res = await apiClient.post(`/admin/subscriptions/plans/${id}/archive`);
    return res.data;
  },

  // Feature Registry
  getAllFeatures: async (): Promise<FeatureRegistryItem[]> => {
    const res = await apiClient.get('/admin/subscriptions/features');
    return res.data;
  },

  registerFeature: async (item: FeatureRegistryItem): Promise<FeatureRegistryItem> => {
    const res = await apiClient.post('/admin/subscriptions/features', item);
    return res.data;
  },

  // Metric Registry
  getAllMetrics: async (): Promise<UsageMetricRegistryItem[]> => {
    const res = await apiClient.get('/admin/subscriptions/metrics');
    return res.data;
  },

  registerMetric: async (item: UsageMetricRegistryItem): Promise<UsageMetricRegistryItem> => {
    const res = await apiClient.post('/admin/subscriptions/metrics', item);
    return res.data;
  },

  // Subscribers & Transactions
  getAllSubscribers: async (): Promise<UserSubscription[]> => {
    const res = await apiClient.get('/admin/subscriptions/subscribers');
    return res.data;
  },

  getAllTransactions: async (): Promise<BillingTransaction[]> => {
    const res = await apiClient.get('/admin/subscriptions/transactions');
    return res.data;
  },

  getAnalytics: async (): Promise<SubscriptionAnalytics> => {
    const res = await apiClient.get('/admin/subscriptions/analytics');
    return res.data;
  },

  // Client/Consumer APIs
  getPublicPlans: async (): Promise<SubscriptionPlan[]> => {
    const res = await apiClient.get('/subscription/plans');
    return res.data;
  },

  getMyEntitlements: async (): Promise<UserEntitlementSummary> => {
    const res = await apiClient.get('/subscription/me');
    return res.data;
  },

  getMyUsage: async (): Promise<UserUsageItem[]> => {
    const res = await apiClient.get('/subscription/usage');
    return res.data;
  },

  verifyApplePurchase: async (payload: any): Promise<any> => {
    const res = await apiClient.post('/billing/apple/verify', payload);
    return res.data;
  },

  verifyGooglePurchase: async (payload: any): Promise<any> => {
    const res = await apiClient.post('/billing/google/verify', payload);
    return res.data;
  },
};
