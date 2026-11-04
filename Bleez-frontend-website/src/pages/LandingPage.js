import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Plane, MapPin, Sparkles, ChevronRight, Globe, Shield, Zap, Users,
  ArrowRight, Hotel, Car, Utensils, Mountain, Heart, Download,
  Search, Calendar, Wallet, Compass, Wand2, Phone,
} from 'lucide-react';
import { CampaignBanner } from '../components/CampaignBanner';
import { Navbar, Footer } from '../components/Layout';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import useReveal from '../hooks/useReveal';
import { IMG, DESTINATIONS, EXPERIENCES, FALLBACK_IMG } from '../data/travelImages';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const onImgError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = FALLBACK_IMG;
};

const Reveal = ({ children, delay = 0, className = '' }) => {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}s` }}
    >
      {children}
    </div>
  );
};

const SectionHead = ({ eyebrow, title, action }) => (
  <div className="flex items-end justify-between gap-4 mb-8 md:mb-12">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">{eyebrow}</p>
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{title}</h2>
    </div>
    {action}
  </div>
);

const categories = [
  { icon: Plane, label: 'Flights', sub: 'Find flights', to: '/booking' },
  { icon: Hotel, label: 'Hotel', sub: 'Discover stays', to: '/booking' },
  { icon: Car, label: 'Cabs', sub: 'Rides & transfers', to: '/booking' },
  { icon: Utensils, label: 'Restaurant', sub: 'Find food spots', to: '/booking' },
  { icon: Mountain, label: 'Activities', sub: 'Tours & adventure', to: '/plan' },
];

const features = [
  { icon: Sparkles, title: 'AI-Powered Planning', description: 'Tell us your interests and budget. Get a day-by-day itinerary built around how you like to travel.' },
  { icon: Globe, title: 'Global Coverage', description: 'Curated ideas and hidden gems across destinations worldwide, from big cities to quiet coasts.' },
  { icon: Shield, title: 'Compare Before You Book', description: 'Jump to trusted booking platforms for flights, hotels and activities, all from one place.' },
  { icon: Zap, title: 'Live Travel Support', description: 'Alerts, currency tools and an AI assistant to help while you are on the road.' },
  { icon: Calendar, title: 'Calendar & Location Smart', description: 'Plans fit around your calendar, and nearby suggestions follow where you are.' },
  { icon: Heart, title: 'Wishlist & Bookings', description: 'Save places you love and keep every booking, receipt and e-ticket in one place.' },
  { icon: Phone, title: 'Emergency Contacts', description: 'Quick access to local emergency numbers for the places you visit.' },
  { icon: Users, title: 'Guest Friendly', description: 'Browse as a guest. Sign up when you are ready to see prices and book.' },
];

const tripTypes = [
  { icon: Heart, label: 'Romantic' },
  { icon: Users, label: 'Family' },
  { icon: Mountain, label: 'Adventure' },
  { icon: Utensils, label: 'Culinary' },
  { icon: Hotel, label: 'Luxury' },
  { icon: Car, label: 'Road Trip' },
];

const steps = [
  { icon: Compass, title: 'Pick a destination', text: 'Search anywhere, or start from a popular idea.' },
  { icon: Wand2, title: 'Let AI plan it', text: 'Get a personalized itinerary in seconds.' },
  { icon: Plane, title: 'Book and go', text: 'Compare options, save your trip and travel with confidence.' },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [apiDestinations, setApiDestinations] = useState([]);
  const [search, setSearch] = useState({ destination: '', date: '', budget: '' });

  useEffect(() => {
    let isMounted = true;
    axios
      .get(`${API}/destinations/popular`)
      .then((res) => {
        if (isMounted && Array.isArray(res.data)) setApiDestinations(res.data);
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Use backend destinations when available, otherwise the curated set.
  const destinations = apiDestinations.length > 0
    ? apiDestinations.slice(0, 6).map((d) => ({
        id: d.id,
        name: d.name,
        country: d.country,
        blurb: d.description,
        days: '',
        tags: d.best_for?.slice(0, 2) || [],
        src: d.image,
      }))
    : DESTINATIONS.map((d) => ({ ...d, src: d.img(800) }));

  const submitSearch = (e) => {
    e.preventDefault();
    navigate('/plan', { state: { destination: search.destination.trim() || undefined } });
  };

  const firstName = user?.name?.split(' ')[0];

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" data-testid="landing-page">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[100dvh] flex items-center pt-20">
        <img
          src={IMG.maldives(1920)}
          alt="Overwater villas over turquoise water in the Maldives"
          className="absolute inset-0 w-full h-full object-cover"
          onError={onImgError}
          fetchpriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a0e4d]/70 via-[#2E1065]/50 to-[#1c0838]/90" />

        <div className="container-main relative z-10 py-10 md:py-16">
          <div className="max-w-3xl">
            <div className="mb-5"><CampaignBanner placement="HOME_HERO" /></div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E8A33D] mb-4 fade-in">
              {firstName ? `Welcome back, ${firstName}` : 'Your AI travel companion'}
            </p>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05] text-white mb-5 fade-in" style={{ animationDelay: '0.1s' }}>
              Discover places that <span className="text-[#E8A33D]">stay with you</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/85 max-w-xl mb-8 fade-in" style={{ animationDelay: '0.2s' }}>
              Create a personalized trip in seconds with AI. From iconic landmarks to hidden gems,
              planned around your interests and budget.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10 fade-in" style={{ animationDelay: '0.3s' }}>
              <Button
                onClick={() => navigate('/plan')}
                className="cta-glow text-white rounded-full text-base sm:text-lg px-8 py-6 gap-2 hover:brightness-110 w-full sm:w-auto"
                data-testid="hero-plan-btn"
              >
                Plan My Trip <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                className="rounded-full text-base sm:text-lg px-8 py-6 w-full sm:w-auto bg-white/10 text-white border-white/40 hover:bg-white/20 hover:text-white backdrop-blur"
                onClick={() => navigate('/explore')}
                data-testid="hero-learn-btn"
              >
                Explore Destinations
              </Button>
            </div>

            {/* Search */}
            <form
              onSubmit={submitSearch}
              className="bg-white rounded-3xl p-3 shadow-2xl shadow-black/30 grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_auto] gap-2 fade-in"
              style={{ animationDelay: '0.4s' }}
              role="search"
              aria-label="Search destinations"
            >
              <label className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-brand-50 text-gray-900">
                <Search className="w-5 h-5 text-primary shrink-0" />
                <span className="sr-only">Destination</span>
                <input
                  value={search.destination}
                  onChange={(e) => setSearch({ ...search, destination: e.target.value })}
                  placeholder="Search places, cities..."
                  className="w-full bg-transparent outline-none placeholder:text-gray-500 text-sm"
                  data-testid="hero-search-destination"
                />
              </label>
              <label className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-brand-50 text-gray-900">
                <Calendar className="w-5 h-5 text-primary shrink-0" />
                <span className="sr-only">Travel date</span>
                <input
                  type="date"
                  value={search.date}
                  onChange={(e) => setSearch({ ...search, date: e.target.value })}
                  className="w-full bg-transparent outline-none text-sm text-gray-700"
                />
              </label>
              <label className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-brand-50 text-gray-900">
                <Wallet className="w-5 h-5 text-primary shrink-0" />
                <span className="sr-only">Budget</span>
                <select
                  value={search.budget}
                  onChange={(e) => setSearch({ ...search, budget: e.target.value })}
                  className="w-full bg-transparent outline-none text-sm text-gray-700"
                >
                  <option value="">Any budget</option>
                  <option value="budget">Budget</option>
                  <option value="moderate">Moderate</option>
                  <option value="luxury">Luxury</option>
                </select>
              </label>
              <Button type="submit" className="brand-gradient text-white rounded-2xl px-8 h-auto py-3 hover:brightness-110" data-testid="hero-search-btn">
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-16">
        <div className="container-main grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-5">
          {categories.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.06}>
              <Link
                to={c.to}
                className="group flex flex-col items-center text-center p-5 md:p-7 rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary/40 transition-all duration-300"
              >
                <span className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white text-primary transition-colors">
                  <c.icon className="w-6 h-6" />
                </span>
                <span className="font-bold text-gray-900">{c.label}</span>
                <span className="text-xs text-gray-500 mt-1">{c.sub}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Popular destinations */}
      <section id="destinations" className="pb-16 md:pb-24">
        <div className="container-main">
          <SectionHead
            eyebrow="Popular destination"
            title={<>Where to <span className="text-primary">next?</span></>}
            action={
              <Link to="/explore" className="flex items-center gap-1 text-primary font-semibold hover:gap-2 transition-all shrink-0">
                See all <ChevronRight className="w-4 h-4" />
              </Link>
            }
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
            {destinations.map((d, i) => (
              <Reveal key={d.id} delay={(i % 3) * 0.08}>
                <button
                  onClick={() => navigate('/plan', { state: { destination: d.name } })}
                  className="group relative block w-full aspect-[4/5] sm:aspect-[3/4] overflow-hidden rounded-3xl text-left shadow-md hover:shadow-2xl transition-shadow"
                  data-testid={`destination-${d.id}`}
                  aria-label={`Plan a trip to ${d.name}`}
                >
                  <img
                    src={d.src}
                    alt={`${d.name}, ${d.country}`}
                    loading="lazy"
                    onError={onImgError}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2a0e4d]/90 via-[#2a0e4d]/20 to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {d.tags.map((t) => (
                      <span key={t} className="text-xs font-medium px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white">{t}</span>
                    ))}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="flex items-center gap-1 text-xs text-white/80 mb-1">
                      <MapPin className="w-3 h-3" /> {d.country}{d.days && ` · ${d.days}`}
                    </p>
                    <h3 className="text-2xl font-bold mb-1">{d.name}</h3>
                    <p className="text-sm text-white/80 line-clamp-2 mb-3">{d.blurb}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#E8A33D] group-hover:gap-2 transition-all">
                      Plan this trip <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* AI trip planner banner */}
      <section className="pb-16 md:pb-24">
        <div className="container-main">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] brand-gradient-deep text-white p-8 md:p-14">
              <Sparkles className="absolute -right-6 -top-6 w-48 h-48 text-white/10" aria-hidden="true" />
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70 mb-3">AI Trip Planner</p>
              <h2 className="text-3xl md:text-5xl font-extrabold max-w-2xl mb-4">Your next adventure starts here</h2>
              <p className="text-white/85 max-w-xl mb-8">
                Create a personalized trip in seconds with AI. Itineraries based on your interests and budget.
              </p>
              <Button
                onClick={() => navigate('/plan')}
                className="cta-glow text-white rounded-full text-lg px-10 py-6 hover:brightness-110"
                data-testid="cta-plan-btn"
              >
                Plan My Trip
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Experiences */}
      <section className="pb-16 md:pb-24">
        <div className="container-main">
          <SectionHead eyebrow="Travel inspiration" title={<>Every journey, <span className="text-primary">your way</span></>} />
          <div className="grid grid-cols-1 md:grid-cols-4 md:auto-rows-[220px] gap-4 md:gap-5">
            {EXPERIENCES.map((x, i) => (
              <Reveal key={x.label} delay={i * 0.06} className={`${x.span} h-56 md:h-auto`}>
                <button
                  onClick={() => navigate('/plan', { state: { destination: undefined, interest: x.to } })}
                  className="group relative w-full h-full overflow-hidden rounded-3xl text-left"
                >
                  <img
                    src={x.img(1000)}
                    alt={x.label}
                    loading="lazy"
                    onError={onImgError}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2a0e4d]/85 to-transparent" />
                  <div className="absolute bottom-0 p-6 text-white">
                    <h3 className="text-xl md:text-2xl font-bold">{x.label}</h3>
                    <p className="text-sm text-white/80">{x.sub}</p>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {tripTypes.map((t) => (
              <button
                key={t.label}
                onClick={() => navigate('/plan')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 text-gray-800 text-sm font-medium hover:bg-primary hover:text-white hover:border-primary transition-colors"
                data-testid={`trip-type-${t.label.toLowerCase()}`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How it works + features */}
      <section id="features" className="py-16 md:py-24 bg-brand-50/60">
        <div className="container-main">
          <SectionHead eyebrow="How it works" title={<>Three steps to <span className="text-primary">your trip</span></>} />
          <div className="grid md:grid-cols-3 gap-5 mb-16 md:mb-24">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08}>
                <div className="relative p-7 rounded-3xl bg-white border border-gray-200 h-full">
                  <span className="absolute top-5 right-6 text-5xl font-extrabold text-brand-100">{i + 1}</span>
                  <span className="w-12 h-12 rounded-2xl brand-gradient flex items-center justify-center mb-5">
                    <s.icon className="w-6 h-6 text-white" />
                  </span>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{s.title}</h3>
                  <p className="text-gray-600 text-sm">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <SectionHead eyebrow="Why Bleez" title={<>Intelligence meets <span className="text-primary">wanderlust</span></>} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <div className="group p-7 rounded-3xl bg-white border border-gray-200 h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <span className="w-12 h-12 rounded-2xl bg-brand-50 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors">
                    <f.icon className="w-6 h-6" />
                  </span>
                  <h3 className="text-lg font-bold mb-2 text-gray-900">{f.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{f.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <img
          src={IMG.santorini(1600)}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={onImgError}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#2E1065]/90 to-[#6D28D9]/80" />
        <div className="container-main relative text-center text-white">
          <Reveal>
            <h2 className="text-4xl md:text-6xl font-extrabold mb-5">Ready to explore the world?</h2>
            <p className="text-lg text-white/85 max-w-xl mx-auto mb-9">
              Start today and let AI shape a journey around you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button onClick={() => navigate('/plan')} className="cta-glow text-white rounded-full text-lg px-10 py-6 gap-2 hover:brightness-110">
                Plan Your Adventure <Plane className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => navigate('/download')}
                variant="outline"
                className="rounded-full text-lg px-8 py-6 gap-2 bg-white/10 text-white border-white/40 hover:bg-white/20 hover:text-white"
                data-testid="cta-download-btn"
              >
                <Download className="w-5 h-5" /> Get the App
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
