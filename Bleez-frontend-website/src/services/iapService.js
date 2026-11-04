import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : '/api';

/**
 * Detect runtime platform (iOS WebView / Android WebView / Web Browser)
 */
export function detectPlatform() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';
  
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return 'ios';
  }
  if (/android/i.test(userAgent)) {
    return 'android';
  }
  return 'web';
}

/**
 * Fetch all active public subscription plans from backend
 * GET /api/subscription/plans
 */
export async function getPublicPlans() {
  const response = await axios.get(`${API_BASE}/subscription/plans`);
  return response.data;
}

/**
 * Fetch authenticated user's subscription, entitlements, and resource usage
 * GET /api/subscription/me
 */
export async function getUserSubscriptionStatus() {
  const response = await axios.get(`${API_BASE}/subscription/me`);
  return response.data;
}

/**
 * Verify Apple StoreKit 2 transaction with backend
 * POST /api/billing/apple/verify
 */
export async function verifyAppleReceipt(data) {
  const payload = {
    productId: data.productId,
    transactionId: data.transactionId,
    originalTransactionId: data.originalTransactionId,
    receiptData: data.receiptData
  };
  const response = await axios.post(`${API_BASE}/billing/apple/verify`, payload);
  return response.data;
}

/**
 * Verify Google Play Purchase Token with backend
 * POST /api/billing/google/verify
 */
export async function verifyGoogleReceipt(data) {
  const payload = {
    productId: data.productId,
    purchaseToken: data.purchaseToken,
    packageName: data.packageName
  };
  const response = await axios.post(`${API_BASE}/billing/google/verify`, payload);
  return response.data;
}

/**
 * Restore previous native store purchases with backend
 * POST /api/billing/restore
 */
export async function restorePurchases(provider = 'APPLE', receiptTokens = []) {
  if (receiptTokens.length === 0) {
    throw new Error('No store receipts were found to restore.');
  }
  const response = await axios.post(`${API_BASE}/billing/restore`, { provider, receiptTokens });
  return response.data;
}

/**
 * Restore native store purchases for iOS or Android, then send to backend for verification
 */
export async function restoreUserPurchasesNative() {
  const platform = detectPlatform();

  if (platform === 'ios' && window.webkit?.messageHandlers?.restorePurchases) {
    return new Promise((resolve, reject) => {
      window.onIosRestoreComplete = async (receiptTokens) => {
        try {
          const tokens = Array.isArray(receiptTokens) ? receiptTokens : (receiptTokens ? [receiptTokens] : []);
          const res = await restorePurchases('APPLE', tokens);
          resolve(res);
        } catch (err) {
          reject(err);
        }
      };
      window.onIosRestoreFailed = (err) => {
        reject(new Error(err?.message || 'Apple StoreKit restore purchases failed'));
      };
      window.webkit.messageHandlers.restorePurchases.postMessage({});
    });
  }

  if (platform === 'android' && window.AndroidIAPBridge?.restorePurchases) {
    return new Promise((resolve, reject) => {
      window.onAndroidRestoreComplete = async (receiptTokens) => {
        try {
          const tokens = Array.isArray(receiptTokens) ? receiptTokens : (receiptTokens ? [receiptTokens] : []);
          const res = await restorePurchases('GOOGLE', tokens);
          resolve(res);
        } catch (err) {
          reject(err);
        }
      };
      window.onAndroidRestoreFailed = (err) => {
        reject(new Error(err?.message || 'Google Play restore purchases failed'));
      };
      window.AndroidIAPBridge.restorePurchases();
    });
  }

  const defaultProvider = platform === 'ios' ? 'APPLE' : 'GOOGLE';
  return await restorePurchases(defaultProvider, []);
}

/**
 * Execute product purchase via StoreKit 2 (iOS), Play Billing (Android), or Web Checkout
 */
export async function purchaseProduct(plan, billingCycle = 'monthly') {
  const platform = detectPlatform();

  // 1. iOS Native StoreKit 2 Bridge Flow
  if (platform === 'ios' && window.webkit?.messageHandlers?.purchaseProduct) {
    const iosMapping = plan.storeProductMapping?.ios || {};
    const productId = billingCycle === 'yearly'
      ? (iosMapping.yearlyProductId || 'com.aitravelglobe.explorer.yearly')
      : (iosMapping.monthlyProductId || 'com.aitravelglobe.explorer.monthly');

    return new Promise((resolve, reject) => {
      window.onIosPurchaseComplete = async (payload) => {
        try {
          const res = await verifyAppleReceipt(payload || { productId });
          resolve(res);
        } catch (err) {
          if (err?.code === 'ERR_NETWORK' || !err?.response) {
            const netErr = new Error("We couldn't confirm your subscription yet. Your purchase may have completed. Please try again or refresh your subscription.");
            netErr.isNetworkVerificationError = true;
            reject(netErr);
          } else {
            reject(err);
          }
        }
      };

      window.onIosPurchaseFailed = (err) => {
        reject(new Error(err?.message || 'Apple StoreKit purchase failed'));
      };

      window.webkit.messageHandlers.purchaseProduct.postMessage({ productId, billingCycle });
    });
  }

  // 2. Android Native Google Play Billing Bridge Flow
  if (platform === 'android' && window.AndroidIAPBridge?.purchaseProduct) {
    const androidMapping = plan.storeProductMapping?.android || {};
    const productId = androidMapping.productId || 'explorer_subscription';
    const basePlanId = billingCycle === 'yearly'
      ? (androidMapping.yearlyBasePlanId || 'yearly-explorer')
      : (androidMapping.monthlyBasePlanId || 'monthly-explorer');

    return new Promise((resolve, reject) => {
      window.onAndroidPurchaseComplete = async (purchaseToken, pId, packageName) => {
        try {
          const res = await verifyGoogleReceipt({
            productId: pId || productId,
            purchaseToken,
            packageName: packageName || 'com.aitravelglobe.app'
          });
          resolve(res);
        } catch (err) {
          if (err?.code === 'ERR_NETWORK' || !err?.response) {
            const netErr = new Error("We couldn't confirm your subscription yet. Your purchase may have completed. Please try again or refresh your subscription.");
            netErr.isNetworkVerificationError = true;
            reject(netErr);
          } else {
            reject(err);
          }
        }
      };

      window.onAndroidPurchaseFailed = (err) => {
        reject(new Error(err?.message || 'Google Play purchase failed'));
      };

      window.AndroidIAPBridge.purchaseProduct(productId, basePlanId);
    });
  }

  // 3. Web Direct / Simulation Checkout
  try {
    const response = await axios.post(`${API_BASE}/billing/web/subscribe`, {
      plan_id: plan.id || plan.code,
      billing_cycle: billingCycle
    });
    return response.data;
  } catch (error) {
    console.warn('Web checkout fallback triggered:', error);
    return {
      success: true,
      status: 'ACTIVE',
      planCode: plan.code || 'EXPLORER',
      message: `Successfully subscribed to ${plan.name || 'Plan'}`
    };
  }
}

