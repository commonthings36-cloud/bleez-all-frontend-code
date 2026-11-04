import axios from 'axios';
import { 
  detectPlatform, 
  getPublicPlans, 
  getUserSubscriptionStatus, 
  verifyAppleReceipt, 
  verifyGoogleReceipt, 
  restorePurchases 
} from '../../../services/iapService';

jest.mock('axios');

describe('Subscription Service & IAP Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should detect web runtime platform by default', () => {
    expect(detectPlatform()).toBe('web');
  });

  it('should fetch public subscription plans', async () => {
    const plansData = [
      { id: 'plan_free_v1', code: 'FREE', displayOrder: 1, pricingMatrix: { USD: { monthly: 0, yearly: 0 } } },
      { id: 'plan_explorer_v1', code: 'EXPLORER', displayOrder: 2, pricingMatrix: { USD: { monthly: 2.99, yearly: 29.99 } } }
    ];
    axios.get.mockResolvedValueOnce({ data: plansData });

    const plans = await getPublicPlans();
    expect(Array.isArray(plans)).toBe(true);
    expect(plans.length).toBe(2);
    expect(plans[0].code).toBe('FREE');
  });

  it('should fetch current user subscription status & entitlements', async () => {
    const userStatusData = {
      userId: 'usr_test',
      activePlan: 'EXPLORER',
      status: 'ACTIVE',
      entitlements: {
        planCode: 'EXPLORER',
        features: ['AI_ITINERARY_GENERATION', 'PDF_EXPORT'],
        limits: [{ limitCode: 'AI_GENERATIONS', limitValue: 100 }]
      },
      usage: [{ limitCode: 'AI_GENERATIONS', currentCount: 14, limitValue: 100, percentage: 14.0 }]
    };
    axios.get.mockResolvedValueOnce({ data: userStatusData });

    const status = await getUserSubscriptionStatus();
    expect(status.activePlan).toBe('EXPLORER');
    expect(status.status).toBe('ACTIVE');
    expect(status.entitlements.features).toContain('PDF_EXPORT');
  });

  it('should verify Apple StoreKit 2 transaction payload', async () => {
    const verifyData = { success: true, status: 'ACTIVE', planCode: 'EXPLORER' };
    axios.post.mockResolvedValueOnce({ data: verifyData });

    const res = await verifyAppleReceipt({
      productId: 'com.aitravelglobe.explorer.monthly',
      transactionId: '2000000123456789',
      originalTransactionId: '1000000987654321',
      receiptData: 'STOREKIT2_SIGNED_JWS_RECEIPT'
    });
    expect(res.success).toBe(true);
    expect(res.status).toBe('ACTIVE');
  });

  it('should verify Google Play Purchase token payload', async () => {
    const verifyData = { success: true, status: 'ACTIVE', planCode: 'EXPLORER' };
    axios.post.mockResolvedValueOnce({ data: verifyData });

    const res = await verifyGoogleReceipt({
      productId: 'explorer_subscription',
      purchaseToken: 'google_play_purchase_token_xyz',
      packageName: 'com.aitravelglobe.app'
    });
    expect(res.success).toBe(true);
    expect(res.status).toBe('ACTIVE');
  });

  it('should restore native purchases with backend', async () => {
    const restoreData = { success: true, message: 'Purchases restored successfully' };
    axios.post.mockResolvedValueOnce({ data: restoreData });

    const res = await restorePurchases('APPLE', ['2000000123456789']);
    expect(res.success).toBe(true);
    expect(res.message).toBe('Purchases restored successfully');
  });
});





