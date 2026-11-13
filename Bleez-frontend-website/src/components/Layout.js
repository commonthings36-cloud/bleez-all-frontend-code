import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Menu, X, Plane, User, LogOut, Map, Folder, Sun, Moon, DollarSign, Crown, Heart, ArrowRight, ArrowUp, Mail, Home, Info, Sparkles, Ticket, Compass, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import CurrencySelector from './CurrencySelector';
import AlertsPanel from './AlertsPanel';
import TutorialButton from './TutorialButton';
import { cn } from '../lib/utils';
import { IMG } from '../data/travelImages';
import { SITE } from '../lib/site';

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/about', label: 'About', icon: Info },
  { to: '/plan', label: 'Plan Trip', icon: Sparkles },
  { to: '/booking', label: 'Book Travel', icon: Ticket },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/how-it-works', label: 'How It Works', icon: HelpCircle },
];

const ACCOUNT_LINKS = [
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/my-trips', label: 'My Trips', icon: Map },
  { to: '/albums', label: 'Albums', icon: Folder },
  { to: '/expenses', label: 'Expenses', icon: DollarSign },
  { to: '/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/my-subscription', label: 'Subscription', icon: Crown },
];

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { toggleTheme, isLight } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const linkCls = (to) => cn(
    'relative px-3 xl:px-3.5 py-2 rounded-full text-[13px] xl:text-sm font-semibold whitespace-nowrap transition-colors',
    pathname === to
      ? 'bg-primary/10 text-primary'
      : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'
  );

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 px-3 sm:px-6 pointer-events-none"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
      >
        <nav
          aria-label="Main"
          className={cn(
            'pointer-events-auto mx-auto max-w-6xl h-14 md:h-16 rounded-full border flex items-center gap-2 pl-4 pr-2 transition-all duration-300 backdrop-blur-xl',
            scrolled ? 'bg-background shadow-lg shadow-black/10 border-border' : 'bg-background shadow-md shadow-black/10 border-transparent'
          )}
        >
          <Link to="/" className="flex items-center gap-2.5 shrink-0" data-testid="logo-link">
            <span className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center shadow-md shadow-primary/30">
              <Plane className="w-[18px] h-[18px] text-white" />
            </span>
            <span className="text-lg font-extrabold tracking-tight">Bleez<span className="text-primary">.AI</span></span>
          </Link>

          <div className="hidden lg:flex items-center gap-1 mx-auto">
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className={linkCls(l.to)} data-testid={`nav-${l.to.slice(1)}`}>{l.label}</Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-1.5 shrink-0 ml-auto lg:ml-0">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-9 h-9 rounded-full" title={`Switch to ${isLight ? 'dark' : 'light'} mode`} data-testid="theme-toggle">
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            {user ? (
              <>
                <CurrencySelector compact={true} showLabel={false} />
                <TutorialButton />
                <AlertsPanel />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 rounded-full pl-1.5" data-testid="user-menu-trigger">
                      <Avatar className="w-8 h-8">
                        {user.picture ? <AvatarImage src={user.picture} /> : (
                          <AvatarFallback className="bg-primary/15 text-primary text-sm font-bold">{user.name?.charAt(0) || 'U'}</AvatarFallback>
                        )}
                      </Avatar>
                      <span className="text-sm font-semibold max-w-[110px] truncate">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5">
                    {ACCOUNT_LINKS.map((l) => (
                      <DropdownMenuItem key={l.to} onClick={() => navigate(l.to)} className="rounded-xl py-2.5" data-testid={`menu-${l.to.slice(1)}`}>
                        <l.icon className="w-4 h-4 mr-2.5" /> {l.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="rounded-xl py-2.5" data-testid="menu-logout">
                      <LogOut className="w-4 h-4 mr-2.5" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 rounded-full text-sm font-semibold text-foreground/80 hover:bg-foreground/5 transition-colors" data-testid="nav-login">Sign In</Link>
                <Link to="/register" data-testid="nav-register">
                  <Button className="rounded-full px-5 h-10 brand-gradient text-white font-semibold shadow-md shadow-primary/30 hover:brightness-110">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 ml-auto lg:hidden">
            <button onClick={toggleTheme} className="p-2.5 rounded-full hover:bg-foreground/5" aria-label="Toggle theme">
              {isLight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-label="Toggle menu"
              data-testid="mobile-menu-toggle"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </header>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-background overflow-y-auto"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 80px)' }}
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
          data-testid="mobile-menu-overlay"
        >
          <div className="px-4 pb-10 max-w-md mx-auto">
            {user && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-primary/5 border border-primary/15 p-3">
                <Avatar className="w-10 h-10">
                  {user.picture ? <AvatarImage src={user.picture} /> : <AvatarFallback className="bg-primary/15 text-primary font-bold">{user.name?.charAt(0) || 'U'}</AvatarFallback>}
                </Avatar>
                <div className="min-w-0"><p className="font-bold truncate">{user.name}</p><p className="text-xs text-muted-foreground truncate">{user.email}</p></div>
              </div>
            )}
            <nav aria-label="Pages" className="grid gap-1">
              {NAV_LINKS.map((l) => (
                <Link key={l.to} to={l.to} className={cn('flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-base font-semibold transition-colors', pathname === l.to ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25' : 'hover:bg-foreground/5')}>
                  <l.icon className="w-5 h-5" /> {l.label}
                </Link>
              ))}
            </nav>
            <div className="my-4 border-t border-border" />
            {user ? (
              <div className="grid gap-1">
                {ACCOUNT_LINKS.map((l) => (
                  <Link key={l.to} to={l.to} className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[15px] font-medium text-foreground/80 hover:bg-foreground/5">
                    <l.icon className="w-[18px] h-[18px] text-primary" /> {l.label}
                  </Link>
                ))}
                <button onClick={handleLogout} className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[15px] font-medium text-left text-foreground/80 hover:bg-foreground/5">
                  <LogOut className="w-[18px] h-[18px] text-primary" /> Sign out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link to="/login" className="py-3.5 rounded-full border border-border text-center font-semibold">Sign in</Link>
                <Link to="/register" className="py-3.5 rounded-full brand-gradient text-white text-center font-semibold">Get started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const FOOTER_COLUMNS = [
  { title: 'Explore', links: [['/', 'Home'], ['/about', 'About us'], ['/plan', 'Plan a trip'], ['/booking', 'Book travel'], ['/explore', 'Explore'], ['/how-it-works', 'How it works']] },
  { title: 'Support', links: [['/faq', 'FAQs'], ['/help', 'Help center'], ['/contact', 'Contact us'], ['/emergency', 'Emergency numbers'], ['/my-subscription', 'Plans & pricing']] },
  { title: 'Legal', links: [['/privacy', 'Privacy policy'], ['/terms', 'Terms & conditions']] },
];

const FOOTER_DESTINATIONS = ['Paris', 'Kyoto', 'Bali', 'Santorini', 'Rome', 'Swiss Alps'];

export const Footer = () => (
  <footer className="relative mt-auto text-white bg-[#0B0618] overflow-hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
    {/* Call-to-action card */}
    <div className="container-main relative z-10 pt-16 md:pt-24">
      <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] px-6 sm:px-12 py-12 md:py-16 bg-[#2E1065]">
        <img src={IMG.paradise(1600)} alt="" aria-hidden="true" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2E1065]/95 via-[#4C1D95]/80 to-[#0D9488]/50" aria-hidden="true" />
        <div className="relative grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 mb-3">Ready when you are</p>
            <h3 className="text-2xl md:text-4xl font-extrabold leading-tight tracking-tight">Where will you wake up next?</h3>
            <p className="mt-3 text-white/80 max-w-lg">Tell Bleez your dream destination and get a day-by-day itinerary in moments.</p>
          </div>
          <div className="flex flex-wrap md:justify-end gap-3">
            <Link to="/plan" className="inline-flex items-center gap-2 rounded-full bg-white text-[#2E1065] px-7 py-3.5 font-bold hover:bg-white/90 transition-colors">Plan my trip <ArrowRight className="w-4 h-4" /></Link>
            <Link to="/booking" className="inline-flex items-center gap-2 rounded-full glass-panel px-7 py-3.5 font-bold hover:bg-white/20 transition-colors">Search flights</Link>
          </div>
        </div>
      </div>
    </div>

    <div className="relative">
      <div className="mesh-bg opacity-50" aria-hidden="true"><i /></div>
      <div className="container-main relative py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2.2fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
              <span className="w-11 h-11 rounded-2xl brand-gradient flex items-center justify-center shadow-lg shadow-primary/30"><Plane className="w-5 h-5 text-white" /></span>
              <span className="text-2xl font-extrabold tracking-tight">Bleez<span className="text-[#A78BFA]">.AI</span></span>
            </Link>
            <p className="text-white/65 max-w-sm leading-relaxed">Plan smarter and travel better. AI itineraries, flight and hotel search, and support on the road, all in one place.</p>
            {SITE.supportEmail && (
              <a href={`mailto:${SITE.supportEmail}`} className="mt-5 inline-flex items-center gap-2 text-white/85 hover:text-white font-semibold"><Mail className="w-4 h-4 text-[#A78BFA]" /> {SITE.supportEmail}</a>
            )}
            <div className="mt-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40 mb-3">Popular trips</p>
              <div className="flex flex-wrap gap-2">
                {FOOTER_DESTINATIONS.map((d) => (
                  <Link key={d} to="/plan" state={{ destination: d }} className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm text-white/80 hover:bg-white/15 hover:text-white transition-colors">{d}</Link>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {FOOTER_COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-white/40 mb-5">{col.title}</h4>
                <ul className="space-y-3 text-[15px]">
                  {col.links.map(([to, label]) => (
                    <li key={to}><Link to={to} className="text-white/75 hover:text-white inline-flex items-center gap-1 group transition-colors">{label}<ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></Link></li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col-reverse sm:flex-row gap-4 items-start sm:items-center justify-between text-sm text-white/45">
          <div>
            <p>&copy; {new Date().getFullYear()} Bleez. All rights reserved.</p>
            <p className="mt-1">Bookings are completed with the airline, hotel or partner you choose.</p>
          </div>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors">
            Back to top <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </footer>
);
