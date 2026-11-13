import React, { useState } from 'react';
import { MapPin, Heart, ArrowUpRight } from 'lucide-react';

// Colour-led destination visuals (no stock photos): each place gets its own gradient and a flag or emoji.
const VISUALS = {
  maldives: { mark: '🇲🇻', grad: 'from-[#0EA5E9] to-[#0D9488]' },
  paris: { mark: '🇫🇷', grad: 'from-[#7C3AED] to-[#DB2777]' },
  agra: { mark: '🇮🇳', grad: 'from-[#F59E0B] to-[#DB2777]' },
  santorini: { mark: '🇬🇷', grad: 'from-[#2563EB] to-[#6366F1]' },
  kyoto: { mark: '🇯🇵', grad: 'from-[#DB2777] to-[#F59E0B]' },
  bali: { mark: '🇮🇩', grad: 'from-[#0D9488] to-[#22C55E]' },
  rome: { mark: '🇮🇹', grad: 'from-[#F59E0B] to-[#EF4444]' },
  queenstown: { mark: '🏔️', grad: 'from-[#0891B2] to-[#4F46E5]' },
  'swiss-alps': { mark: '🇨🇭', grad: 'from-[#2563EB] to-[#0D9488]' },
};
const FALLBACKS = ['from-[#7C3AED] to-[#4C1D95]', 'from-[#0D9488] to-[#0EA5E9]', 'from-[#DB2777] to-[#7C3AED]'];

const DestinationCard = ({ d, saved, onToggle, onOpen }) => {
  const v = VISUALS[d.id] || { mark: '🌍', grad: FALLBACKS[(d.name || '').length % FALLBACKS.length] };
  const [broken, setBroken] = useState(false);
  const hasPhoto = Boolean(d.src) && !broken;
  return (
    <div className={`group bento relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden rounded-3xl text-white bg-gradient-to-br ${v.grad}`}>
      {hasPhoto ? (
        <img src={d.src} alt={`${d.name}, ${d.country}`} loading="lazy" onError={() => setBroken(true)}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      ) : (
        <span className="absolute -right-3 -bottom-6 text-[8.5rem] leading-none opacity-25 select-none" aria-hidden="true">{v.mark}</span>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0618]/85 via-[#0B0618]/15 to-transparent" aria-hidden="true" />
      <button
        onClick={onToggle}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${d.name} from wishlist` : `Save ${d.name} to wishlist`}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/25 backdrop-blur flex items-center justify-center hover:bg-black/40 transition-colors z-10"
      >
        <Heart className={`w-5 h-5 ${saved ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-white'}`} />
      </button>
      <button onClick={onOpen} className="absolute inset-0 p-6 text-left flex flex-col justify-between" aria-label={`Plan a trip to ${d.name}`}>
        <span className="flex flex-wrap gap-2 pr-12">
          {d.tags.map((t) => <span key={t} className="text-xs font-semibold px-3 py-1 rounded-full bg-black/25 backdrop-blur">{t}</span>)}
        </span>
        <span className="block">
          <span className="flex items-center gap-1.5 text-sm text-white/85 mb-1"><MapPin className="w-3.5 h-3.5" /> {d.country}{d.days && ` · ${d.days}`}</span>
          <span className="block text-2xl font-extrabold mb-1">{d.name}</span>
          <span className="block text-sm text-white/85 line-clamp-2 mb-3">{d.blurb}</span>
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#FBBF24] group-hover:gap-3 transition-all">Plan this trip <ArrowUpRight className="w-4 h-4" /></span>
        </span>
      </button>
    </div>
  );
};

export default DestinationCard;
