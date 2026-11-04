import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown } from 'lucide-react';
import { Navbar, Footer } from '../components/Layout';
import PageHero from '../components/PageHero';
import { FAQ_GROUPS } from '../data/faqs';
import { IMG } from '../data/travelImages';

const Item = ({ item, open, onToggle }) => (
  <div className="border-b border-border last:border-0">
    <button type="button" onClick={onToggle} aria-expanded={open} className="w-full flex items-center justify-between gap-4 py-5 text-left font-semibold text-lg hover:text-primary transition-colors">
      {item.q}
      <ChevronDown className={`w-5 h-5 shrink-0 text-primary transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    {open && (
      <div className="pb-5 -mt-1 text-muted-foreground leading-relaxed">
        <p>{item.a}</p>
        {item.link && <Link to={item.link.to} className="inline-block mt-2 text-primary font-semibold hover:underline">{item.link.label} →</Link>}
      </div>
    )}
  </div>
);

const FaqPage = () => {
  const [query, setQuery] = useState('');
  const [openKey, setOpenKey] = useState('0-0');

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ_GROUPS;
    return FAQ_GROUPS
      .map((g) => ({ ...g, items: g.items.filter((i) => `${i.q} ${i.a}`.toLowerCase().includes(q)) }))
      .filter((g) => g.items.length);
  }, [query]);

  return (
    <div className="min-h-screen flex flex-col" data-testid="faq-page">
      <Navbar />
      <PageHero image={IMG.lake(1800)} eyebrow="FAQs" title="Frequently asked questions" subtitle="Quick answers about planning, booking and travelling with Bleez." />
      <main className="flex-1 container-main py-12 md:py-16 max-w-3xl">
        <label className="relative block mb-10">
          <span className="sr-only">Search questions</span>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search questions…" className="w-full rounded-2xl border border-border bg-card pl-12 pr-4 py-4 text-base outline-none focus:ring-2 focus:ring-ring" />
        </label>

        {groups.length === 0 && (
          <p className="text-center text-muted-foreground py-10">
            No questions match “{query}”. <Link to="/contact" className="text-primary font-semibold">Ask us directly</Link>.
          </p>
        )}

        {groups.map((g, gi) => (
          <section key={g.group} className="mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-2">{g.group}</h2>
            <div className="rounded-3xl border border-border bg-card px-6">
              {g.items.map((item, ii) => {
                const key = `${gi}-${ii}`;
                const forceOpen = query.trim().length > 0;
                return <Item key={item.q} item={item} open={forceOpen || openKey === key} onToggle={() => setOpenKey(openKey === key ? null : key)} />;
              })}
            </div>
          </section>
        ))}

        <div className="rounded-3xl brand-gradient text-white p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">Still have a question?</h3>
          <p className="text-white/85 mb-5">We're happy to help.</p>
          <Link to="/contact" className="inline-flex rounded-full bg-white text-brand-700 font-semibold px-7 py-3 hover:bg-white/90 transition-colors">Contact us</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FaqPage;
