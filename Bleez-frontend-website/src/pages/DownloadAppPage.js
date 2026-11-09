import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Footer } from '../components/Layout';
import { IMG, FALLBACK_IMG } from '../data/travelImages';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '../lib/utils';
import {
  Smartphone, Download, Apple, Chrome, Share2, Plus, MoreVertical, CheckCircle2,
  Wifi, Bell, Zap, MapPin, Globe, Shield, ArrowRight, Monitor, Sparkles,
  Plane, Search, Star, CalendarDays, QrCode,
} from 'lucide-react';

const onImgError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = FALLBACK_IMG;
};

const FEATURES = [
  { icon: Wifi, title: 'Works offline', desc: 'Open your itineraries and bookings even without a signal.' },
  { icon: Bell, title: 'Trip alerts', desc: 'Get timely reminders and safety updates for your journey.' },
  { icon: Zap, title: 'Fast & light', desc: 'Launches instantly from your home screen, no heavy download.' },
  { icon: MapPin, title: 'Near-you ideas', desc: 'Discover places and food around wherever you are.' },
  { icon: Globe, title: 'Always up to date', desc: 'New features arrive automatically, no store updates.' },
  { icon: Shield, title: 'Private & secure', desc: 'Your trips and account stay protected.' },
];

const GUIDES = {
  ios: {
    label: 'iPhone / iPad',
    short: 'iPhone',
    icon: Apple,
    note: 'Use Safari for the best result.',
    steps: [
      { title: 'Tap the Share button', desc: 'At the bottom of Safari, tap the Share icon.', icon: Share2 },
      { title: 'Choose "Add to Home Screen"', desc: 'Scroll down the list and select it.', icon: Plus },
      { title: 'Tap "Add"', desc: 'Bleez now sits on your home screen like any other app.', icon: CheckCircle2 },
    ],
  },
  android: {
    label: 'Android',
    short: 'Android',
    icon: Smartphone,
    note: 'Works in Chrome, Edge and Samsung Internet.',
    steps: [
      { title: 'Open the browser menu', desc: 'Tap the ⋮ icon at the top right of Chrome.', icon: MoreVertical },
      { title: 'Select "Install app"', desc: 'It may also appear as "Add to Home screen".', icon: Download },
      { title: 'Confirm "Install"', desc: 'Bleez is added to your home screen and app drawer.', icon: CheckCircle2 },
    ],
  },
  desktop: {
    label: 'Desktop',
    short: 'Desktop',
    icon: Monitor,
    note: 'Chrome and Edge on Windows, macOS and Linux.',
    steps: [
      { title: 'Find the install icon', desc: 'Look for it at the right end of the address bar.', icon: Download },
      { title: 'Click "Install"', desc: 'Or open the browser menu and choose "Install Bleez".', icon: Chrome },
      { title: 'Launch from anywhere', desc: 'Bleez opens in its own window and pins to your taskbar or dock.', icon: CheckCircle2 },
    ],
  },
};

const tabFor = (platform) => (platform === 'ios' ? 'ios' : platform === 'android' ? 'android' : 'desktop');

// A phone that actually looks like the app, using real destination photos.
const PhoneMockup = () => (
  <div className="relative mx-auto w-[260px] sm:w-[290px]">
    <div className="absolute -inset-10 rounded-full bg-primary/30 blur-3xl" aria-hidden="true" />
    <div className="relative rounded-[2.6rem] bg-slate-900 p-2.5 shadow-[0_40px_80px_-20px_rgba(46,16,101,0.7)] ring-1 ring-white/20">
      <div className="relative rounded-[2.1rem] overflow-hidden bg-background aspect-[9/19]">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-900 rounded-full z-20" />
        {/* hero image */}
        <div className="relative h-[46%]">
          <img src={IMG.santorini(600)} alt="" aria-hidden="true" onError={onImgError} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c0838]/90 via-transparent to-[#1c0838]/40" />
          <div className="absolute top-9 left-4 right-4 flex items-center justify-between text-white">
            <div>
              <p className="text-[10px] text-white/70">Good morning</p>
              <p className="text-sm font-semibold">Where to next?</p>
            </div>
            <span className="w-7 h-7 rounded-full bg-white/20 backdrop-blur flex items-center justify-center"><Bell className="w-3.5 h-3.5" /></span>
          </div>
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <p className="text-[10px] text-white/75 flex items-center gap-1"><MapPin className="w-3 h-3" /> Greece · 5 days</p>
            <p className="text-lg font-bold leading-tight">Santorini</p>
          </div>
        </div>
        {/* body */}
        <div className="p-3.5 space-y-3">
          <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-[11px] text-muted-foreground">
            <Search className="w-3.5 h-3.5" /> Search places, cities…
          </div>
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
            {[{ img: IMG.paris(300), n: 'Paris' }, { img: IMG.kyoto(300), n: 'Kyoto' }].map((c) => (
              <div key={c.n} className="relative h-20 rounded-xl overflow-hidden">
                <img src={c.img} alt="" aria-hidden="true" onError={onImgError} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-1.5 left-2 text-[11px] font-semibold text-white">{c.n}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-2.5">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><CalendarDays className="w-4 h-4" /></span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold leading-tight">Day 1 · Oia sunset walk</p>
              <p className="text-[10px] text-muted-foreground">AI itinerary ready</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* floating chips */}
    <div className="hidden sm:flex absolute -left-14 top-24 items-center gap-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-2 shadow-xl text-slate-900">
      <span className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center"><Wifi className="w-4 h-4" /></span>
      <div><p className="text-xs font-semibold">Offline ready</p><p className="text-[10px] text-slate-500">Trips saved</p></div>
    </div>
    <div className="hidden sm:flex absolute -right-12 bottom-28 items-center gap-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-2 shadow-xl text-slate-900">
      <span className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center"><Star className="w-4 h-4 fill-current" /></span>
      <div><p className="text-xs font-semibold">AI planner</p><p className="text-[10px] text-slate-500">In seconds</p></div>
    </div>
  </div>
);

const DownloadAppPage = () => {
  const [platform, setPlatform] = useState('unknown');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [tab, setTab] = useState('desktop');
  const guideRef = useRef(null);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    let p = 'desktop';
    if (/iphone|ipad|ipod/.test(ua)) p = 'ios';
    else if (/android/.test(ua)) p = 'android';
    else if (/macintosh|mac os x/.test(ua)) p = 'mac';
    else if (/windows/.test(ua)) p = 'windows';
    setPlatform(p);
    setTab(tabFor(p));

    setIsInstalled(
      window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
    );

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      guideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  const guide = GUIDES[tab];
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="min-h-screen flex flex-col bg-background" data-testid="download-page">
      <Navbar />

      {/* Hero */}
      <header className="relative overflow-hidden bg-[#1c0838] text-white pt-28 pb-20 lg:pt-36 lg:pb-28">
        <img src={IMG.wander(1800)} alt="" aria-hidden="true" onError={onImgError} className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#2E1065]/90 via-[#2E1065]/70 to-[#1c0838]" />
        <div className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-primary/30 blur-3xl" aria-hidden="true" />

        <div className="container-main relative z-10 grid lg:grid-cols-2 gap-14 items-center">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur border border-white/20 px-4 py-1.5 text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[#E8A33D]" /> Free · No app store needed
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] mb-5">
              Take <span className="text-[#E8A33D]">Bleez</span><br />everywhere you go.
            </h1>
            <p className="text-white/80 text-base lg:text-lg max-w-xl mx-auto lg:mx-0 mb-8">
              Install Bleez on your phone or computer in seconds. Plan trips with AI, keep your itinerary offline
              and get alerts on the road.
            </p>

            {isInstalled ? (
              <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <span className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400/15 border border-emerald-300/30 px-5 py-3 text-emerald-200 font-medium">
                  <CheckCircle2 className="w-5 h-5" /> App installed
                </span>
                <Link
                  to="/plan"
                  className="inline-flex items-center gap-2 rounded-xl bg-white text-[#2E1065] font-semibold px-6 h-12 hover:bg-white/90 transition-colors"
                >
                  Start planning <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  data-testid="install-app-btn"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8A33D] text-[#1c0838] font-bold px-7 h-12 w-full sm:w-auto shadow-lg shadow-[#E8A33D]/25 hover:-translate-y-0.5 transition-all"
                >
                  <Download className="w-5 h-5" />
                  {deferredPrompt ? 'Install app now' : 'How to install'}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <a
                  href="#qr"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 backdrop-blur text-white font-semibold px-6 h-12 w-full sm:w-auto hover:bg-white/20 transition-colors"
                >
                  <QrCode className="w-5 h-5" /> Scan QR code
                </a>
              </div>
            )}

            <ul className="mt-8 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-white/75">
              {['iPhone & iPad', 'Android', 'Windows & Mac'].map((t) => (
                <li key={t} className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-300" />{t}</li>
              ))}
            </ul>
          </div>

          <div className="py-6 lg:py-0"><PhoneMockup /></div>
        </div>
      </header>

      <main className="flex-1">
        {/* Install guide */}
        <section ref={guideRef} className="py-16 md:py-24 scroll-mt-24" id="install">
          <div className="container-main">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">Install in 3 steps</p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Pick your device</h2>
              <p className="text-muted-foreground">
                {platform !== 'unknown' && <>We detected your device, but you can switch anytime.</>}
              </p>
            </div>

            <div role="tablist" aria-label="Choose your device" className="mx-auto mb-10 flex w-full max-w-xl rounded-2xl bg-muted p-1.5">
              {Object.entries(GUIDES).map(([key, g]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => setTab(key)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-2 sm:px-3 py-2.5 text-xs sm:text-sm font-medium transition-all',
                    tab === key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <g.icon className="w-4 h-4" />
                  <span><span className="sm:hidden">{g.short}</span><span className="hidden sm:inline">{g.label}</span></span>
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-5 md:gap-6 max-w-5xl mx-auto">
              {guide.steps.map((st, i) => (
                <div key={st.title} className="relative rounded-2xl bg-card border border-border shadow-sm p-6">
                  <span className="absolute -top-3 left-6 rounded-full bg-primary text-primary-foreground text-xs font-bold px-3 py-1">
                    Step {i + 1}
                  </span>
                  <span className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 mt-2">
                    <st.icon className="w-6 h-6" />
                  </span>
                  <h3 className="font-semibold text-lg mb-1.5">{st.title}</h3>
                  <p className="text-sm text-muted-foreground">{st.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-6">{guide.note}</p>
          </div>
        </section>

        {/* QR */}
        <section id="qr" className="pb-16 md:pb-24 scroll-mt-24">
          <div className="container-main">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2E1065] to-[#1c0838] text-white p-8 md:p-12 grid md:grid-cols-[1fr_auto] gap-10 items-center">
              <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-primary/30 blur-3xl" aria-hidden="true" />
              <div className="relative text-center md:text-left">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#E8A33D] mb-3">
                  <Smartphone className="w-4 h-4" /> On a computer?
                </span>
                <h2 className="text-2xl md:text-4xl font-extrabold mb-3">Scan to open Bleez on your phone</h2>
                <p className="text-white/75 max-w-md mx-auto md:mx-0">
                  Point your phone camera at the code, open the link, then follow the install steps above.
                </p>
                <p className="mt-4 text-xs text-white/55 break-all">{origin}</p>
              </div>
              <div className="relative justify-self-center rounded-3xl bg-white p-5 shadow-2xl">
                <QRCodeSVG
                  value={origin || 'https://bleez.ai'}
                  size={176}
                  level="H"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#1c0838"
                  imageSettings={{ src: '/icons/icon-72x72.png', height: 36, width: 36, excavate: true }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="pb-16 md:pb-24">
          <div className="container-main">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">Why install</p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Everything a travel app should be</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f) => (
                <div key={f.title} className="group rounded-2xl bg-card border border-border p-6 hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 transition-all">
                  <span className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <f.icon className="w-6 h-6" />
                  </span>
                  <h3 className="font-semibold mb-1.5">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="pb-20">
          <div className="container-main">
            <div className="relative overflow-hidden rounded-3xl min-h-[260px] flex items-center">
              <img src={IMG.maldives(1600)} alt="" aria-hidden="true" onError={onImgError} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1c0838]/90 via-[#2E1065]/65 to-transparent" />
              <div className="relative p-8 md:p-12 text-white max-w-xl">
                <Plane className="w-8 h-8 text-[#E8A33D] mb-4" />
                <h2 className="text-2xl md:text-4xl font-extrabold mb-3">Your next trip is one tap away</h2>
                <p className="text-white/80 mb-6">Prefer not to install? Bleez works great in your browser too.</p>
                <Link to="/plan" className="inline-flex items-center gap-2 rounded-xl bg-white text-[#2E1065] font-semibold px-6 h-12 hover:bg-white/90 transition-colors">
                  Plan a trip <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DownloadAppPage;
