import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from './Layout';
import { FALLBACK_IMG } from '../data/travelImages';
import { Plane, MapPin, Sparkles, ShieldCheck, Loader2, Star } from 'lucide-react';

export const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#0A66C2">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

export const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <defs>
      <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FFDC80" />
        <stop offset="25%" stopColor="#F77737" />
        <stop offset="50%" stopColor="#E1306C" />
        <stop offset="75%" stopColor="#C13584" />
        <stop offset="100%" stopColor="#833AB4" />
      </linearGradient>
    </defs>
    <path fill="url(#ig-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

// Compact row of social providers. `idPrefix` keeps existing data-testids ("login" / "register").
export const SocialButtons = ({ idPrefix, socialLoading, onSelect }) => {
  const items = [
    { key: 'google', label: 'Google', icon: <GoogleIcon /> },
    { key: 'facebook', label: 'Facebook', icon: <FacebookIcon /> },
    { key: 'linkedin', label: 'LinkedIn', icon: <LinkedInIcon /> },
    { key: 'instagram', label: 'Instagram', icon: <InstagramIcon /> },
  ];
  return (
    <div className="grid gap-2.5 sm:gap-3" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
      {items.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => onSelect(p.key)}
          disabled={socialLoading === p.key}
          aria-label={`Continue with ${p.label}`}
          data-testid={`${p.key}-${idPrefix}-btn`}
          className="h-11 sm:h-12 rounded-xl border border-border bg-background hover:bg-muted hover:border-primary/40 transition-all flex items-center justify-center gap-2.5 text-sm font-medium text-foreground disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {socialLoading === p.key ? <Loader2 className="w-5 h-5 animate-spin" /> : p.icon}
          {p.label}
        </button>
      ))}
    </div>
  );
};

export const OrDivider = ({ children = 'or continue with email' }) => (
  <div className="flex items-center gap-4 my-6">
    <span className="h-px flex-1 bg-border" />
    <span className="text-xs uppercase tracking-wider text-muted-foreground">{children}</span>
    <span className="h-px flex-1 bg-border" />
  </div>
);

const PERKS = [
  { icon: Sparkles, text: 'AI-built itineraries in seconds' },
  { icon: MapPin, text: 'Flights, stays & food in one place' },
  { icon: ShieldCheck, text: 'Safety alerts wherever you land' },
];

const Photo = ({ image }) => (
  <>
    <img
      src={image}
      alt=""
      aria-hidden="true"
      className="absolute inset-0 w-full h-full object-cover"
      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-[#1c0838] via-[#2E1065]/55 to-[#2E1065]/20" />
  </>
);

/**
 * variant="center": immersive full-bleed photo with a floating frosted card (Login).
 * variant="split":  form on the left, photo + floating glass cards on the right (Register).
 */
const AuthLayout = ({ testId, image, headline, tagline, children, footer, variant = 'split', floating }) => {
  if (variant === 'center') {
    return (
      <div className="min-h-screen flex flex-col bg-[#1c0838]" data-testid={testId}>
        <Navbar />
        <div className="relative flex-1 flex items-center justify-center px-4 sm:px-6 pt-24 sm:pt-28 pb-10 sm:pb-14">
          <Photo image={image} />
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#E8A33D]/20 blur-3xl pointer-events-none" />
          <div className="relative w-full max-w-md" style={{ maxWidth: 460 }}>
            <div className="text-center text-white mb-6">
              <span className="inline-flex w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 items-center justify-center mb-3 sm:mb-4">
                <Plane className="w-6 h-6 sm:w-7 sm:h-7" />
              </span>
              <p className="text-sm text-white/80 max-w-xs mx-auto">{tagline}</p>
            </div>
            <div className="rounded-3xl bg-background/95 backdrop-blur-xl border border-white/30 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] p-5 sm:p-9">
              {children}
            </div>
            {footer && <p className="mt-6 text-center text-sm text-white/85">{footer}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background" data-testid={testId}>
      <Navbar />
      <div className="flex-1 grid lg:grid-cols-2 pt-20">
        {/* Form panel */}
        <main className="relative flex items-center justify-center px-5 sm:px-10 py-10 lg:py-16">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(60%_50%_at_10%_0%,hsl(var(--primary)/0.10),transparent)]" />
          <div className="relative w-full max-w-md">
            {children}
            {footer && <p className="mt-8 text-center text-sm text-muted-foreground">{footer}</p>}
          </div>
        </main>

        {/* Visual panel */}
        <aside className="relative hidden lg:flex overflow-hidden m-4 ml-0 rounded-[2rem]">
          <Photo image={image} />
          {floating}
          <div className="relative z-10 flex flex-col justify-end p-12 xl:p-14 text-white max-w-xl">
            <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/15 backdrop-blur px-4 py-1.5 text-xs font-medium mb-6">
              <Star className="w-3.5 h-3.5 fill-[#E8A33D] text-[#E8A33D]" /> Loved by travellers worldwide
            </div>
            <h2 className="text-4xl xl:text-5xl font-extrabold leading-tight mb-4">{headline}</h2>
            <p className="text-white/80 text-lg mb-8">{tagline}</p>
            <ul className="space-y-3">
              {PERKS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-white/90">
                  <span className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AuthLayout;
