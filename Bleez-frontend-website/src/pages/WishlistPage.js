import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Navbar, Footer } from '../components/Layout';
import PageHero from '../components/PageHero';
import DestinationCard from '../components/DestinationCard';
import { Button } from '../components/ui/button';
import useWishlist from '../hooks/useWishlist';
import { IMG, DESTINATIONS } from '../data/travelImages';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { ids, has, toggle } = useWishlist();
  const saved = DESTINATIONS.filter((d) => ids.includes(d.id));

  return (
    <div className="min-h-screen flex flex-col" data-testid="wishlist-page">
      <Navbar />
      <PageHero
        image={IMG.santorini(1800)}
        eyebrow="Wishlist"
        title="Places you want to go"
        subtitle="Saved on this device. Pick one and start planning."
      />
      <main className="flex-1 container-main py-10 md:py-14">
        {saved.length === 0 ? (
          <div className="text-center py-16 max-w-md mx-auto">
            <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Nothing saved yet</h2>
            <p className="text-muted-foreground mb-6">Tap the heart on any destination to save it here.</p>
            <Link to="/explore"><Button className="rounded-full px-8 brand-gradient text-white">Explore destinations</Button></Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {saved.map((d) => (
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

export default WishlistPage;
