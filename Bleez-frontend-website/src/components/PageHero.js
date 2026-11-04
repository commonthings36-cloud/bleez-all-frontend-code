import React from 'react';
import { FALLBACK_IMG } from '../data/travelImages';

// Image banner shown under the fixed navbar at the top of each page.
const PageHero = ({ image, eyebrow, title, subtitle, children, size = 'md', align = 'left' }) => {
  const height = size === 'lg' ? 'min-h-[420px] md:min-h-[520px]' : 'min-h-[260px] md:min-h-[320px]';
  return (
    <header className={`relative overflow-hidden flex items-end ${height} pt-24`}>
      <img
        src={image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1c0838]/90 via-[#2E1065]/55 to-[#2E1065]/30" />
      <div className={`container-main relative z-10 pb-8 md:pb-12 ${align === 'center' ? 'text-center' : ''}`}>
        {eyebrow && (
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-[#E8A33D] mb-2">{eyebrow}</p>
        )}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">{title}</h1>
        {subtitle && <p className={`mt-3 text-white/85 max-w-2xl text-sm md:text-lg ${align === 'center' ? 'mx-auto' : ''}`}>{subtitle}</p>}
        {children && <div className="mt-5">{children}</div>}
      </div>
    </header>
  );
};

export default PageHero;
