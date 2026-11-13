import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plane, Hotel, Car, Utensils, Mountain, Sparkles, ArrowRight, Search, MapPin, Clock,
  GitCompare, Bell, FileDown, Heart, ShieldAlert, Wand2, SlidersHorizontal, Compass, ArrowUpRight, Check, Plus, Minus,
} from 'lucide-react';
import { CampaignBanner } from '../components/CampaignBanner';
import HeroVideo from '../components/HeroVideo';
import { Navbar, Footer } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import useReveal from '../hooks/useReveal';
import { IMG, DESTINATIONS as PHOTO_DESTINATIONS, EXPERIENCES } from '../data/travelImages';
import { FAQ_GROUPS } from '../data/faqs';

const Reveal = ({ children, delay = 0, className = '' }) => {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} ${className}`} style={{ '--reveal-delay': `${delay}s` }}>
      {children}
    </div>
  );
};

const Eyebrow = ({ children, dark }) => (
  <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] ${dark ? 'glass-panel text-white/85' : 'bg-primary/10 text-primary'}`}>
    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" /> {children}
  </span>
);

const SERVICES = [
  { icon: Plane, label: 'Flights' },
  { icon: Hotel, label: 'Hotels' },
  { icon: Car, label: 'Cabs' },
  { icon: Utensils, label: 'Dining' },
  { icon: Mountain, label: 'Activities' },
];

const QUICK_DESTINATIONS = ['Paris', 'Kyoto', 'Bali', 'Santorini', 'Rome'];

// Illustrative preview of the planner output. It shows the shape of an itinerary, not real data.
const PREVIEW_DAY = [
  { time: '09:00', title: 'Morning at the old town', tag: 'Culture' },
  { time: '13:00', title: 'Lunch at a local favourite', tag: 'Food' },
  { time: '16:30', title: 'Sunset viewpoint walk', tag: 'Nature' },
];

const FEATURES = [
  { icon: Wand2, title: 'AI itineraries in seconds', text: 'Share where, when, budget and interests. Get a day-by-day plan with places, timings and local tips, then regenerate until it feels right.', span: 'lg:col-span-2 lg:row-span-2', tone: 'from-[#7C3AED] to-[#4C1D95] text-white', big: true },
  { icon: GitCompare, title: 'Compare before you book', text: 'Search flights and hotels and see every option side by side with a clear price breakdown.', span: '', tone: 'bg-card border border-border' },
  { icon: Bell, title: 'Alerts on the road', text: 'Weather and safety alerts for your trips and your current area.', span: '', tone: 'bg-card border border-border' },
  { icon: FileDown, title: 'Take it offline', text: 'Export any itinerary as a polished PDF to keep with you.', span: '', tone: 'bg-card border border-border' },
  { icon: ShieldAlert, title: 'Emergency numbers', text: 'Local emergency contacts one tap away, wherever you are.', span: '', tone: 'bg-card border border-border' },
  { icon: Heart, title: 'Wishlist & albums', text: 'Save places you love and keep trip photos and expenses together.', span: 'sm:col-span-2 lg:col-span-4', tone: 'bg-card border border-border' },
];

const STEPS = [
  { icon: SlidersHorizontal, title: 'Tell us your style', text: 'Destination, dates, budget and what you love doing.' },
  { icon: Sparkles, title: 'Get your itinerary', text: 'A complete day-by-day plan, tailored to you in moments.' },
  { icon: Compass, title: 'Search, compare, go', text: 'Find flights and stays, compare options and travel with support.' },
];

const FEATURED = ['paris', 'kyoto', 'santorini', 'bali', 'rome', 'swiss-alps'];

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [destination, setDestination] = useState('');
  const [faq, setFaq] = useState(0);
  const firstName = user?.name?.split(' ')[0];

  const plan = (name) => navigate('/plan', { state: { destination: (name ?? destination).trim() || undefined } });

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" data-testid="landing-page">
      <Navbar />

      {/* Hero */}
      <section className="relative surface-ink min-h-[min(100dvh,860px)] flex items-center pt-28 pb-16 overflow-hidden">
        <div className="mesh-bg" aria-hidden="true"><i /></div>
        <img src={IMG.wander(2200)} alt="" aria-hidden="true" fetchpriority="high" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="absolute inset-0 w-full h-full object-cover kenburns" />
        <HeroVideo />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0618]/80 via-[#0B0618]/35 to-transparent" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0618] via-transparent to-[#0B0618]/40" aria-hidden="true" />

        <div className="container-main relative z-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          <div>
            <div className="mb-5"><CampaignBanner placement="HOME_HERO" /></div>
            <Eyebrow dark>{firstName ? `Welcome back, ${firstName}` : 'AI-powered trip planning'}</Eyebrow>
            <h1 className="mt-6 text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.08] tracking-tight text-white fade-in">
              Travel planning,<br /><span className="text-gradient">reimagined.</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-white/70 max-w-xl leading-relaxed fade-in" style={{ animationDelay: '0.1s' }}>
              Tell Bleez where you want to go. Get a complete itinerary in seconds, compare flights and hotels, and travel with alerts and support built in.
            </p>

            <form
              onSubmit={(e) => { e.preventDefault(); plan(); }}
              role="search"
              aria-label="Plan a trip"
              className="mt-9 flex flex-col sm:flex-row gap-2 p-2 rounded-[1.75rem] glass-panel max-w-xl fade-in"
              style={{ animationDelay: '0.2s' }}
            >
              <label className="flex items-center gap-3 flex-1 px-4 py-3 rounded-2xl bg-white/95 text-gray-900">
                <Search className="w-5 h-5 text-primary shrink-0" />
                <span className="sr-only">Where do you want to go?</span>
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Where do you want to go?"
                  className="w-full bg-transparent outline-none placeholder:text-gray-500"
                  data-testid="hero-search-destination"
                />
              </label>
              <button type="submit" className="rounded-2xl px-7 py-3.5 brand-gradient text-white font-bold inline-flex items-center justify-center gap-2 hover:brightness-110 transition" data-testid="hero-plan-btn">
                Plan my trip <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm fade-in" style={{ animationDelay: '0.3s' }}>
              <span className="text-white/50 mr-1">Popular:</span>
              {QUICK_DESTINATIONS.map((d) => (
                <button key={d} type="button" onClick={() => plan(d)} className="rounded-full px-3.5 py-1.5 glass-panel text-white/85 hover:bg-white/20 transition-colors">{d}</button>
              ))}
            </div>
          </div>

          {/* Sample itinerary preview */}
          <div className="relative hidden lg:block h-[520px]" aria-hidden="true">
            <div className="absolute right-0 top-4 w-[400px] rounded-[2rem] glass-panel p-6 shadow-2xl shadow-black/40 float-slow">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">Sample itinerary</p>
                  <p className="text-xl font-bold text-white">Day 1 · Your destination</p>
                </div>
                <span className="w-10 h-10 rounded-2xl brand-gradient flex items-center justify-center"><Sparkles className="w-5 h-5 text-white" /></span>
              </div>
              <ol className="space-y-3">
                {PREVIEW_DAY.map((s) => (
                  <li key={s.time} className="flex items-center gap-4 rounded-2xl bg-white/10 px-4 py-3.5">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#5EEAD4] w-16 shrink-0"><Clock className="w-3.5 h-3.5" />{s.time}</span>
                    <span className="flex-1 text-sm font-semibold text-white">{s.title}</span>
                    <span className="text-[11px] font-semibold rounded-full bg-white/15 px-2.5 py-1 text-white/80">{s.tag}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="absolute left-0 bottom-10 w-[250px] rounded-3xl glass-panel p-4 shadow-xl shadow-black/30 float-slower">
              <p className="flex items-center gap-2 text-sm font-bold text-white"><GitCompare className="w-4 h-4 text-[#A78BFA]" /> Compare options</p>
              <p className="mt-1 text-xs text-white/60">Flights and stays side by side, with a clear price breakdown.</p>
            </div>
            <div className="absolute right-6 bottom-0 rounded-full glass-panel px-5 py-3 text-sm font-semibold text-white float-slow flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#F59E0B]" /> Travel alerts for your trip
            </div>
          </div>
        </div>
      </section>

      {/* Scrolling strip */}
      <section className="surface-ink border-y border-white/10 overflow-hidden marquee" aria-label="What Bleez covers">
        <div className="marquee-track py-5">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center shrink-0" aria-hidden={dup === 1}>
              {[...SERVICES.map((x) => ({ t: x.label, icon: x.icon })), ...['Paris', 'Kyoto', 'Bali', 'Santorini', 'Rome', 'Swiss Alps'].map((t) => ({ t, icon: MapPin }))].map((x, i) => (
                <span key={`${dup}-${i}`} className="inline-flex items-center gap-3 px-8 text-white/80 font-semibold text-lg whitespace-nowrap">
                  <x.icon className="w-5 h-5 text-[#A78BFA]" /> {x.t}
                  <span className="ml-8 w-1.5 h-1.5 rounded-full bg-white/25" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Features bento */}
      <section id="features" className="py-20 md:py-28">
        <div className="container-main">
          <Reveal className="max-w-2xl mb-12">
            <Eyebrow>Everything in one place</Eyebrow>
            <h2 className="mt-5 text-3xl md:text-4xl font-extrabold tracking-tight">The whole trip, <span className="text-primary">beautifully organised</span></h2>
            <p className="mt-3 text-base text-muted-foreground">From the first idea to the last day on the road, Bleez keeps every step simple.</p>
          </Reveal>
          <div className="grid gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[minmax(190px,auto)]">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.06} className={f.span}>
                <div className={`bento h-full rounded-[1.75rem] p-7 md:p-8 flex flex-col justify-between ${f.big ? `bg-gradient-to-br ${f.tone}` : f.tone}`}>
                  <span className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${f.big ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                    <f.icon className="w-6 h-6" />
                  </span>
                  <div>
                    <h3 className={`font-bold mb-2 ${f.big ? 'text-2xl md:text-3xl' : 'text-lg'}`}>{f.title}</h3>
                    <p className={`leading-relaxed ${f.big ? 'text-white/80 text-lg max-w-md' : 'text-muted-foreground'}`}>{f.text}</p>
                    {f.big && (
                      <Link to="/plan" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white text-[#2E1065] px-6 py-3 font-bold hover:bg-white/90 transition-colors">
                        Try the planner <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Travel your way: photo mosaic */}
      <section className="pb-20 md:pb-28 section-glow">
        <div className="container-main relative">
          <Reveal className="max-w-2xl mb-12">
            <Eyebrow>Travel your way</Eyebrow>
            <h2 className="mt-5 text-3xl md:text-4xl font-extrabold tracking-tight">Every kind of journey, <span className="text-primary">planned for you</span></h2>
            <p className="mt-3 text-base text-muted-foreground">Pick a mood and let the planner build around it.</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-4 md:auto-rows-[230px] gap-4 md:gap-5">
            {EXPERIENCES.map((x, i) => (
              <Reveal key={x.label} delay={i * 0.06} className={`${i === EXPERIENCES.length - 1 ? '' : x.span} h-56 md:h-auto`}>
                <button onClick={() => navigate('/plan', { state: { interest: x.to } })} className="group relative w-full h-full overflow-hidden rounded-[1.75rem] text-left bg-[#2E1065]">
                  <img src={x.img(1100)} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0618]/85 via-[#0B0618]/10 to-transparent" />
                  <div className="absolute bottom-0 p-6 text-white">
                    <h3 className="text-xl md:text-2xl font-extrabold">{x.label}</h3>
                    <p className="text-sm text-white/80">{x.sub}</p>
                  </div>
                  <span className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ArrowUpRight className="w-5 h-5 text-white" /></span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative surface-ink py-20 md:py-28 overflow-hidden">
        <div className="mesh-bg opacity-70" aria-hidden="true"><i /></div>
        <div className="container-main relative">
          <Reveal className="max-w-2xl mb-14">
            <Eyebrow dark>How it works</Eyebrow>
            <h2 className="mt-5 text-3xl md:text-4xl font-extrabold tracking-tight text-white">From idea to itinerary in <span className="text-gradient">three steps</span></h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.1}>
                <div className="relative h-full rounded-[1.75rem] glass-panel p-8 overflow-hidden">
                  <span className="absolute -right-2 -top-6 text-[9rem] font-extrabold leading-none text-white/[0.06] select-none" aria-hidden="true">{i + 1}</span>
                  <span className="w-12 h-12 rounded-2xl brand-gradient flex items-center justify-center mb-6"><s.icon className="w-6 h-6 text-white" /></span>
                  <h3 className="text-2xl font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-white/65 leading-relaxed">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10"><Link to="/how-it-works" className="inline-flex items-center gap-2 font-semibold text-[#C4B5FD] hover:text-white transition-colors">See the full walkthrough <ArrowRight className="w-4 h-4" /></Link></Reveal>
        </div>
      </section>

      {/* Destinations */}
      <section id="destinations" className="py-20 md:py-28">
        <div className="container-main">
          <Reveal className="flex flex-wrap items-end justify-between gap-4 mb-12">
            <div className="max-w-2xl">
              <Eyebrow>Get inspired</Eyebrow>
              <h2 className="mt-5 text-3xl md:text-4xl font-extrabold tracking-tight">Where to <span className="text-primary">next?</span></h2>
            </div>
            <Link to="/explore" className="inline-flex items-center gap-2 font-semibold text-primary hover:gap-3 transition-all">See all destinations <ArrowRight className="w-4 h-4" /></Link>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURED.map((id) => PHOTO_DESTINATIONS.find((x) => x.id === id)).filter(Boolean).map((d, i) => (
              <Reveal key={d.id} delay={(i % 3) * 0.08}>
                <button
                  onClick={() => plan(d.name)}
                  aria-label={`Plan a trip to ${d.name}`}
                  className="group bento relative block w-full aspect-[4/5] overflow-hidden rounded-[1.75rem] text-left text-white bg-[#2E1065]"
                >
                  <img src={d.img(900)} alt={`${d.name}, ${d.country}`} loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0618]/90 via-[#0B0618]/15 to-transparent" />
                  <div className="absolute top-5 left-5 flex gap-2">
                    {d.tags.map((t) => <span key={t} className="text-xs font-semibold rounded-full bg-black/25 backdrop-blur px-3 py-1">{t}</span>)}
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-6">
                    <p className="flex items-center gap-1.5 text-sm text-white/85 mb-1"><MapPin className="w-3.5 h-3.5" />{d.country}</p>
                    <h3 className="text-2xl font-extrabold mb-1">{d.name}</h3>
                    <p className="text-white/85 text-sm line-clamp-2 mb-3">{d.blurb}</p>
                    <span className="inline-flex items-center gap-1.5 font-bold text-[#FBBF24] group-hover:gap-3 transition-all">Plan this trip <ArrowUpRight className="w-4 h-4" /></span>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why Bleez */}
      <section className="pb-20 md:pb-28">
        <div className="container-main grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <Reveal>
            <div className="relative">
              <img src={IMG.bali(1000)} alt="Rice terraces in Bali" loading="lazy" className="w-full h-[420px] md:h-[520px] object-cover rounded-[2rem] shadow-2xl" />
              <img src={IMG.kyoto(700)} alt="A quiet street in Kyoto at dusk" loading="lazy" className="absolute -bottom-8 -right-2 md:-right-8 w-1/2 h-48 md:h-60 object-cover rounded-[1.5rem] shadow-2xl border-4 border-background" />
              <div className="absolute top-6 left-6 rounded-2xl bg-white/90 backdrop-blur px-4 py-3 shadow-lg flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center"><Sparkles className="w-5 h-5 text-white" /></span>
                <span className="text-sm font-bold text-gray-900">Plan in minutes</span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <Eyebrow>Why Bleez</Eyebrow>
            <h2 className="mt-5 text-3xl md:text-4xl font-extrabold tracking-tight">Built around how you <span className="text-primary">really travel</span></h2>
            <p className="mt-4 text-base text-muted-foreground max-w-lg">One calm place for the planning, the searching and the going, so you spend less time juggling tabs and more time looking forward.</p>
            <ul className="mt-8 space-y-4">
              {[
                ['Personal by design', 'Itineraries shaped by your interests, budget and pace.'],
                ['Clear, honest prices', 'Compare options side by side and book with the provider.'],
                ['Support on the road', 'Travel alerts and local emergency numbers wherever you are.'],
                ['Everything saved', 'Trips, wishlists, albums and expenses stay together.'],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-4">
                  <span className="mt-0.5 w-7 h-7 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center"><Check className="w-4 h-4" /></span>
                  <span><span className="block font-bold">{t}</span><span className="text-muted-foreground">{d}</span></span>
                </li>
              ))}
            </ul>
            <Link to="/about" className="mt-9 inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 font-bold hover:border-primary hover:text-primary transition-colors">About Bleez <ArrowRight className="w-4 h-4" /></Link>
          </Reveal>
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="pb-20 md:pb-28">
        <div className="container-main grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16">
          <Reveal>
            <Eyebrow>Questions</Eyebrow>
            <h2 className="mt-5 text-3xl md:text-4xl font-extrabold tracking-tight">Good to <span className="text-primary">know</span></h2>
            <p className="mt-3 text-muted-foreground">Quick answers to what travellers ask most.</p>
            <Link to="/faq" className="mt-6 inline-flex items-center gap-2 font-semibold text-primary hover:gap-3 transition-all">See all FAQs <ArrowRight className="w-4 h-4" /></Link>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-[1.75rem] border border-border bg-card divide-y divide-border">
              {FAQ_GROUPS.flatMap((g) => g.items).slice(0, 5).map((f, i) => (
                <button key={f.q} type="button" onClick={() => setFaq(faq === i ? -1 : i)} aria-expanded={faq === i} className="w-full text-left px-6 py-5">
                  <span className="flex items-center justify-between gap-4 font-bold">{f.q}{faq === i ? <Minus className="w-5 h-5 text-primary shrink-0" /> : <Plus className="w-5 h-5 text-primary shrink-0" />}</span>
                  {faq === i && <span className="block mt-3 text-muted-foreground leading-relaxed font-normal">{f.a}</span>}
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-3 sm:px-6 pb-16 md:pb-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.25rem] max-w-6xl mx-auto px-8 py-16 md:py-24 text-center bg-[#0B0618]">
            <img src={IMG.lagoon(1800)} alt="" aria-hidden="true" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#2E1065]/90 via-[#4C1D95]/70 to-[#0D9488]/50" aria-hidden="true" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto">Your next trip is one <span className="text-[#FBBF24]">question</span> away</h2>
              <p className="mt-5 text-lg text-white/85 max-w-xl mx-auto">Create a free account to save itineraries, build a wishlist and keep everything in one place.</p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Link to="/plan" className="rounded-full bg-white text-[#2E1065] font-bold px-9 py-4 inline-flex items-center gap-2 hover:bg-white/90 transition" data-testid="cta-plan-btn">Plan my trip <ArrowRight className="w-5 h-5" /></Link>
                <Link to="/register" className="rounded-full glass-panel text-white font-bold px-9 py-4 hover:bg-white/20 transition-colors">Create free account</Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
