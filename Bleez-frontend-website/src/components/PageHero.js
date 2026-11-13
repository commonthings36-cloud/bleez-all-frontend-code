import React, { useState } from 'react';

// Photo banner under the floating navbar. The animated gradient sits behind the photo, so if an image
// fails to load the banner still looks intentional.
const PageHero = ({ image, eyebrow, title, subtitle, children, size = 'md', align = 'left' }) => {
  const [broken, setBroken] = useState(false);
  const height = size === 'lg' ? 'min-h-[440px] md:min-h-[540px]' : 'min-h-[340px] md:min-h-[400px]';
  return (
    <header className={`relative overflow-hidden flex items-end ${height} pt-28 surface-ink`}>
      <div className="mesh-bg" aria-hidden="true"><i /></div>
      {image && !broken && (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          fetchpriority="high"
          onError={() => setBroken(true)}
          className="absolute inset-0 w-full h-full object-cover kenburns"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0618]/90 via-[#0B0618]/35 to-[#0B0618]/30" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B0618]/60 via-[#0B0618]/10 to-transparent" aria-hidden="true" />
      <div className={`container-main relative z-10 pb-10 md:pb-14 ${align === 'center' ? 'text-center' : ''}`}>
        {eyebrow && (
          <span className="inline-flex items-center gap-2 rounded-full glass-panel px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white/90 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" /> {eyebrow}
          </span>
        )}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-[1.1] tracking-tight max-w-3xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">{title}</h1>
        {subtitle && <p className={`mt-3 text-white/85 max-w-2xl text-sm md:text-base ${align === 'center' ? 'mx-auto' : ''}`}>{subtitle}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </header>
  );
};

export default PageHero;
