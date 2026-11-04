import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { CheckCircle2, Sparkles, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { detectPlatform } from '../services/iapService';

export default function IapSuccessDialog({ isOpen, onClose, planName = 'Explorer Plan' }) {
  const navigate = useNavigate();
  const platform = detectPlatform();

  const getPlatformBadge = () => {
    if (platform === 'ios') return ' Apple Pay Verified';
    if (platform === 'android') return 'G Pay Verified';
    return '✓ Verified Purchase';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white p-6 rounded-2xl shadow-2xl backdrop-blur-2xl">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-4 animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            {getPlatformBadge()}
          </div>

          <DialogTitle className="text-2xl font-bold tracking-tight text-white">
            Welcome to {planName}!
          </DialogTitle>
          
          <DialogDescription className="text-slate-400 text-sm mt-1">
            Your subscription has been activated successfully. All premium features are unlocked instantly.
          </DialogDescription>
        </DialogHeader>

        <div className="my-6 space-y-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-3 text-sm text-slate-200">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>High-Speed AI Trip Generations</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Offline Sync & PDF Itinerary Exports</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-200">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Smart Meeting & Booking Intelligence</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <Button 
            onClick={() => {
              onClose();
              navigate('/plan');
            }}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-6 rounded-xl shadow-lg flex items-center justify-center gap-2"
          >
            <span>Start Planning Trips</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button 
            variant="ghost" 
            onClick={onClose}
            className="w-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
