import React from 'react';
import { Navbar, Footer } from '../components/Layout';
import PageHero from '../components/PageHero';
import { SITE } from '../lib/site';
import { IMG } from '../data/travelImages';

// Plain-language summaries of how the product actually behaves. These are drafts for the operator's
// legal review: they intentionally contain no company name, address or jurisdiction.
const CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    image: 'forest',
    intro: `This policy explains what ${SITE.name} collects, why, and the choices you have.`,
    sections: [
      ['Information you give us', 'When you register we store your name, email address and password (stored securely, never in plain text). You can add optional profile details such as travel preferences, budget range and dietary needs to personalise your plans.'],
      ['Information from your use of the service', 'We keep the trips and itineraries you create, saved places, albums, expenses and community messages you post, so they are available when you sign back in. We also record which features you use to improve recommendations and to apply your plan\'s usage limits.'],
      ['Location and notifications', 'If you allow it, we use your location to show nearby places, local alerts and emergency numbers. You can turn location and notifications off at any time in your device or app settings. Core planning still works without them.'],
      ['Signing in with Google', 'If you choose Google sign-in, we receive your name, email address and profile picture from Google to create your account. We do not receive your Google password.'],
      ['Payments', 'Subscriptions are processed by the App Store, Google Play or our payment providers. Card details are entered with those providers and are not stored by us. We keep a record of the transaction (provider, product, amount, status) to manage your plan.'],
      ['Sharing', 'We do not sell your personal information. We share data only with service providers that help us run the product (for example hosting, maps, flight and hotel search, and AI itinerary generation), and where required by law. Content you post in the community is visible to other users.'],
      ['Your choices and rights', 'You can update your profile, delete saved content, and delete your account from within the app. Contact us to request a copy of your data or to ask a question about this policy.'],
      ['Changes', 'We will update this page when our practices change.'],
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    image: 'wander',
    intro: `By using ${SITE.name} you agree to the terms below.`,
    sections: [
      ['Using the service', 'You must provide accurate information when you register and keep your login details secure. You agree to use the service lawfully and not to misuse, disrupt or attempt to gain unauthorised access to it.'],
      ['AI-generated itineraries', 'Itineraries are suggestions generated automatically. Opening hours, prices, availability, entry rules and safety conditions change, so please verify important details before you travel. You are responsible for your travel decisions.'],
      ['Search and bookings', `${SITE.name} helps you search and compare flights, hotels and other services. Bookings are completed with the airline, hotel or partner you choose and are subject to their terms, including fares, cancellation and change rules. Prices shown come from third-party sources and can change before you book.`],
      ['Plans and billing', 'Some features require a paid plan, and plans have usage limits shown on the Plans page. Subscriptions bought through the App Store or Google Play are billed and managed by them, including renewals, cancellations and refunds.'],
      ['Community conduct', 'Be respectful. Do not post unlawful, abusive, misleading or infringing content. We may remove content and restrict accounts that break these rules.'],
      ['Emergency information', `Emergency numbers and alerts are provided for convenience and may be incomplete or out of date. In an emergency, contact local emergency services.`],
      ['Availability and liability', 'We work to keep the service available but do not guarantee uninterrupted access. To the extent permitted by law, we are not liable for losses arising from third-party services, travel disruptions or reliance on suggestions.'],
      ['Changes to these terms', 'We may update these terms. Continued use after an update means you accept the new version.'],
    ],
  },
};

const LegalPage = ({ type }) => {
  const c = CONTENT[type];
  return (
    <div className="min-h-screen flex flex-col" data-testid={`${type}-page`}>
      <Navbar />
      <PageHero image={IMG[c.image](1800)} eyebrow="Legal" title={c.title} />
      <main className="flex-1 container-main py-12 md:py-16 grid lg:grid-cols-[220px_1fr] gap-10 max-w-5xl">
        <nav aria-label="On this page" className="hidden lg:block sticky top-28 h-fit text-sm space-y-2">
          <p className="font-semibold uppercase tracking-[0.15em] text-xs text-muted-foreground mb-3">On this page</p>
          {c.sections.map(([h], i) => (
            <a key={h} href={`#s${i}`} className="block text-muted-foreground hover:text-primary transition-colors">{h}</a>
          ))}
        </nav>
        <article>
          <p className="text-lg text-muted-foreground mb-10">{c.intro}</p>
          {c.sections.map(([h, t], i) => (
            <section key={h} id={`s${i}`} className="mb-9 scroll-mt-28">
              <h2 className="text-2xl font-bold mb-2"><span className="text-primary mr-2">{i + 1}.</span>{h}</h2>
              <p className="text-muted-foreground leading-relaxed text-base md:text-lg">{t}</p>
            </section>
          ))}
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default LegalPage;
