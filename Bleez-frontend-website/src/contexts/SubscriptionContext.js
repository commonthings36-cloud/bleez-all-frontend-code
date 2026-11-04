import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  getPublicPlans, 
  getUserSubscriptionStatus, 
  purchaseProduct, 
  restorePurchases,
  restoreUserPurchasesNative
} from '../services/iapService';

const SubscriptionContext = createContext(null);

export const SubscriptionProvider = ({ children }) => {
  const { user } = useAuth();
  
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  
  // IDLE | PURCHASING | PURCHASE_RECEIVED | VERIFYING | VERIFIED | FAILED | CANCELLED
  const [purchaseStatus, setPurchaseStatus] = useState('IDLE');
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  /**
   * Fetch active public subscription plans
   */
  const fetchPlans = useCallback(async () => {
    setPlansLoading(true);
    try {
      const data = await getPublicPlans();
      const planList = Array.isArray(data) ? data : [];
      // Sort plans by displayOrder if present
      planList.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setPlans(planList);
    } catch (err) {
      console.error('SubscriptionContext: Failed to fetch plans:', err);
      setError('Failed to load subscription plans');
    } finally {
      setPlansLoading(false);
    }
  }, []);

  /**
   * Fetch authenticated user's subscription and entitlement status
   */
  const fetchCurrentSubscription = useCallback(async () => {
    if (!user) {
      setCurrentSubscription(null);
      return;
    }
    setSubscriptionLoading(true);
    try {
      const data = await getUserSubscriptionStatus();
      setCurrentSubscription(data);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      console.error('SubscriptionContext: Failed to fetch subscription status:', err);
      setError('Failed to load subscription status');
    } finally {
      setSubscriptionLoading(false);
    }
  }, [user]);

  /**
   * Initialize plans and user subscription on mount or user change
   */
  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([fetchPlans(), fetchCurrentSubscription()]);
      setLoading(false);
    }
    init();
  }, [fetchPlans, fetchCurrentSubscription]);

  /**
   * Entitlement Helper: Check if feature is enabled for current user
   */
  const hasFeature = useCallback((featureCode) => {
    if (!currentSubscription || !currentSubscription.entitlements) return false;
    const features = currentSubscription.entitlements.features || [];
    if (Array.isArray(features)) {
      return features.some(f => {
        if (typeof f === 'string') return f === featureCode;
        return f?.featureCode === featureCode && f?.enabled !== false;
      });
    }
    return false;
  }, [currentSubscription]);

  /**
   * Entitlement Helper: Get usage data for a specific limit code
   */
  const getUsage = useCallback((limitCode) => {
    if (!currentSubscription) return null;
    const usageList = currentSubscription.usage || [];
    if (Array.isArray(usageList)) {
      const found = usageList.find(u => u.limitCode === limitCode);
      if (found) {
        return {
          currentCount: found.currentCount ?? 0,
          limitValue: found.limitValue ?? 0,
          percentage: found.percentage ?? 0,
          periodKey: found.periodKey || ''
        };
      }
    }
    return null;
  }, [currentSubscription]);

  /**
   * Entitlement Helper: Check if user has active subscription
   */
  const isSubscriptionActive = useCallback(() => {
    return currentSubscription?.status === 'ACTIVE';
  }, [currentSubscription]);

  /**
   * Entitlement Helper: Check if plan matches user's active plan code
   */
  const isCurrentPlan = useCallback((planCode) => {
    if (!currentSubscription) return planCode === 'FREE' || planCode === 'plan_free_v1';
    return currentSubscription.activePlan === planCode || currentSubscription.entitlements?.planCode === planCode;
  }, [currentSubscription]);

  /**
   * Entitlement Helper: Check if feature can be used (enabled AND within usage limit)
   */
  const canUseFeature = useCallback((featureCode, limitCode = null) => {
    if (!hasFeature(featureCode)) return false;
    if (limitCode) {
      const usage = getUsage(limitCode);
      if (usage && usage.limitValue > 0 && usage.currentCount >= usage.limitValue) {
        return false; // Limit reached
      }
    }
    return true;
  }, [hasFeature, getUsage]);

  /**
   * Action: Purchase plan with Store / Web bridge verification
   */
  const purchasePlan = async (plan, billingCycle = 'monthly') => {
    if (purchaseLoading) return null;

    setPurchaseLoading(true);
    setPurchaseStatus('PURCHASING');
    setError(null);

    try {
      setPurchaseStatus('PURCHASE_RECEIVED');
      setPurchaseStatus('VERIFYING');

      const result = await purchaseProduct(plan, billingCycle);

      if (result?.success || result?.status === 'ACTIVE') {
        setPurchaseStatus('VERIFIED');
        await fetchCurrentSubscription();
        return result;
      } else {
        setPurchaseStatus('FAILED');
        setError(result?.message || 'Verification failed');
        throw new Error(result?.message || 'Verification failed');
      }
    } catch (err) {
      if (err?.message?.includes('cancel') || err?.code === 'USER_CANCELLED') {
        setPurchaseStatus('CANCELLED');
      } else {
        setPurchaseStatus('FAILED');
        setError(err?.message || 'Purchase process failed');
      }
      throw err;
    } finally {
      setPurchaseLoading(false);
    }
  };

  /**
   * Action: Restore native purchases
   */
  const restoreUserPurchases = async () => {
    if (restoreLoading) return null;
    setRestoreLoading(true);
    setError(null);
    try {
      const result = await restoreUserPurchasesNative();
      await fetchCurrentSubscription();
      return result;
    } catch (err) {
      console.error('Restore purchases failed:', err);
      setError(err?.message || 'Restore purchases failed');
      throw err;
    } finally {
      setRestoreLoading(false);
    }
  };

  const value = {
    plans,
    currentSubscription,
    loading,
    plansLoading,
    subscriptionLoading,
    purchaseLoading,
    restoreLoading,
    purchaseStatus,
    error,
    lastUpdated,
    fetchPlans,
    fetchCurrentSubscription,
    hasFeature,
    getUsage,
    isSubscriptionActive,
    isCurrentPlan,
    canUseFeature,
    purchasePlan,
    restoreUserPurchases
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptionContext = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscriptionContext must be used within SubscriptionProvider');
  }
  return context;
};

export default SubscriptionContext;
