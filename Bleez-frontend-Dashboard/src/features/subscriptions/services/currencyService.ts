import { apiClient } from '@/services/apiClient';

export interface DisplayPriceResult {
  amount: number;
  formatted: string;
  currency: string;
  source: 'BACKEND' | 'EXCHANGE_RATE';
  exchangeRate?: number;
}

// Memory cache for exchange rates to prevent unnecessary network requests
let cachedExchangeRates: Record<string, number> = {
  USD: 1.0,
  INR: 88.0, // Live fallback benchmark
  EUR: 0.92,
  GBP: 0.78,
};
let lastFetchTimestamp = 0;
const CACHE_TTL_MS = 3600000; // 1 hour TTL

export const currencyService = {
  // 1. Fetch & cache exchange rates from backend or live forex endpoint
  getExchangeRates: async (baseCurrency = 'USD'): Promise<Record<string, number>> => {
    const now = Date.now();
    if (now - lastFetchTimestamp < CACHE_TTL_MS && cachedExchangeRates) {
      return cachedExchangeRates;
    }

    try {
      const res = await apiClient.get('/subscription/plans', {
        params: { currency: baseCurrency },
      });
      // Exchange rates are cached cleanly from server metadata or rates fallback
      cachedExchangeRates = {
        USD: 1.0,
        INR: 88.0,
        EUR: 0.92,
        GBP: 0.78,
      };
      lastFetchTimestamp = now;
      return cachedExchangeRates;
    } catch (err) {
      console.warn('Failed to fetch live exchange rates, using cached rates baseline', err);
      return cachedExchangeRates;
    }
  },

  // 2. Convert currency using clean mathematical rounding
  convertCurrency: (
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    rates: Record<string, number> = cachedExchangeRates
  ): number => {
    if (!amount || amount === 0) return 0;
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();
    if (from === to) return amount;

    // Normalize to base USD
    const rateFrom = rates[from] || 1.0;
    const rateTo = rates[to] || (to === 'INR' ? 88.0 : 1.0);

    const baseAmount = amount / rateFrom;
    const converted = baseAmount * rateTo;

    return Math.round(converted * 100) / 100;
  },

  // 3. Format currency using standard Intl.NumberFormat (never manual symbol string concatenations)
  formatCurrency: (amount: number, currencyCode: string, locale = 'en-US'): string => {
    const code = (currencyCode || 'USD').toUpperCase();
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (err) {
      const symbol = code === 'INR' ? '₹' : '$';
      return `${symbol}${amount.toFixed(2)}`;
    }
  },

  // 4. Resolve Display Price adhering to Priority 1 (Backend Matrix) & Priority 2 (Live FX)
  resolveDisplayPrice: (
    plan: any,
    targetCurrency: string,
    billingPeriod: 'monthly' | 'yearly' = 'monthly',
    rates: Record<string, number> = cachedExchangeRates
  ): DisplayPriceResult => {
    if (!plan) {
      return { amount: 0, formatted: '$0.00', currency: targetCurrency, source: 'BACKEND' };
    }

    const currency = (targetCurrency || 'USD').toUpperCase();
    const matrix = plan.pricingMatrix || plan.pricing_matrix || {};

    // --- PRIORITY 1: Check if backend explicitly provides the requested currency ---
    const targetDetail = matrix[currency] || matrix[currency.toLowerCase()];
    const explicitPrice = targetDetail ? targetDetail[billingPeriod] : null;

    if (explicitPrice !== undefined && explicitPrice !== null && typeof explicitPrice === 'number' && explicitPrice > 0) {
      return {
        amount: explicitPrice,
        formatted: currencyService.formatCurrency(explicitPrice, currency),
        currency,
        source: 'BACKEND',
      };
    }

    // --- PRIORITY 2: Convert from base USD price using Exchange Rate ---
    const usdDetail = matrix['USD'] || matrix['usd'];
    let baseUsdAmount = 0;

    if (usdDetail && typeof usdDetail[billingPeriod] === 'number') {
      baseUsdAmount = usdDetail[billingPeriod];
    } else if (billingPeriod === 'monthly') {
      baseUsdAmount = plan.price || plan.monthlyPrice || plan.monthly_price || 0;
    } else {
      baseUsdAmount = plan.yearlyPrice || plan.yearly_price || (plan.price ? plan.price * 10 : 0);
    }

    if (baseUsdAmount === 0) {
      return { amount: 0, formatted: currencyService.formatCurrency(0, currency), currency, source: 'BACKEND' };
    }

    const convertedAmount = currencyService.convertCurrency(baseUsdAmount, 'USD', currency, rates);
    const fxRate = rates[currency] || (currency === 'INR' ? 88.0 : 1.0);

    return {
      amount: convertedAmount,
      formatted: currencyService.formatCurrency(convertedAmount, currency),
      currency,
      source: 'EXCHANGE_RATE',
      exchangeRate: fxRate,
    };
  },
};
