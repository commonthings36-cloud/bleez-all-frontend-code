import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Search, GitCompare, FileDown, Bell, MapPin, ArrowRight, UserPlus } from 'lucide-react';
import { Navbar, Footer } from '../components/Layout';
import PageHero from '../components/PageHero';
import { Button } from '../components/ui/button';
import useReveal from '../hooks/useReveal';
import { IMG } from '../data/travelImages';

const STEPS = [
  { icon: Sparkles, title: 'Tell us how you like to travel', text: 'Enter your destination, dates, budget and interests. The more you share, the better the plan fits you.', cta: { to: '/plan', label: 'Open the planner' } },
  { icon: MapPin, title: 'Get a day-by-day itinerary', text: 'Receive a complete plan with places, timings and local tips. Not quite right? Regenerate it, or save it to My Trips.', cta: { to: '/explore', label: 'Browse destinations' } },
  { icon: Search, title: 'Search flights and hotels', text: 'Look up flights and stays for your dates and see every option with a clear price breakdown.', cta: { to: '/booking', label: 'Search travel' } },
  { icon: GitCompare, title: 'Compare, then book with confidence', text: 'Compare options side by side, pick the one that suits you, and continue with the provider to complete your booking securely.', cta: { to: '/booking-compare', label: 'Compare options' } },
  { icon: FileDown, title: 'Take it with you', text: 'Export your itinerary as a PDF and keep your trips, albums and expenses together in one place.', cta: { to: '/my-trips', label: 'See My Trips' } },
  { icon: Bell, title: 'Stay informed on the road', text: 'Get alerts for your trips and current area, and find local emergency numbers whenever you need them.', cta: { to: '/alerts', label: 'View alerts' } },
];

const Step = ({ step, index, last }) => {
  const [ref, visible] = useReveal();
  const Icon = step.icon;
  return (
    <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} relative pl-16 md:pl-24 pb-12 last:pb-0`}>
      <span className="absolute left-0 top-0 w-12 h-12 md:w-16 md:h-16 rounded-2xl brand-gradient flex items-center justify-center shadow-lg shadow-primary/25">
        <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
      </span>
      {!last && <span className="absolute left-6 md:left-8 top-14 md:top-20 bottom-0 w-px bg-gradient-to-b from-primary/40 to-transparent" aria-hidden="true" />}
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-1">Step {index + 1}</p>
      <h3 className="text-2xl md:text-3xl font-bold mb-2">{step.title}</h3>
      <p className="text-muted-foreground max-w-xl mb-4 text-base md:text-lg">{step.text}</p>
      <Link to={step.cta.to} className="inline-flex items-center gap-1.5 text-primary font-semibold hover:gap-3 transition-all">
        {step.cta.label} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};

const HowItWorksPage = () => (
  <div className="min-h-screen flex flex-col" data-testid="how-it-works-page">
    <Navbar />
    <PageHero
      image={IMG.wander(1800)}
      eyebrow="How it works"
      title="From idea to itinerary in minutes"
      subtitle="Plan with AI, compare your options, and travel with support at every step."
      size="lg"
    />
    <main className="flex-1">
      <section className="container-main py-16 md:py-24 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-start">
        <div>
          {STEPS.map((s, i) => <Step key={s.title} step={s} index={i} last={i === STEPS.length - 1} />)}
        </div>
        <div className="hidden lg:block sticky top-28">
          <img src={IMG.kyoto(900)} alt="A quiet street in Kyoto at dusk" loading="lazy" className="w-full h-[460px] object-cover rounded-[2rem] shadow-2xl" />
          <img src={IMG.santorini(700)} alt="Whitewashed buildings above the sea in Santorini" loading="lazy" className="w-2/3 h-52 object-cover rounded-[2rem] shadow-xl -mt-16 ml-auto mr-6 border-4 border-background relative" />
        </div>
      </section>

      <section className="bg-brand-50 dark:bg-card py-16 md:py-20">
        <div className="container-main text-center max-w-2xl">
          <UserPlus className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready to start?</h2>
          <p className="text-muted-foreground mb-8">Create a free account to save trips, build a wishlist and keep everything in sync.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild className="rounded-full px-8 py-6 text-base"><Link to="/register">Create free account</Link></Button>
            <Button asChild variant="outline" className="rounded-full px-8 py-6 text-base"><Link to="/plan">Try the planner</Link></Button>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default HowItWorksPage;
