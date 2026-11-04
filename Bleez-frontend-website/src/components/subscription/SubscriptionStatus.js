import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Zap, Crown, ShieldCheck, Clock } from 'lucide-react';

export default function SubscriptionStatus({ subscription }) {
  const { isLight } = useTheme();
  if (!subscription) return null;

  const planName = subscription.entitlements?.planName || subscription.activePlan || 'Free Starter';
  const isActive = subscription.status === 'ACTIVE';
  const validUntil = subscription.validUntil ? new Date(subscription.validUntil).toLocaleDateString() : null;
  const usageList = subscription.usage || [];

  return (
    <div className={`max-w-3xl mx-auto mb-12 p-6 rounded-3xl border shadow-xl backdrop-blur-xl space-y-6 ${
      isLight 
        ? 'bg-white border-slate-200 text-slate-900 shadow-slate-200/60' 
        : 'bg-slate-900/60 border-slate-800 text-slate-100'
    }`}>
      {/* Header Info */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 ${
        isLight ? 'border-slate-100' : 'border-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Crown className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {planName}
              </span>
              <Badge className={isActive ? 'bg-emerald-500/20 text-emerald-600 font-bold border-emerald-500/30' : 'bg-slate-200 text-slate-600 font-bold'}>
                {isActive ? 'ACTIVE' : 'INACTIVE'}
              </Badge>
            </div>
            {validUntil && (
              <p className={`text-xs flex items-center gap-1 mt-0.5 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Renews on {validUntil}</span>
              </p>
            )}
          </div>
        </div>

        <div className={`flex items-center gap-2 text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Verified Entitlements</span>
        </div>
      </div>

      {/* Usage Progress Meters */}
      {usageList.length > 0 && (
        <div className="space-y-4">
          <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Resource Quota Usage
          </h4>
          {usageList.map((item, idx) => {
            const current = item.currentCount ?? 0;
            const limit = item.limitValue ?? 100;
            const pct = item.percentage ?? Math.min(100, Math.round((current / limit) * 100));

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className={`flex items-center gap-1.5 font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>{item.limitCode || 'Usage Quota'}</span>
                  </div>
                  <span className={`font-mono font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {current} / {limit} used ({pct}%)
                  </span>
                </div>
                <Progress value={pct} className={`h-2.5 ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
