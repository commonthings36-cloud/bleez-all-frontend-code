import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Calendar, Shield, Plane, Hotel, Car, Mountain, Utensils, Bell } from 'lucide-react';
import { Navbar, Footer } from '../components/Layout';
import PageHero from '../components/PageHero';
import { Button } from '../components/ui/button';
import { IMG } from '../data/travelImages';

const pillars = [
  { icon: Sparkles, title: 'AI itinerary planning', text: 'Itineraries shaped by your past trips, budget and preferences, with recommendations that improve as you use the app.' },
  { icon: MapPin, title: 'Location aware', text: 'Nearby airports, hotels, cabs, attractions and restaurants, with travel times from where you are.' },
  { icon: Calendar, title: 'Calendar sync', text: 'Plans fit around your meetings and appointments, and free time turns into suggestions.' },
  { icon: Bell, title: 'Timely reminders', text: 'Confirmations, check-in times and pick-up reminders before each booking.' },
  { icon: Shield, title: 'Emergency support', text: 'Local emergency numbers and support contacts for where you are and where you are going.' },
];

const services = [
  { icon: Plane, label: 'Flights' }, { icon: Hotel, label: 'Hotels' }, { icon: Car, label: 'Cabs' },
  { icon: Mountain, label: 'Adventure & tours' }, { icon: Utensils, label: 'Restaurants' },
];

const AboutPage = () => (
  <div className="min-h-screen flex flex-col" data-testid="about-page">
    <Navbar />
    <PageHero
      image={IMG.alps(1800)}
      eyebrow="About us"
      title="One place for the whole journey"
      subtitle="Search, plan and book flights, hotels, cabs and experiences, guided by AI that learns what you love."
      size="lg"
    />
    <main className="flex-1">
      <section className="container-main py-14 md:py-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">What we do</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">A self-contained travel platform</h2>
          <p className="text-muted-foreground mb-4">
            Bleez brings the pieces of a trip together so you are not jumping between apps. Browse services,
            compare options, keep your bookings and receipts, and get help on the road.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            {services.map((s) => (
              <span key={s.label} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 text-brand-700 text-sm font-medium">
                <s.icon className="w-4 h-4" /> {s.label}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <img src={IMG.kyoto(700)} alt="Kyoto street at dusk" loading="lazy" className="rounded-3xl w-full h-64 object-cover" />
          <img src={IMG.lagoon(700)} alt="Tropical lagoon" loading="lazy" className="rounded-3xl w-full h-64 object-cover mt-8" />
        </div>
      </section>

      <section className="bg-brand-50/60 py-14 md:py-20">
        <div className="container-main">
          <h2 className="text-3xl md:text-4xl font-bold mb-10">What makes it different</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pillars.map((p) => (
              <div key={p.title} className="p-7 rounded-3xl bg-white border border-gray-200">
                <span className="w-12 h-12 rounded-2xl brand-gradient flex items-center justify-center mb-5">
                  <p.icon className="w-6 h-6 text-white" />
                </span>
                <h3 className="text-lg font-bold mb-2 text-gray-900">{p.title}</h3>
                <p className="text-sm text-gray-600">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-main py-14 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready when you are</h2>
        <Link to="/plan"><Button className="cta-glow text-white rounded-full px-10 py-6 text-lg">Plan my trip</Button></Link>
      </section>
    </main>
    <Footer />
  </div>
);

export default AboutPage;
