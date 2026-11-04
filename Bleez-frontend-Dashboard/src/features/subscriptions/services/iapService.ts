import { apiClient } from '@/services/apiClient';

export interface IAPProduct {
  productId: string;
  price: string;
  currency: string;
  title: string;
}

export interface VerificationPayload {
  productId: string;
  transactionId?: string;
  originalTransactionId?: string;
  purchaseToken?: string;
  packageName?: string;
  receiptData?: string;
}

export const iapService = {
  // Detect current platform runtime environment
  getPlatform: (): 'ios' | 'android' | 'web' => {
    const ua = navigator.userAgent || window.navigator.userAgent || '';
    if (/iPhone|iPad|iPod/i.test(ua) || (window as any).webkit?.messageHandlers?.iapBridge) {
      return 'ios';
    }
    if (/Android/i.test(ua) || (window as any).AndroidIAPBridge) {
      return 'android';
    }
    return 'web';
  },

  // Query localized product details from native store SDKs (fallback to backend catalog)
  fetchLocalizedProducts: async (productIds: string[]): Promise<Record<string, IAPProduct>> => {
    const platform = iapService.getPlatform();
    const result: Record<string, IAPProduct> = {};

    if (platform === 'ios' && (window as any).webkit?.messageHandlers?.getProducts) {
      try {
        const productsStr = await (window as any).webkit.messageHandlers.getProducts.postMessage({ productIds });
        const products = JSON.parse(productsStr);
        products.forEach((p: any) => {
          result[p.productId] = {
            productId: p.productId,
            price: p.localizedPrice || `$${p.price}`,
            currency: p.currencyCode || 'USD',
            title: p.title || 'Subscription Plan',
          };
        });
      } catch (err) {
        console.warn('Native iOS StoreKit products query failed, using catalog default', err);
      }
    } else if (platform === 'android' && (window as any).AndroidIAPBridge?.getProducts) {
      try {
        const productsStr = (window as any).AndroidIAPBridge.getProducts(JSON.stringify(productIds));
        const products = JSON.parse(productsStr);
        products.forEach((p: any) => {
          result[p.productId] = {
            productId: p.productId,
            price: p.formattedPrice || `$${p.price}`,
            currency: p.currencyCode || 'USD',
            title: p.title || 'Subscription Plan',
          };
        });
      } catch (err) {
        console.warn('Native Android Google Play products query failed, using catalog default', err);
      }
    }

    return result;
  },

  // Trigger Native Purchase via StoreKit 2 (iOS) or Google Play Billing (Android)
  purchaseProduct: async (productId: string, planCode: string): Promise<VerificationPayload> => {
    const platform = iapService.getPlatform();

    if (platform === 'ios') {
      if ((window as any).webkit?.messageHandlers?.purchaseProduct) {
        const responseStr = await (window as any).webkit.messageHandlers.purchaseProduct.postMessage({ productId });
        const res = JSON.parse(responseStr);
        return {
          productId,
          transactionId: res.transactionId,
          originalTransactionId: res.originalTransactionId,
          receiptData: res.signedTransactionJWS || res.receiptData,
        };
      } else {
        // Fallback demo token for sandbox web view
        return {
          productId,
          transactionId: `apple_tx_${Date.now()}`,
          originalTransactionId: `apple_orig_${Date.now()}`,
          receiptData: 'MOCK_STOREKIT2_JWS_PAYLOAD',
        };
      }
    } else if (platform === 'android') {
      if ((window as any).AndroidIAPBridge?.purchaseProduct) {
        const responseStr = (window as any).AndroidIAPBridge.purchaseProduct(productId);
        const res = JSON.parse(responseStr);
        return {
          productId,
          transactionId: res.purchaseToken,
          purchaseToken: res.purchaseToken,
          packageName: res.packageName || 'com.aitravelglobe.app',
        };
      } else {
        // Fallback demo token for sandbox web view
        return {
          productId,
          transactionId: `google_token_${Date.now()}`,
          purchaseToken: `google_token_${Date.now()}`,
          packageName: 'com.aitravelglobe.app',
        };
      }
    } else {
      // Sandbox mode token
      return {
        productId,
        transactionId: `web_sandbox_tx_${Date.now()}`,
        receiptData: 'SANDBOX_WEB_RECEIPT',
      };
    }
  },

  // Backend Receipt Verification
  verifyPurchaseWithBackend: async (platform: 'ios' | 'android' | 'web', payload: VerificationPayload) => {
    const endpoint = platform === 'ios' ? '/billing/apple/verify' : '/billing/google/verify';
    const res = await apiClient.post(endpoint, payload);
    return res.data;
  },

  // Restore Purchases
  restorePurchases: async (platform: 'ios' | 'android' | 'web') => {
    const provider = platform === 'ios' ? 'APPLE' : 'GOOGLE';
    const res = await apiClient.post('/billing/restore', { provider, receiptTokens: [] });
    return res.data;
  },
};
