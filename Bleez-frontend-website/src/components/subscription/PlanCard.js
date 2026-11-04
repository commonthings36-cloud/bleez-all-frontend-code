import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Check, Flame, Smartphone, CreditCard, Sparkles, CheckCircle2 } from 'lucide-react';
import { detectPlatform } from '../../services/iapService';

export default function PlanCard({ 
  plan, 
  billingCycle = 'monthly', 
  isCurrent = false, 
  purchasing = false, 
  onPurchase 
}) {
  const { isLight } = useTheme();
  const { currency, getSymbol } = useCurrency();
  const platform = detectPlatform();

  const isPopular = plan.popularFlag || plan.popular;
  const badgeText = plan.badgeText || plan.badge || (isPopular ? 'MOST POPULAR' : 'PLAN');
  const symbol = getSymbol(currency) || '$';

  // Extract pricing from pricingMatrix based on user currency or fallback USD
  const selectedMatrix = plan.pricingMatrix?.[currency] || plan.pricingMatrix?.USD || plan.pricingMatrix?.INR || {};
  const monthlyPrice = typeof selectedMatrix.monthly === 'number' 
    ? selectedMatrix.monthly 
    : parseFloat(selectedMatrix.monthly ?? plan.price_monthly ?? plan.monthly_price ?? plan.price ?? 0) || 0;
  
  const yearlyPrice = typeof selectedMatrix.yearly === 'number' 
    ? selectedMatrix.yearly 
    : parseFloat(selectedMatrix.yearly ?? plan.price_yearly ?? plan.yearly_price ?? 0) || (monthlyPrice * 12 * 0.8);
  
  const trialDays = selectedMatrix.trialDays ?? plan.pricingMatrix?.USD?.trialDays ?? 0;

  const displayMonthlyRate = billingCycle === 'yearly'
    ? (yearlyPrice > 0 ? (yearlyPrice / 12).toFixed(2) : (monthlyPrice * 0.8).toFixed(2))
    : monthlyPrice.toFixed(2);

  // Marketing bullets vs features
  const rawFeatures = Array.isArray(plan.marketingBullets) && plan.marketingBullets.length > 0
    ? plan.marketingBullets
    : (Array.isArray(plan.features) ? plan.features : []);

  const bullets = rawFeatures.map(f => {
    if (typeof f === 'string') return f;
    return f?.highlightText || f?.highlight_text || f?.name || f?.description || f?.featureCode || f?.feature_code || '';
  }).filter(Boolean);

  const renderButtonContent = () => {
    if (purchasing) return 'Processing...';
    if (isCurrent) {
      return (
        <span className="flex items-center gap-1.5 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Current Active Plan
        </span>
      );
    }
    if (monthlyPrice === 0) return 'Get Started Free';
    if (platform === 'ios') return ' Pay with Apple Pay';
    if (platform === 'android') return 'G Pay with Google Pay';
    const nameStr = typeof plan.name === 'string' ? plan.name : 'Plan';
    return `Subscribe to ${nameStr}`;
  };

  return (
    <div
      className={`relative rounded-3xl p-8 transition-all flex flex-col justify-between ${
        isPopular
          ? isLight
            ? 'bg-white border-2 border-amber-500 shadow-2xl shadow-amber-500/10 scale-105'
            : 'bg-slate-900 border-2 border-amber-500/80 shadow-2xl shadow-amber-500/10 scale-105'
          : isLight
            ? 'bg-white border border-slate-200 shadow-lg hover:border-slate-300'
            : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
          <Flame className="w-3.5 h-3.5" />
          <span>{badgeText}</span>
        </div>
      )}

      <div>
        {/* Header Name & Badge */}
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {typeof plan.name === 'string' ? plan.name : 'Plan'}
          </h3>
          {!isPopular && (
            <Badge variant="outline" className={isLight ? 'border-amber-500/50 text-amber-700 font-semibold' : 'border-amber-500/30 text-amber-400'}>
              {badgeText}
            </Badge>
          )}
        </div>

        {/* Tagline */}
        {plan.tagline && (
          <p className={`text-xs mb-4 min-h-[32px] ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
            {plan.tagline}
          </p>
        )}

        {/* Pricing Matrix Display */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl sm:text-5xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {symbol}{displayMonthlyRate}
            </span>
            <span className={`text-sm font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              / month
            </span>
          </div>

          {billingCycle === 'yearly' && yearlyPrice > 0 && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-bold">
              Billed annually ({symbol}{yearlyPrice.toFixed(2)}/yr)
            </p>
          )}

          {trialDays > 0 && (
            <div className={`inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
              isLight 
                ? 'bg-cyan-50 text-cyan-800 border-cyan-200' 
                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
            }`}>
              <Sparkles className="w-3 h-3" />
              <span>Includes {trialDays}-Day Free Trial</span>
            </div>
          )}
        </div>

        {/* Marketing Bullets & Features */}
        <ul className="space-y-3.5 mb-8">
          {bullets.map((bullet, idx) => (
            <li key={idx} className={`flex items-start gap-3 text-sm font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button */}
      <Button
        onClick={() => onPurchase(plan)}
        disabled={purchasing || isCurrent || (monthlyPrice === 0 && isCurrent)}
        className={`w-full py-6 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 ${
          isCurrent
            ? isLight
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 cursor-default'
              : 'bg-slate-800 text-emerald-400 border border-emerald-500/30 cursor-default'
            : isPopular
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950'
              : isLight
                ? 'bg-slate-900 hover:bg-slate-800 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
        }`}
      >
        {platform === 'ios' && !isCurrent && <Smartphone className="w-4 h-4" />}
        {platform === 'android' && !isCurrent && <CreditCard className="w-4 h-4" />}
        <span>{renderButtonContent()}</span>
      </Button>
    </div>
  );
}
