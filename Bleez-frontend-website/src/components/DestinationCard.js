import React from 'react';
import { MapPin, Heart, ArrowRight } from 'lucide-react';
import { FALLBACK_IMG } from '../data/travelImages';

// Image-led destination card with a wishlist heart.
const DestinationCard = ({ d, saved, onToggle, onOpen }) => (
  <div className="group relative aspect-[4/5] overflow-hidden rounded-3xl shadow-md hover:shadow-2xl transition-shadow">
    <img
      src={d.src}
      alt={`${d.name}, ${d.country}`}
      loading="lazy"
      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-[#2a0e4d]/90 via-[#2a0e4d]/20 to-transparent" />
    <button
      onClick={onToggle}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${d.name} from wishlist` : `Save ${d.name} to wishlist`}
      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/40 transition-colors z-10"
    >
      <Heart className={`w-5 h-5 ${saved ? 'fill-[#E8A33D] text-[#E8A33D]' : 'text-white'}`} />
    </button>
    <button onClick={onOpen} className="absolute inset-0 text-left" aria-label={`Plan a trip to ${d.name}`}>
      <span className="absolute top-4 left-4 flex gap-2">
        {d.tags.map((t) => (
          <span key={t} className="text-xs font-medium px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white">{t}</span>
        ))}
      </span>
      <span className="absolute bottom-0 left-0 right-0 p-6 text-white block">
        <span className="flex items-center gap-1 text-xs text-white/80 mb-1">
          <MapPin className="w-3 h-3" /> {d.country}{d.days && ` · ${d.days}`}
        </span>
        <span className="block text-2xl font-bold mb-1">{d.name}</span>
        <span className="block text-sm text-white/80 line-clamp-2 mb-3">{d.blurb}</span>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#E8A33D] group-hover:gap-2 transition-all">
          Plan this trip <ArrowRight className="w-4 h-4" />
        </span>
      </span>
    </button>
  </div>
);

export default DestinationCard;
