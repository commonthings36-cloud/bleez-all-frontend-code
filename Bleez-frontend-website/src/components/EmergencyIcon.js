import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Phone, Siren, X, Shield, Ambulance, Flame, LifeBuoy, MapPin, RefreshCw, Loader2, TriangleAlert } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SERVICES = [
  { key: 'police', name: 'Police', hint: 'Law enforcement', icon: Shield, tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { key: 'ambulance', name: 'Ambulance', hint: 'Medical emergency', icon: Ambulance, tone: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  { key: 'fire', name: 'Fire', hint: 'Fire department', icon: Flame, tone: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  { key: 'tourist_helpline', name: 'Tourist helpline', hint: 'Travel assistance', icon: LifeBuoy, tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
];

const usable = (n) => typeof n === 'string' && n.trim() !== '' && n.trim().toUpperCase() !== 'N/A';

const EmergencyIcon = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  // Emergency info is reachable from the Emergency page on itinerary screens, where this button would crowd the UI.
  const hidden = location.pathname.startsWith('/itinerary');

  const detect = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await axios.get(`${API}/emergency/detect-location`);
      setData(res.data);
    } catch {
      setData(null);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hidden) detect();
  }, [hidden, detect]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (hidden) return null;

  const numbers = data?.emergency_numbers || {};
  const known = Boolean(data) && data.detected !== false && data.country && data.country !== 'Unknown' && SERVICES.some((s) => usable(numbers[s.key]));

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-rose-500 to-red-700 shadow-lg shadow-red-600/30 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 animate-pulse-slow"
        title="Emergency numbers"
        aria-label="Emergency numbers"
        data-testid="emergency-btn"
      >
        <Siren className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Emergency numbers"
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md max-h-[92dvh] overflow-y-auto rounded-t-[2rem] sm:rounded-[2rem] bg-background text-foreground shadow-2xl animate-scale-in"
          >
            <div className="relative overflow-hidden surface-ink px-6 pt-6 pb-5">
              <div className="mesh-bg" aria-hidden="true"><i /></div>
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/40"><Siren className="w-6 h-6 text-white" /></span>
                  <div>
                    <h2 className="text-xl font-extrabold text-white leading-tight">Emergency numbers</h2>
                    <p className="text-sm text-white/65">Tap a number to call</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Close" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="relative mt-4 flex items-center justify-between gap-3 rounded-2xl glass-panel px-4 py-2.5">
                <span className="flex items-center gap-2 text-sm text-white min-w-0">
                  <MapPin className="w-4 h-4 text-[#5EEAD4] shrink-0" />
                  <span className="truncate">{loading ? 'Detecting your location…' : known ? data.country : 'Location not detected'}</span>
                </span>
                <button onClick={detect} disabled={loading} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white disabled:opacity-50">
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Refresh
                </button>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {!loading && !known && (
                <div className="flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
                  <TriangleAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p>
                    {failed ? 'We couldn’t reach the server to find the numbers for your location.' : 'We couldn’t confirm which country you’re in, so we can’t show local numbers.'}{' '}
                    Check the numbers for your destination before you rely on them.
                  </p>
                </div>
              )}

              {known && SERVICES.map((s) => {
                const n = numbers[s.key];
                const ok = usable(n);
                return (
                  <div key={s.key} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-3.5">
                    <span className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.tone}`}><s.icon className="w-6 h-6" /></span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold leading-tight">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.hint}</p>
                    </div>
                    {ok ? (
                      <a href={`tel:${n.replace(/\s+/g, '')}`} className="inline-flex items-center gap-2 rounded-full bg-foreground text-background pl-4 pr-3 py-2 font-extrabold tabular-nums hover:opacity-90 transition-opacity" aria-label={`Call ${s.name} on ${n}`}>
                        {n} <Phone className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not available</span>
                    )}
                  </div>
                );
              })}

              <div className="rounded-2xl bg-muted/60 p-4 text-sm">
                <p className="font-bold">112 · international emergency number</p>
                <p className="text-muted-foreground mt-0.5">Works across the EU and is forwarded to local emergency services on most mobile networks worldwide. Local numbers are best when available.</p>
                <a href="tel:112" className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 font-bold hover:border-primary hover:text-primary transition-colors"><Phone className="w-4 h-4" /> Call 112</a>
              </div>
            </div>

            <div className="px-5 pb-5">
              <button onClick={() => setOpen(false)} className="w-full rounded-full border border-border py-3 font-semibold hover:bg-muted transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencyIcon;
