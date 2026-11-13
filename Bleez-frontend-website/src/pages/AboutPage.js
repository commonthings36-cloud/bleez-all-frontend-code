import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Plane, Hotel, GitCompare, Bell, ShieldAlert, Heart, ArrowRight, ArrowUpRight, Compass, Eye, Lock, Smile,
} from 'lucide-react';
import { Navbar, Footer } from '../components/Layout';
import PageHero from '../components/PageHero';
import useReveal from '../hooks/useReveal';
import { IMG } from '../data/travelImages';

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

const CAPABILITIES = [
  { icon: Sparkles, title: 'AI itineraries', text: 'Day-by-day plans built around your interests, budget and travel style.', to: '/plan', grad: 'from-[#7C3AED] to-[#DB2777]' },
  { icon: Plane, title: 'Flight search', text: 'Direct and connecting options for your dates, with a clear price for each.', to: '/booking', grad: 'from-[#2563EB] to-[#7C3AED]' },
  { icon: Hotel, title: 'Stays, transport & dining', text: 'Find hotels, ways to get around and places to eat in the same search.', to: '/booking', grad: 'from-[#0D9488] to-[#2563EB]' },
  { icon: GitCompare, title: 'Side-by-side compare', text: 'Weigh up your options at a glance and choose with confidence.', to: '/booking-compare', grad: 'from-[#F59E0B] to-[#DB2777]' },
  { icon: Bell, title: 'Travel alerts', text: 'Weather and safety alerts for your trips and your current area.', to: '/alerts', grad: 'from-[#DB2777] to-[#7C3AED]' },
  { icon: ShieldAlert, title: 'Emergency numbers', text: 'Local emergency contacts close at hand wherever you land.', to: '/emergency', grad: 'from-[#EF4444] to-[#F59E0B]' },
];

const PRINCIPLES = [
  { icon: Heart, title: 'Personal', text: 'Every plan starts with you: your pace, your interests, your budget.' },
  { icon: Eye, title: 'Transparent', text: 'Clear prices and honest comparisons. You finish booking with the provider you choose.' },
  { icon: Lock, title: 'Respectful of your data', text: 'Location, calendar and notifications are optional, and you stay in control.' },
  { icon: Smile, title: 'Simple', text: 'One calm place for planning, searching and going, without the tab juggling.' },
];

const AboutPage = () => (
  <div className="min-h-screen flex flex-col" data-testid="about-page">
    <Navbar />
    <PageHero
      image={IMG.alps(1920)}
      eyebrow="About us"
      title="Travel, thoughtfully organised"
      subtitle="Bleez brings planning, searching and support on the road into one place, guided by AI that learns what you love."
      size="lg"
    />

    <main className="flex-1">
      {/* Intro */}
      <section className="container-main py-16 md:py-24 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <Reveal>
          <Eyebrow>What we're building</Eyebrow>
          <h2 className="mt-5 text-3xl md:text-4xl font-extrabold tracking-tight">One companion for <span className="text-primary">the whole journey</span></h2>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Planning a trip usually means a dozen tabs, a spreadsheet and a lot of guesswork. Bleez replaces that with a single, friendly place:
            tell it where you want to go, get an itinerary, compare flights and stays, and keep your trips, photos and spending together.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            When you're away, alerts and local emergency numbers keep you informed, so you can enjoy the trip with a little less worry.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/plan" className="inline-flex items-center gap-2 rounded-full brand-gradient text-white font-bold px-7 py-3.5 hover:brightness-110 transition">Plan a trip <ArrowRight className="w-4 h-4" /></Link>
            <Link to="/how-it-works" className="inline-flex items-center gap-2 rounded-full border border-border bg-card font-bold px-7 py-3.5 hover:border-primary hover:text-primary transition-colors">How it works</Link>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="relative">
            <img src={IMG.kyoto(900)} alt="A quiet street in Kyoto at dusk" loading="lazy" className="w-full h-[400px] md:h-[500px] object-cover rounded-[2rem] shadow-2xl" />
            <img src={IMG.santorini(700)} alt="Whitewashed buildings above the sea in Santorini" loading="lazy" className="absolute -bottom-8 -left-2 md:-left-8 w-1/2 h-44 md:h-56 object-cover rounded-[1.5rem] shadow-2xl border-4 border-background" />
            <div className="absolute top-6 right-6 rounded-2xl bg-white/90 backdrop-blur px-4 py-3 shadow-lg flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center"><Compass className="w-5 h-5 text-white" /></span>
              <span className="text-sm font-bold text-gray-900">Plan. Compare. Go.</span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Capabilities */}
      <section className="py-16 md:py-24 section-glow">
        <div className="container-main relative">
          <Reveal className="max-w-2xl mb-12">
            <Eyebrow>What you can do</Eyebrow>
            <h2 className="mt-5 text-3xl md:text-4xl font-extrabold tracking-tight">Everything a trip needs, <span className="text-primary">in one place</span></h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CAPABILITIES.map((c, i) => (
              <Reveal key={c.title} delay={(i % 3) * 0.08}>
                <Link to={c.to} className="group bento relative block h-full rounded-[1.75rem] border border-border bg-card p-7 overflow-hidden">
                  <span className={`absolute -right-10 -top-10 w-32 h-32 rounded-full bg-gradient-to-br ${c.grad} opacity-15 group-hover:opacity-30 group-hover:scale-125 transition-all duration-500`} aria-hidden="true" />
                  <span className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${c.grad} flex items-center justify-center mb-5 shadow-lg`}><c.icon className="w-6 h-6 text-white" /></span>
                  <h3 className="relative text-xl font-bold mb-2 flex items-center gap-2">{c.title}<ArrowUpRight className="w-4 h-4 text-primary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /></h3>
                  <p className="relative text-muted-foreground leading-relaxed">{c.text}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Photo band */}
      <section className="relative overflow-hidden min-h-[360px] md:min-h-[440px] flex items-center bg-[#0B0618]">
        <img src={IMG.lake(2000)} alt="" aria-hidden="true" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="absolute inset-0 w-full h-full object-cover kenburns" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0618]/85 via-[#0B0618]/45 to-transparent" aria-hidden="true" />
        <div className="container-main relative py-16">
          <Reveal>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white max-w-xl leading-tight">Less juggling.<br /><span className="text-[#FBBF24]">More travelling.</span></h2>
            <p className="mt-4 text-white/80 max-w-md">Spend your time looking forward to the trip, not wrestling with the planning.</p>
          </Reveal>
        </div>
      </section>

      {/* Principles */}
      <section className="relative surface-ink py-16 md:py-24 overflow-hidden">
        <div className="mesh-bg opacity-70" aria-hidden="true"><i /></div>
        <div className="container-main relative">
          <Reveal className="max-w-2xl mb-12">
            <Eyebrow dark>Our principles</Eyebrow>
            <h2 className="mt-5 text-3xl md:text-4xl font-extrabold tracking-tight text-white">What we <span className="text-gradient">stand for</span></h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <div className="h-full rounded-[1.75rem] glass-panel p-7">
                  <span className="w-12 h-12 rounded-2xl brand-gradient flex items-center justify-center mb-5"><p.icon className="w-6 h-6 text-white" /></span>
                  <h3 className="text-xl font-bold text-white mb-2">{p.title}</h3>
                  <p className="text-white/65 leading-relaxed">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-main py-16 md:py-24 text-center">
        <Reveal>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Ready when <span className="text-primary">you are</span></h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Start with a destination, and we'll take it from there.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/plan" className="inline-flex items-center gap-2 rounded-full brand-gradient text-white font-bold px-8 py-4 hover:brightness-110 transition">Plan my trip <ArrowRight className="w-5 h-5" /></Link>
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-border bg-card font-bold px-8 py-4 hover:border-primary hover:text-primary transition-colors">Get in touch</Link>
          </div>
        </Reveal>
      </section>
    </main>
    <Footer />
  </div>
);

export default AboutPage;
