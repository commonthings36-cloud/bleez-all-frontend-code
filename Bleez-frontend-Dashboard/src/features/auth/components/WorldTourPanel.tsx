import React, { useEffect, useState } from 'react';
import { Box, Stack, Typography, keyframes } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

const photo = (id: string) => `https://images.unsplash.com/photo-${id}?w=1400&q=80&auto=format&fit=crop`;

const STOPS = [
  { city: 'Paris', country: 'France', img: photo('1502602898657-3e91760cbb34') },
  { city: 'Agra', country: 'India', img: photo('1524492412937-b28074a5d7da') },
  { city: 'Kyoto', country: 'Japan', img: photo('1493976040374-85c8e12f0c0e') },
  { city: 'Santorini', country: 'Greece', img: photo('1613395877344-13d4a8e0d49e') },
  { city: 'Maldives', country: 'Indian Ocean', img: photo('1507525428034-b723cf961d3e') },
];

const INTERVAL = 5200;

const zoom = keyframes`from{transform:scale(1.02)}to{transform:scale(1.12)}`;
const rise = keyframes`from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}`;
const dash = keyframes`to{stroke-dashoffset:-28}`;
const fly = keyframes`0%{offset-distance:0%}100%{offset-distance:100%}`;
const bar = keyframes`from{transform:scaleX(0)}to{transform:scaleX(1)}`;
const bob = keyframes`0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}`;

/** Left half of the login screen: full-bleed world-tour photo slideshow with an animated flight route. */
export const WorldTourPanel: React.FC = () => {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % STOPS.length), INTERVAL);
    return () => clearInterval(t);
  }, []);

  return (
    <Box
      sx={{
        position: 'relative', overflow: 'hidden', color: '#fff', minHeight: '100%',
        background: 'linear-gradient(140deg, #312E81 0%, #5B21B6 55%, #7C3AED 100%)',
      }}
    >
      {/* Photos (crossfade + slow zoom). Gradient above stays visible if an image cannot load. */}
      {STOPS.map((s, idx) => (
        <Box
          key={s.city}
          sx={{
            position: 'absolute', inset: 0, opacity: idx === i ? 1 : 0, transition: 'opacity 1.2s ease',
            backgroundImage: `url(${s.img})`, backgroundSize: 'cover', backgroundPosition: 'center',
            animation: idx === i ? `${zoom} ${INTERVAL + 1500}ms ease-out both` : 'none',
          }}
        />
      ))}
      {/* Colour wash so text is always readable */}
      <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(30,27,75,.55) 0%, rgba(30,27,75,.15) 38%, rgba(30,27,75,.85) 100%)' }} />
      <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(91,33,182,.45), rgba(124,58,237,0) 60%)' }} />

      <Stack sx={{ position: 'relative', height: '100%', minHeight: '100vh', p: { md: 5, lg: 6 }, justifyContent: 'space-between' }}>
        {/* top: brand */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ width: 44, height: 44, borderRadius: '13px', display: 'grid', placeItems: 'center', bgcolor: 'rgba(255,255,255,.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.3)' }}>
            <FlightTakeoffIcon />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', lineHeight: 1.2, letterSpacing: '-0.02em' }}>Bleez.AI</Typography>
            <Typography sx={{ opacity: 0.85, fontSize: '0.78rem', fontWeight: 600 }}>Platform Console</Typography>
          </Box>
        </Stack>

        {/* middle: headline */}
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: { md: '2.4rem', lg: '3rem' }, lineHeight: 1.12, letterSpacing: '-0.03em', maxWidth: 520, textShadow: '0 4px 24px rgba(0,0,0,.35)' }}>
            The whole world,<br />one console.
          </Typography>
          <Typography sx={{ mt: 1.5, maxWidth: 440, opacity: 0.92, fontSize: '1.02rem', lineHeight: 1.6 }}>
            Watch every trip, booking and traveller safely from anywhere on the map.
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2.5 }}>
            {[
              { icon: <AutoAwesomeIcon sx={{ fontSize: 16 }} />, t: 'AI itineraries' },
              { icon: <FlightTakeoffIcon sx={{ fontSize: 16 }} />, t: 'Live bookings' },
              { icon: <ShieldOutlinedIcon sx={{ fontSize: 16 }} />, t: 'Emergency SOS' },
            ].map((c) => (
              <Stack key={c.t} direction="row" spacing={0.75} alignItems="center" sx={{ px: 1.5, height: 32, borderRadius: '10px', bgcolor: 'rgba(255,255,255,.16)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.25)', fontSize: '0.8rem', fontWeight: 700 }}>
                {c.icon}
                <span>{c.t}</span>
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* bottom: route + caption */}
        <Box>
          <Box sx={{ position: 'relative', height: 74, mb: 1.5 }}>
            <svg viewBox="0 0 600 74" width="100%" height="100%" preserveAspectRatio="none" aria-hidden>
              <path d="M10 62 C 120 -10, 260 -10, 340 40 S 520 70, 590 14" fill="none" stroke="rgba(255,255,255,.75)" strokeWidth="2" strokeDasharray="6 8" style={{ animation: `${dash} 1.2s linear infinite` }} />
              {[10, 160, 300, 440, 590].map((x, idx) => {
                const ys = [62, 20, 34, 56, 14];
                return <circle key={x} cx={x} cy={ys[idx]} r={idx === i ? 6 : 4} fill={idx === i ? '#FBBF24' : '#fff'} opacity={idx === i ? 1 : 0.7} style={{ transition: 'all .4s' }} />;
              })}
            </svg>
            <Box
              sx={{
                position: 'absolute', left: 0, top: 0, width: 22, height: 22, color: '#fff', display: 'grid', placeItems: 'center',
                offsetPath: "path('M10 62 C 120 -10, 260 -10, 340 40 S 520 70, 590 14')", offsetRotate: 'auto 45deg',
                animation: `${fly} 9s linear infinite`,
              }}
            >
              <FlightTakeoffIcon sx={{ fontSize: 22, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.4))' }} />
            </Box>
          </Box>

          <Stack direction="row" alignItems="flex-end" justifyContent="space-between" spacing={2}>
            <Box key={i} sx={{ animation: `${rise} .6s ease both` }}>
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ opacity: 0.9 }}>
                <PlaceIcon sx={{ fontSize: 18, color: '#FBBF24' }} />
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>Next stop</Typography>
              </Stack>
              <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', lineHeight: 1.25, animation: `${bob} 4s ease-in-out infinite` }}>
                {STOPS[i].city}, <span style={{ fontWeight: 600, opacity: 0.85 }}>{STOPS[i].country}</span>
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.75} sx={{ pb: 0.75 }}>
              {STOPS.map((s, idx) => (
                <Box key={s.city} onClick={() => setI(idx)} role="button" aria-label={`Show ${s.city}`} sx={{ cursor: 'pointer', width: idx === i ? 34 : 10, height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,.35)', overflow: 'hidden', transition: 'width .3s' }}>
                  {idx === i && <Box key={i} sx={{ height: '100%', bgcolor: '#fff', transformOrigin: 'left', animation: `${bar} ${INTERVAL}ms linear both` }} />}
                </Box>
              ))}
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};
