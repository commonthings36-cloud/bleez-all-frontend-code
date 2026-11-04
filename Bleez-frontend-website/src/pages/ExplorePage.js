import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Navbar, Footer } from '../components/Layout';
import PageHero from '../components/PageHero';
import DestinationCard from '../components/DestinationCard';
import useWishlist from '../hooks/useWishlist';
import { IMG, DESTINATIONS } from '../data/travelImages';

const FILTERS = ['All', 'Beach', 'Culture', 'Adventure', 'Nature', 'Romantic', 'Heritage', 'Food', 'City', 'Islands'];

const ExplorePage = () => {
  const navigate = useNavigate();
  const { has, toggle } = useWishlist();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DESTINATIONS.filter((d) =>
      (filter === 'All' || d.tags.includes(filter)) &&
      (!q || `${d.name} ${d.country} ${d.blurb}`.toLowerCase().includes(q))
    );
  }, [query, filter]);

  return (
    <div className="min-h-screen flex flex-col" data-testid="explore-page">
      <Navbar />
      <PageHero
        image={IMG.paradise(1800)}
        eyebrow="Explore"
        title="Find your next destination"
        subtitle="Browse by mood, save favourites and let AI plan the trip."
      >
        <label className="flex items-center gap-3 bg-white rounded-full px-5 py-3 max-w-md shadow-lg">
          <Search className="w-5 h-5 text-primary" />
          <span className="sr-only">Search destinations</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search places..."
            className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-500"
          />
        </label>
      </PageHero>

      <main className="flex-1 container-main py-10 md:py-14">
        <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Filter by interest">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                filter === f ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:border-primary/50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No destinations match. Try another search or filter.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((d) => (
              <DestinationCard
                key={d.id}
                d={{ ...d, src: d.img(800) }}
                saved={has(d.id)}
                onToggle={() => toggle(d.id)}
                onOpen={() => navigate('/plan', { state: { destination: d.name } })}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ExplorePage;
