import React, { useState } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Button } from './ui/button';
import { Globe, Check, RefreshCw, DollarSign } from 'lucide-react';
import { cn } from '../lib/utils';

// Popular currencies shown first
const POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'AUD', 'CAD', 'SGD', 'AED', 'CHF'];

const CurrencySelector = ({ 
  compact = false, 
  showLabel = true,
  className 
}) => {
  const {
    currency,
    setCurrency,
    isAutoDetected,
    detectedCurrency,
    detectedCountry,
    resetToAutoDetected,
    availableCurrencies,
    currencyInfo,
    isLoading,
  } = useCurrency();

  const [isOpen, setIsOpen] = useState(false);

  // Sort currencies: popular first, then alphabetically
  const sortedCurrencies = [...availableCurrencies].sort((a, b) => {
    const aPopular = POPULAR_CURRENCIES.indexOf(a.code);
    const bPopular = POPULAR_CURRENCIES.indexOf(b.code);
    
    if (aPopular >= 0 && bPopular >= 0) return aPopular - bPopular;
    if (aPopular >= 0) return -1;
    if (bPopular >= 0) return 1;
    return a.name.localeCompare(b.name);
  });

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span className="text-sm">Detecting...</span>
      </div>
    );
  }

  if (compact) {
    return (
      <Select value={currency} onValueChange={setCurrency}>
        <SelectTrigger 
          className={cn("w-24 h-9 bg-white/5 border-white/10", className)}
          data-testid="currency-selector-compact"
        >
          <SelectValue>
            <span className="font-medium">{currency}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="glass border-white/10 max-h-64">
          {sortedCurrencies.map((curr, idx) => (
            <React.Fragment key={curr.code}>
              {idx === POPULAR_CURRENCIES.length && (
                <div className="px-2 py-1 text-xs text-muted-foreground border-t border-white/10 mt-1 pt-2">
                  All Currencies
                </div>
              )}
              <SelectItem value={curr.code}>
                <span className="flex items-center gap-2">
                  <span className="w-6 text-center font-mono">{curr.symbol}</span>
                  <span>{curr.code}</span>
                </span>
              </SelectItem>
            </React.Fragment>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Currency Preference
          </label>
          {isAutoDetected && detectedCurrency && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Auto-detected ({detectedCountry})
            </span>
          )}
        </div>
      )}

      <Select value={currency} onValueChange={setCurrency} open={isOpen} onOpenChange={setIsOpen}>
        <SelectTrigger 
          className="w-full bg-white/5 border-white/10 h-12"
          data-testid="currency-selector"
        >
          <SelectValue>
            <span className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-medium">
                {currencyInfo?.symbol || currency}
              </span>
              <span>
                <span className="font-medium">{currency}</span>
                <span className="text-muted-foreground ml-2">- {currencyInfo?.name}</span>
              </span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="glass border-white/10 max-h-80">
          {/* Popular currencies section */}
          <div className="px-2 py-1 text-xs text-muted-foreground font-medium">
            Popular
          </div>
          {sortedCurrencies.filter(c => POPULAR_CURRENCIES.includes(c.code)).map(curr => (
            <SelectItem key={curr.code} value={curr.code}>
              <span className="flex items-center gap-3 py-1">
                <span className="w-8 text-center text-lg">{curr.symbol}</span>
                <span className="flex-1">
                  <span className="font-medium">{curr.code}</span>
                  <span className="text-muted-foreground ml-2 text-sm">{curr.name}</span>
                </span>
                {curr.code === currency && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </span>
            </SelectItem>
          ))}
          
          {/* Divider */}
          <div className="px-2 py-1 text-xs text-muted-foreground font-medium border-t border-white/10 mt-2 pt-2">
            All Currencies
          </div>
          
          {/* All other currencies */}
          {sortedCurrencies.filter(c => !POPULAR_CURRENCIES.includes(c.code)).map(curr => (
            <SelectItem key={curr.code} value={curr.code}>
              <span className="flex items-center gap-3 py-1">
                <span className="w-8 text-center text-lg">{curr.symbol}</span>
                <span className="flex-1">
                  <span className="font-medium">{curr.code}</span>
                  <span className="text-muted-foreground ml-2 text-sm">{curr.name}</span>
                </span>
                {curr.code === currency && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Auto-detect reset button */}
      {!isAutoDetected && detectedCurrency && detectedCurrency !== currency && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetToAutoDetected}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Reset to auto-detected ({detectedCurrency})
        </Button>
      )}
    </div>
  );
};

export default CurrencySelector;
