import React, { useState } from 'react';
import PageHero from '../components/PageHero';
import { IMG } from '../data/travelImages';
import { Navbar } from '../components/Layout';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../hooks/useSubscription';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { 
  Crown, 
  RotateCcw
} from 'lucide-react';
import PlanCard from '../components/subscription/PlanCard';
import SubscriptionStatus from '../components/subscription/SubscriptionStatus';
import IapSuccessDialog from '../components/IapSuccessDialog';

export default function CustomerSubscriptionPage() {
  const { isLight } = useTheme();
  const { 
    plans, 
    currentSubscription, 
    plansLoading, 
    subscriptionLoading, 
    purchaseLoading, 
    restoreLoading, 
    isCurrentPlan, 
    purchasePlan, 
    restoreUserPurchases 
  } = useSubscription();
  
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [purchasingPlanId, setPurchasingPlanId] = useState(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [purchasedPlanName, setPurchasedPlanName] = useState('');

  const loading = plansLoading || subscriptionLoading;

  const handlePurchase = async (plan) => {
    const pId = plan.id || plan.code;
    setPurchasingPlanId(pId);
    try {
      const result = await purchasePlan(plan, billingCycle);
      if (result?.success || result?.status === 'ACTIVE') {
        const nameStr = typeof plan.name === 'string' ? plan.name : 'Explorer Plan';
        setPurchasedPlanName(nameStr);
        setSuccessDialogOpen(true);
      }
    } catch (err) {
      if (!err?.message?.includes('cancel') && err?.code !== 'USER_CANCELLED') {
        toast.error(err?.response?.data?.detail || err?.message || 'Purchase process failed');
      }
    } finally {
      setPurchasingPlanId(null);
    }
  };

  const handleRestore = async () => {
    try {
      const res = await restoreUserPurchases();
      toast.success(res.message || 'Purchases restored successfully!');
    } catch (err) {
      toast.error('Unable to restore purchases at this time.');
    }
  };

  return (
    <div className={`min-h-screen ${isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      <Navbar />
      <PageHero image={IMG.resort(1600)} eyebrow="Premium" title="Plans & subscription" subtitle="Unlock more AI planning and premium features." />

      <main className="container-main pt-10 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20">
            <Crown className="w-4 h-4 text-amber-500" />
            <span>Upgrade Your Travel Experience</span>
          </div>

          <h1 className={`text-3xl sm:text-5xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Simple, Transparent <span className="gold-text">Pricing Plans</span>
          </h1>

          <p className={`text-base sm:text-lg ${isLight ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
            Unlock unlimited AI trip itineraries, PDF downloads, and offline smart travel intelligence.
          </p>

          {/* Restore Purchases Action */}
          <div className="pt-2 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestore}
              disabled={restoreLoading}
              className={`gap-2 text-xs font-semibold ${
                isLight 
                  ? 'border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-200/60 bg-white shadow-sm' 
                  : 'border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white'
              }`}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${restoreLoading ? 'animate-spin' : ''}`} />
              <span>{restoreLoading ? 'Restoring...' : 'Restore Native Purchases'}</span>
            </Button>
          </div>
        </div>

        {/* Current Subscription Status & Usage Meter */}
        <SubscriptionStatus subscription={currentSubscription} />

        {/* Monthly / Yearly Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className={`p-1 rounded-2xl border inline-flex items-center gap-1 shadow-inner ${
            isLight ? 'bg-slate-200/80 border-slate-300' : 'bg-slate-900 border-slate-800'
          }`}>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : isLight ? 'text-slate-700 hover:text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : isLight ? 'text-slate-700 hover:text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => {
              const planCode = plan.code || plan.id;
              const active = isCurrentPlan(planCode);
              const pId = plan.id || plan.code;

              return (
                <PlanCard
                  key={pId || `plan-${index}`}
                  plan={plan}
                  billingCycle={billingCycle}
                  isCurrent={active}
                  purchasing={purchasingPlanId === pId || purchaseLoading}
                  onPurchase={handlePurchase}
                />
              );
            })}
          </div>
        )}

        {/* Legal Disclosures */}
        <div className={`mt-16 text-center text-xs space-y-2 max-w-2xl mx-auto ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>
          <p>
            Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current period.
          </p>
          <div className={`flex justify-center gap-4 underline font-medium ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
            <a href="/terms" target="_blank" rel="noreferrer">Terms of Service</a>
            <span>•</span>
            <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>
          </div>
        </div>

      </main>

      {/* Celebration Modal */}
      <IapSuccessDialog
        isOpen={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        planName={purchasedPlanName}
      />
    </div>
  );
}
