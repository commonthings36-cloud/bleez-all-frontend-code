import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const CurrencyContext = createContext();

// Currency data with symbols and formats
const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
  JPY: { symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP', decimals: 0 },
  AUD: { symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  INR: { symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
  THB: { symbol: '฿', name: 'Thai Baht', locale: 'th-TH' },
  MXN: { symbol: 'MX$', name: 'Mexican Peso', locale: 'es-MX' },
  BRL: { symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
  KRW: { symbol: '₩', name: 'South Korean Won', locale: 'ko-KR', decimals: 0 },
  ZAR: { symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
  NZD: { symbol: 'NZ$', name: 'New Zealand Dollar', locale: 'en-NZ' },
  SEK: { symbol: 'kr', name: 'Swedish Krona', locale: 'sv-SE' },
  NOK: { symbol: 'kr', name: 'Norwegian Krone', locale: 'nb-NO' },
  DKK: { symbol: 'kr', name: 'Danish Krone', locale: 'da-DK' },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar', locale: 'zh-HK' },
  MYR: { symbol: 'RM', name: 'Malaysian Ringgit', locale: 'ms-MY' },
  PHP: { symbol: '₱', name: 'Philippine Peso', locale: 'en-PH' },
  IDR: { symbol: 'Rp', name: 'Indonesian Rupiah', locale: 'id-ID', decimals: 0 },
  TRY: { symbol: '₺', name: 'Turkish Lira', locale: 'tr-TR' },
  RUB: { symbol: '₽', name: 'Russian Ruble', locale: 'ru-RU' },
  PLN: { symbol: 'zł', name: 'Polish Zloty', locale: 'pl-PL' },
  CZK: { symbol: 'Kč', name: 'Czech Koruna', locale: 'cs-CZ' },
  HUF: { symbol: 'Ft', name: 'Hungarian Forint', locale: 'hu-HU', decimals: 0 },
  ILS: { symbol: '₪', name: 'Israeli Shekel', locale: 'he-IL' },
  SAR: { symbol: '﷼', name: 'Saudi Riyal', locale: 'ar-SA' },
  EGP: { symbol: 'E£', name: 'Egyptian Pound', locale: 'ar-EG' },
  VND: { symbol: '₫', name: 'Vietnamese Dong', locale: 'vi-VN', decimals: 0 },
  TWD: { symbol: 'NT$', name: 'Taiwan Dollar', locale: 'zh-TW' },
};

// Country code to currency mapping
const COUNTRY_TO_CURRENCY = {
  US: 'USD', GB: 'GBP', DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR',
  JP: 'JPY', AU: 'AUD', CA: 'CAD', CH: 'CHF', CN: 'CNY', IN: 'INR', SG: 'SGD',
  AE: 'AED', TH: 'THB', MX: 'MXN', BR: 'BRL', KR: 'KRW', ZA: 'ZAR', NZ: 'NZD',
  SE: 'SEK', NO: 'NOK', DK: 'DKK', HK: 'HKD', MY: 'MYR', PH: 'PHP', ID: 'IDR',
  TR: 'TRY', RU: 'RUB', PL: 'PLN', CZ: 'CZK', HU: 'HUF', IL: 'ILS', SA: 'SAR',
  EG: 'EGP', VN: 'VND', TW: 'TWD', AT: 'EUR', BE: 'EUR', PT: 'EUR', IE: 'EUR',
  FI: 'EUR', GR: 'EUR', LU: 'EUR', SK: 'EUR', SI: 'EUR', EE: 'EUR', LV: 'EUR',
  LT: 'EUR', MT: 'EUR', CY: 'EUR',
};

// Approximate exchange rates (from USD) - updated periodically
const EXCHANGE_RATES = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.50, AUD: 1.53, CAD: 1.36, CHF: 0.88,
  CNY: 7.24, INR: 83.12, SGD: 1.34, AED: 3.67, THB: 34.85, MXN: 17.15, BRL: 4.97,
  KRW: 1298, ZAR: 18.62, NZD: 1.64, SEK: 10.42, NOK: 10.58, DKK: 6.87, HKD: 7.82,
  MYR: 4.72, PHP: 55.89, IDR: 15685, TRY: 28.95, RUB: 89.50, PLN: 4.02, CZK: 22.85,
  HUF: 356, ILS: 3.62, SAR: 3.75, EGP: 30.90, VND: 24485, TWD: 31.52,
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  // Initialize from localStorage or default to USD
  const [currency, setCurrencyState] = useState(() => {
    const saved = localStorage.getItem('preferredCurrency');
    return saved && CURRENCIES[saved] ? saved : 'USD';
  });
  
  const [detectedCurrency, setDetectedCurrency] = useState(null);
  const [detectedCountry, setDetectedCountry] = useState(null);
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-detect currency based on user location
  useEffect(() => {
    const detectCurrency = async () => {
      // Check if user has manually set a currency
      const savedCurrency = localStorage.getItem('preferredCurrency');
      const manuallySet = localStorage.getItem('currencyManuallySet') === 'true';
      
      if (manuallySet && savedCurrency) {
        setCurrencyState(savedCurrency);
        setIsLoading(false);
        return;
      }

      try {
        // Try multiple geolocation services for reliability
        let countryCode = null;
        
        // Primary: ipapi.co (HTTPS, reliable)
        try {
          const response = await axios.get('https://ipapi.co/json/', { timeout: 5000 });
          if (response.data?.country_code) {
            countryCode = response.data.country_code;
          }
        } catch (e) {
          console.log('Primary geolocation failed, trying backup...');
        }
        
        // Backup: ip-api.com (HTTP but reliable)
        if (!countryCode) {
          try {
            const response = await axios.get('http://ip-api.com/json/', { timeout: 5000 });
            if (response.data?.countryCode) {
              countryCode = response.data.countryCode;
            }
          } catch (e) {
            console.log('Backup geolocation also failed');
          }
        }
        
        if (countryCode) {
          const detectedCurr = COUNTRY_TO_CURRENCY[countryCode] || 'USD';
          
          setDetectedCountry(countryCode);
          setDetectedCurrency(detectedCurr);
          
          // Only auto-set if not manually configured
          if (!manuallySet) {
            setCurrencyState(detectedCurr);
            localStorage.setItem('preferredCurrency', detectedCurr);
            setIsAutoDetected(true);
          }
        }
      } catch (error) {
        console.log('Currency detection fallback to browser locale');
      }
      
      // Final fallback to browser locale
      if (!detectedCurrency) {
        try {
          const locale = navigator.language || navigator.userLanguage;
          const region = locale.split('-')[1];
          if (region && COUNTRY_TO_CURRENCY[region]) {
            const localeCurrency = COUNTRY_TO_CURRENCY[region];
            const manuallySet = localStorage.getItem('currencyManuallySet') === 'true';
            if (!manuallySet) {
              setCurrencyState(localeCurrency);
              setDetectedCurrency(localeCurrency);
              setDetectedCountry(region);
              localStorage.setItem('preferredCurrency', localeCurrency);
              setIsAutoDetected(true);
            }
          }
        } catch (e) {
          // Use default USD
        }
      }
      
      setIsLoading(false);
    };

    detectCurrency();
  }, []);

  // Set currency manually
  const setCurrency = useCallback((newCurrency) => {
    if (CURRENCIES[newCurrency]) {
      setCurrencyState(newCurrency);
      localStorage.setItem('preferredCurrency', newCurrency);
      localStorage.setItem('currencyManuallySet', 'true');
      setIsAutoDetected(false);
    }
  }, []);

  // Reset to auto-detected currency
  const resetToAutoDetected = useCallback(() => {
    localStorage.removeItem('currencyManuallySet');
    if (detectedCurrency) {
      setCurrencyState(detectedCurrency);
      setIsAutoDetected(true);
    }
  }, [detectedCurrency]);

  // Format amount in current currency
  const formatAmount = useCallback((amount, fromCurrency = 'USD', options = {}) => {
    const { showOriginal = false, compact = false } = options;
    
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '-';
    }

    // Convert from source currency to target currency
    const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
    const toRate = EXCHANGE_RATES[currency] || 1;
    const convertedAmount = (amount / fromRate) * toRate;

    const currencyInfo = CURRENCIES[currency];
    const decimals = currencyInfo?.decimals ?? 2;

    try {
      let formatted;
      if (compact && Math.abs(convertedAmount) >= 1000) {
        formatted = new Intl.NumberFormat(currencyInfo?.locale || 'en-US', {
          style: 'currency',
          currency: currency,
          notation: 'compact',
          maximumFractionDigits: 1,
        }).format(convertedAmount);
      } else {
        formatted = new Intl.NumberFormat(currencyInfo?.locale || 'en-US', {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(convertedAmount);
      }

      // Optionally show original amount
      if (showOriginal && fromCurrency !== currency) {
        const originalFormatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: fromCurrency,
          minimumFractionDigits: CURRENCIES[fromCurrency]?.decimals ?? 2,
          maximumFractionDigits: CURRENCIES[fromCurrency]?.decimals ?? 2,
        }).format(amount);
        return `${formatted} (${originalFormatted})`;
      }

      return formatted;
    } catch (e) {
      // Fallback formatting
      return `${currencyInfo?.symbol || '$'}${convertedAmount.toFixed(decimals)}`;
    }
  }, [currency]);

  // Get currency symbol
  const getSymbol = useCallback((currencyCode = currency) => {
    return CURRENCIES[currencyCode]?.symbol || currencyCode;
  }, [currency]);

  // Convert between currencies
  const convert = useCallback((amount, fromCurrency, toCurrency = currency) => {
    if (!amount || isNaN(amount)) return 0;
    const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
    const toRate = EXCHANGE_RATES[toCurrency] || 1;
    return (amount / fromRate) * toRate;
  }, [currency]);

  // Get all available currencies for selection
  const availableCurrencies = Object.entries(CURRENCIES).map(([code, info]) => ({
    code,
    ...info,
  }));

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      detectedCurrency,
      detectedCountry,
      isAutoDetected,
      isLoading,
      resetToAutoDetected,
      formatAmount,
      getSymbol,
      convert,
      availableCurrencies,
      currencyInfo: CURRENCIES[currency],
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;
