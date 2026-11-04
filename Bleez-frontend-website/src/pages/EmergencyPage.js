import React from 'react';
import { Phone, AlertTriangle } from 'lucide-react';
import { Navbar, Footer } from '../components/Layout';
import PageHero from '../components/PageHero';
import { IMG } from '../data/travelImages';

// General emergency numbers. Numbers can change, so travellers should confirm locally.
const REGIONS = [
  { region: 'European Union, India and many other countries', note: 'Single emergency number', numbers: [['Emergency', '112']] },
  { region: 'United States & Canada', note: 'Police, fire and ambulance', numbers: [['Emergency', '911']] },
  { region: 'United Kingdom', note: 'Police, fire and ambulance', numbers: [['Emergency', '999']] },
  { region: 'Australia', note: 'Police, fire and ambulance', numbers: [['Emergency', '000']] },
  { region: 'Japan', note: 'Separate numbers', numbers: [['Police', '110'], ['Fire / Ambulance', '119']] },
];

const EmergencyPage = () => (
  <div className="min-h-screen flex flex-col" data-testid="emergency-page">
    <Navbar />
    <PageHero image={IMG.lake(1800)} eyebrow="Safety" title="Emergency contacts" subtitle="Quick-dial numbers for popular destinations." />
    <main className="flex-1 container-main py-12 md:py-16">
      <div className="flex gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 mb-8 text-sm">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>In a life-threatening emergency, call the local number straight away. Numbers can change, so check with your hotel or local authorities when you arrive.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        {REGIONS.map((r) => (
          <div key={r.region} className="p-6 rounded-3xl bg-white border border-gray-200">
            <h2 className="font-bold text-gray-900">{r.region}</h2>
            <p className="text-sm text-gray-500 mb-4">{r.note}</p>
            <div className="flex flex-wrap gap-3">
              {r.numbers.map(([label, num]) => (
                <a key={num} href={`tel:${num}`} className="inline-flex items-center gap-2 px-5 py-3 rounded-full brand-gradient text-white font-semibold hover:brightness-110">
                  <Phone className="w-4 h-4" /> {label}: {num}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
    <Footer />
  </div>
);

export default EmergencyPage;
