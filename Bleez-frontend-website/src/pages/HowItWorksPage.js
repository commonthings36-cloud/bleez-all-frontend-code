import React from 'react';
import { Link } from 'react-router-dom';
import {
  SlidersHorizontal, Sparkles, Plane, GitCompare, FileDown, Bell, ArrowRight, Check, Clock, MapPin, Hotel, Car, Utensils,
  ShieldAlert, Compass, Plus, Minus, TrendingDown, Heart, Wallet, Image as ImageIcon,
} from 'lucide-react';
import { Navbar, Footer } from '../components/Layout';
import PageHero from '../components/PageHero';
import useReveal from '../hooks/useReveal';
import { IMG } from '../data/travelImages';
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

// Small glass "app preview" cards that sit on top of each step's photo. They illustrate the feature; they are not real data.
const Chip = ({ icon: Icon, children, tone = 'text-white' }) => (
  <span className="inline-flex items-center gap-2 rounded-full bg-white/90 text-gray-900 px-3.5 py-2 text-sm font-semibold shadow-lg">
    <Icon className={`w-4 h-4 ${tone === 'text-white' ? 'text-primary' : tone}`} /> {children}
  </span>
);

const PreviewForm = () => (
  <div className="rounded-3xl bg-white/90 backdrop-blur p-4 shadow-2xl text-gray-900 w-[270px]">
    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3">Your trip</p>
    {[[MapPin, 'Destination'], [Clock, 'Dates'], [Wallet, 'Budget'], [Heart, 'Interests']].map(([Icon, label]) => (
      <div key={label} className="flex items-center gap-3 rounded-xl bg-violet-50 px-3 py-2.5 mb-2 last:mb-0">
        <Icon className="w-4 h-4 text-primary" /><span className="text-sm font-semibold flex-1">{label}</span><Check className="w-4 h-4 text-emerald-500" />
      </div>
    ))}
  </div>
);

const PreviewDay = () => (
  <div className="rounded-3xl bg-white/90 backdrop-blur p-4 shadow-2xl text-gray-900 w-[290px]">
    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3">Day 1</p>
    {[['09:00', 'Morning at the old town'], ['13:00', 'Lunch at a local favourite'], ['16:30', 'Sunset viewpoint walk']].map(([t, l]) => (
      <div key={t} className="flex items-center gap-3 rounded-xl bg-violet-50 px-3 py-2.5 mb-2 last:mb-0">
        <span className="text-xs font-bold text-primary w-11">{t}</span><span className="text-sm font-semibold">{l}</span>
      </div>
    ))}
  </div>
);

const PreviewSearch = () => (
  <div className="flex flex-wrap gap-2 max-w-[290px]">
    <Chip icon={Plane}>Flights</Chip><Chip icon={Hotel}>Hotels</Chip><Chip icon={Car}>Transport</Chip><Chip icon={Utensils}>Dining</Chip>
  </div>
);

const PreviewCompare = () => (
  <div className="rounded-3xl bg-white/90 backdrop-blur p-4 shadow-2xl text-gray-900 w-[270px]">
    <p className="flex items-center gap-2 text-sm font-bold mb-3"><TrendingDown className="w-4 h-4 text-primary" /> Lowest price first</p>
    {['Option A', 'Option B', 'Option C'].map((o, i) => (
      <div key={o} className={`flex items-center justify-between rounded-xl px-3 py-2.5 mb-2 last:mb-0 ${i === 0 ? 'bg-violet-100 ring-1 ring-primary/30' : 'bg-gray-100'}`}>
        <span className="text-sm font-semibold">{o}</span><span className="text-xs font-bold text-primary">{i === 0 ? 'Best price' : 'View deal'}</span>
      </div>
    ))}
  </div>
);

const PreviewTake = () => (
  <div className="flex flex-wrap gap-2 max-w-[290px]">
    <Chip icon={FileDown}>PDF export</Chip><Chip icon={Heart}>Wishlist</Chip><Chip icon={ImageIcon}>Albums</Chip><Chip icon={Wallet}>Expenses</Chip>
  </div>
);

const PreviewAlerts = () => (
  <div className="flex flex-col gap-2 items-start">
    <Chip icon={Bell} tone="text-amber-500">Alerts for your trip</Chip>
    <Chip icon={ShieldAlert} tone="text-rose-500">Local emergency numbers</Chip>
  </div>
);

const STEPS = [
  {
    icon: SlidersHorizontal, title: 'Tell us how you like to travel', image: IMG.kyoto, Preview: PreviewForm,
    text: 'Share where you want to go, your dates, budget and what you love doing. The more you tell us, the better the plan fits.',
    points: ['Add up to 5 cities for a multi-city trip', 'Travelling with family or for business? Say so', 'Your saved profile pre-fills your preferences'],
    cta: { to: '/plan', label: 'Open the planner' },
  },
  {
    icon: Sparkles, title: 'Get a day-by-day itinerary', image: IMG.santorini, Preview: PreviewDay,
    text: 'Receive a complete plan with places, timings and local tips. Not quite right? Regenerate it, or save it to My Trips.',
    points: ['Built around your interests and pace', 'Regenerate until it feels right', 'Business trips plan around your meetings'],
    cta: { to: '/explore', label: 'Browse destinations' },
  },
  {
    icon: Plane, title: 'Search flights, stays and more', image: IMG.plane, Preview: PreviewSearch,
    text: 'Look up flights, hotels, transport and places to eat for your dates, with a clear price for every option.',
    points: ['One-way or round trip, direct-only filter', 'Hotels with check-in, check-out and rooms', 'Prices follow your chosen currency'],
    cta: { to: '/booking', label: 'Search travel' },
  },
  {
    icon: GitCompare, title: 'Compare, then book with confidence', image: IMG.resort, Preview: PreviewCompare,
    text: 'Weigh options side by side, pick the one that suits you and continue with the provider to complete your booking securely.',
    points: ['Lowest price shown first', 'Card details are entered with the provider', 'No hidden steps on our side'],
    cta: { to: '/booking-compare', label: 'Compare options' },
  },
  {
    icon: FileDown, title: 'Take it with you', image: IMG.alps, Preview: PreviewTake,
    text: 'Export your itinerary as a PDF and keep your trips, wishlist, albums and expenses together in one place.',
    points: ['Polished PDF itineraries', 'Save places you love to your wishlist', 'Track what you spend on every trip'],
    cta: { to: '/my-trips', label: 'See My Trips' },
  },
  {
    icon: Bell, title: 'Stay informed on the road', image: IMG.lagoon, Preview: PreviewAlerts,
    text: 'Get alerts for your trips and current area, and find local emergency numbers whenever you need them.',
    points: ['Weather and safety alerts', 'Choose which alerts you want', 'Emergency contacts one tap away'],
    cta: { to: '/alerts', label: 'View alerts' },
  },
];

const Step = ({ step, index }) => {
  const flip = index % 2 === 1;
  const { Preview } = step;
  return (
    <Reveal className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
      <div className={flip ? 'lg:order-2' : ''}>
        <div className="flex items-center gap-4 mb-5">
          <span className="text-6xl md:text-7xl font-extrabold leading-none text-primary/15 select-none" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <span className="w-12 h-12 rounded-2xl brand-gradient flex items-center justify-center shadow-lg shadow-primary/30"><step.icon className="w-6 h-6 text-white" /></span>
        </div>
        <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">{step.title}</h3>
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-5 max-w-xl">{step.text}</p>
        <ul className="space-y-2.5 mb-6">
          {step.points.map((p) => (
            <li key={p} className="flex items-start gap-3"><span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center"><Check className="w-3 h-3" /></span><span>{p}</span></li>
          ))}
        </ul>
        <Link to={step.cta.to} className="inline-flex items-center gap-2 font-bold text-primary hover:gap-3 transition-all">{step.cta.label} <ArrowRight className="w-4 h-4" /></Link>
      </div>

      <div className={flip ? 'lg:order-1' : ''}>
        <div className="relative h-[300px] sm:h-[380px] rounded-[2rem] overflow-hidden bg-[#2E1065] shadow-2xl">
          <img src={step.image(1100)} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0618]/60 via-transparent to-[#0B0618]/10" aria-hidden="true" />
          <div className={`absolute bottom-5 ${flip ? 'left-5' : 'right-5'} float-slow`} aria-hidden="true"><Preview /></div>
          <span className="absolute top-4 left-4 rounded-full glass-panel px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white">Step {index + 1}</span>
        </div>
      </div>
    </Reveal>
  );
};

const SUMMARY = [
  { icon: Compass, title: 'Plan', text: 'Describe your trip and get an itinerary in moments.', grad: 'from-[#7C3AED] to-[#DB2777]' },
  { icon: GitCompare, title: 'Compare', text: 'Search flights and stays and weigh the options.', grad: 'from-[#0D9488] to-[#2563EB]' },
  { icon: Bell, title: 'Go', text: 'Travel with alerts, emergency numbers and everything saved.', grad: 'from-[#F59E0B] to-[#EF4444]' },
];

const HowItWorksPage = () => {
  const [open, setOpen] = React.useState(0);
  const faqs = FAQ_GROUPS.flatMap((g) => g.items).slice(0, 4);
  return (
    <div className="min-h-screen flex flex-col" data-testid="how-it-works-page">
      <Navbar />
      <PageHero
        image={IMG.bali(1920)}
        eyebrow="How it works"
        title="From idea to itinerary in minutes"
        subtitle="Plan with AI, compare your options, and travel with support at every step."
        size="lg"
      >
        <div className="flex flex-wrap gap-2">
          {['Plan', 'Compare', 'Go'].map((t, i) => (
            <span key={t} className="inline-flex items-center gap-2 rounded-full glass-panel px-4 py-2 text-sm font-bold text-white">
              <span className="w-5 h-5 rounded-full bg-[#F59E0B] text-[#2E1065] text-xs flex items-center justify-center">{i + 1}</span>{t}
            </span>
          ))}
        </div>
      </PageHero>

      <main className="flex-1">
        <section className="container-main py-16 md:py-24 space-y-20 md:space-y-28">
          {STEPS.map((s, i) => <Step key={s.title} step={s} index={i} />)}
        </section>

        <section className="relative surface-ink py-16 md:py-24 overflow-hidden">
          <div className="mesh-bg opacity-70" aria-hidden="true"><i /></div>
          <div className="container-main relative">
            <Reveal className="max-w-2xl mb-12">
              <Eyebrow dark>In short</Eyebrow>
              <h2 className="mt-5 text-3xl md:text-4xl font-extrabold tracking-tight text-white">Plan it. Compare it. <span className="text-gradient">Go.</span></h2>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-5">
              {SUMMARY.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.1}>
                  <div className="h-full rounded-[1.75rem] glass-panel p-8">
                    <span className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.grad} flex items-center justify-center mb-6 shadow-lg`}><s.icon className="w-7 h-7 text-white" /></span>
                    <h3 className="text-2xl font-extrabold text-white mb-2">{s.title}</h3>
                    <p className="text-white/65 leading-relaxed">{s.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="container-main py-16 md:py-24 grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16">
          <Reveal>
            <Eyebrow>Questions</Eyebrow>
            <h2 className="mt-5 text-3xl md:text-4xl font-extrabold tracking-tight">Still <span className="text-primary">wondering?</span></h2>
            <p className="mt-3 text-muted-foreground">A few quick answers. There are more in the FAQ.</p>
            <Link to="/faq" className="mt-6 inline-flex items-center gap-2 font-semibold text-primary hover:gap-3 transition-all">All FAQs <ArrowRight className="w-4 h-4" /></Link>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-[1.75rem] border border-border bg-card divide-y divide-border">
              {faqs.map((f, i) => (
                <button key={f.q} type="button" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} className="w-full text-left px-6 py-5">
                  <span className="flex items-center justify-between gap-4 font-bold">{f.q}{open === i ? <Minus className="w-5 h-5 text-primary shrink-0" /> : <Plus className="w-5 h-5 text-primary shrink-0" />}</span>
                  {open === i && <span className="block mt-3 text-muted-foreground leading-relaxed font-normal">{f.a}</span>}
                </button>
              ))}
            </div>
          </Reveal>
        </section>

        <section className="px-3 sm:px-6 pb-16 md:pb-24">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2.25rem] max-w-6xl mx-auto px-8 py-14 md:py-20 text-center bg-[#2E1065]">
              <img src={IMG.paradise(1800)} alt="" aria-hidden="true" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#2E1065]/90 via-[#4C1D95]/70 to-[#0D9488]/50" aria-hidden="true" />
              <div className="relative">
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white max-w-2xl mx-auto">Ready to <span className="text-[#FBBF24]">start?</span></h2>
                <p className="mt-4 text-lg text-white/85 max-w-xl mx-auto">Create a free account to save trips, build a wishlist and keep everything in sync.</p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link to="/register" className="rounded-full bg-white text-[#2E1065] font-bold px-8 py-4 hover:bg-white/90 transition">Create free account</Link>
                  <Link to="/plan" className="rounded-full glass-panel text-white font-bold px-8 py-4 hover:bg-white/20 transition-colors">Try the planner</Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorksPage;
