import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Search, CreditCard, ShieldAlert, ArrowRight } from 'lucide-react';
import { Navbar, Footer } from '../components/Layout';
import PageHero from '../components/PageHero';
import { IMG } from '../data/travelImages';

const TOPICS = [
  { icon: Sparkles, title: 'Planning trips', text: 'Generate, regenerate and export itineraries.', to: '/plan', label: 'Open the planner' },
  { icon: Search, title: 'Searching & comparing', text: 'Find flights and hotels and compare prices.', to: '/booking', label: 'Search travel' },
  { icon: CreditCard, title: 'Plans & billing', text: 'See current plans and manage your subscription.', to: '/my-subscription', label: 'View plans' },
  { icon: ShieldAlert, title: 'Safety on the road', text: 'Emergency numbers and travel alerts.', to: '/emergency', label: 'Emergency numbers' },
];

const HelpPage = () => (
  <div className="min-h-screen flex flex-col" data-testid="help-page">
    <Navbar />
    <PageHero image={IMG.trip(1800)} eyebrow="Help center" title="How can we help?" subtitle="Guides for every part of your journey, and a way to reach us." />
    <main className="flex-1 container-main py-12 md:py-16">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
        {TOPICS.map((t) => (
          <Link key={t.to} to={t.to} className="group p-6 rounded-3xl bg-card border border-border hover:shadow-xl hover:-translate-y-1 transition-all">
            <span className="w-12 h-12 rounded-2xl bg-brand-50 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors"><t.icon className="w-6 h-6" /></span>
            <h3 className="font-bold text-lg mb-1">{t.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{t.text}</p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">{t.label} <ArrowRight className="w-4 h-4" /></span>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Link to="/faq" className="p-8 rounded-3xl border border-border bg-card hover:shadow-lg transition-shadow">
          <h2 className="text-2xl font-bold mb-2">Read the FAQs</h2>
          <p className="text-muted-foreground mb-3">Searchable answers to the questions we hear most.</p>
          <span className="text-primary font-semibold">Browse FAQs →</span>
        </Link>
        <Link to="/contact" className="p-8 rounded-3xl brand-gradient text-white hover:brightness-110 transition">
          <h2 className="text-2xl font-bold mb-2">Talk to us</h2>
          <p className="text-white/85 mb-3">Can't find what you need? Send us a message.</p>
          <span className="font-semibold">Contact us →</span>
        </Link>
      </div>
    </main>
    <Footer />
  </div>
);

export default HelpPage;
