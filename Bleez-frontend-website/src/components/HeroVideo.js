import React, { useEffect, useState } from 'react';

// Optional looping background video. Drop a file at public/videos/hero.mp4 (and optionally hero.webm),
// or point REACT_APP_HERO_VIDEO at a URL. If the file is missing, fails to load, or the visitor prefers
// reduced motion, nothing is rendered and the animated gradient behind it shows instead.
const SRC = process.env.REACT_APP_HERO_VIDEO || '/videos/hero.mp4';

const HeroVideo = ({ className = '' }) => {
  const [ok, setOk] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    setReduced(Boolean(mq?.matches));
  }, []);

  if (!ok || reduced) return null;
  return (
    <video
      className={`absolute inset-0 w-full h-full object-cover ${className}`}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      onError={() => setOk(false)}
    >
      <source src={SRC} type="video/mp4" onError={() => setOk(false)} />
    </video>
  );
};

export default HeroVideo;
