import React from 'react';
import { Box, keyframes } from '@mui/material';

/**
 * Lightweight inline-SVG vector art (no image files, so it stays crisp, themable and tiny).
 * Everything is decorative → aria-hidden.
 */

const floatA = keyframes`0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}`;
const floatB = keyframes`0%,100%{transform:translateY(0)}50%{transform:translateY(7px)}`;
const drift = keyframes`0%{transform:translateX(0)}50%{transform:translateX(10px)}100%{transform:translateX(0)}`;
const dash = keyframes`to{stroke-dashoffset:-24}`;
const twinkle = keyframes`0%,100%{opacity:.35}50%{opacity:1}`;

const Cloud: React.FC<{ x: number; y: number; s?: number; o?: number; delay?: number }> = ({ x, y, s = 1, o = 0.9, delay = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} style={{ animation: `${drift} ${9 + delay}s ease-in-out infinite` }}>
    <path d="M10 34c-6 0-10-4-10-9s4-9 10-9c1-7 7-12 14-12 6 0 11 3 13 8 7-1 13 4 13 10 0 6-4 12-11 12H10z" fill="#fff" />
  </g>
);

const Plane: React.FC<{ x: number; y: number; r?: number; s?: number; color?: string }> = ({ x, y, r = -18, s = 1, color = '#fff' }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M2 30 L58 6 L38 34 L52 52 L40 52 L28 38 L14 46 L10 40 L20 30 Z" fill={color} />
    <path d="M58 6 L26 28" stroke="rgba(0,0,0,.12)" strokeWidth="1.5" />
  </g>
);

const Pin: React.FC<{ x: number; y: number; c?: string; s?: number; delay?: number }> = ({ x, y, c = '#EF4444', s = 1, delay = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} style={{ animation: `${floatA} ${3 + delay}s ease-in-out infinite` }}>
    <path d="M12 0C5.4 0 0 5.2 0 11.6 0 20 12 32 12 32s12-12 12-20.4C24 5.2 18.6 0 12 0z" fill={c} />
    <circle cx="12" cy="11.5" r="4.5" fill="#fff" />
  </g>
);

const Globe: React.FC<{ cx: number; cy: number; r: number }> = ({ cx, cy, r }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill="url(#gl)" />
    <g stroke="rgba(255,255,255,.55)" strokeWidth="1.6" fill="none">
      <ellipse cx={cx} cy={cy} rx={r * 0.42} ry={r} />
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.36} />
      <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} />
      <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} />
    </g>
    <path d={`M${cx - r * 0.5} ${cy - r * 0.2} q${r * 0.2} -${r * 0.35} ${r * 0.45} -${r * 0.1} q${r * 0.1} ${r * 0.3} -${r * 0.15} ${r * 0.45} q-${r * 0.25} ${r * 0.05} -${r * 0.3} -${r * 0.35}z`} fill="rgba(255,255,255,.35)" />
    <path d={`M${cx + r * 0.1} ${cy + r * 0.25} q${r * 0.3} -${r * 0.1} ${r * 0.4} ${r * 0.2} q-${r * 0.1} ${r * 0.3} -${r * 0.35} ${r * 0.2}z`} fill="rgba(255,255,255,.35)" />
  </g>
);

const Defs: React.FC = () => (
  <defs>
    <linearGradient id="gl" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#C4B5FD" />
      <stop offset="1" stopColor="#6366F1" />
    </linearGradient>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#8B5CF6" />
      <stop offset="1" stopColor="#6366F1" />
    </linearGradient>
  </defs>
);

/** Big hero art: globe, plane on a dashed route, clouds and map pins. Designed to sit on a violet gradient. */
export const TravelHeroArt: React.FC<{ sx?: object }> = ({ sx }) => (
  <Box aria-hidden sx={{ pointerEvents: 'none', ...sx }}>
    <svg viewBox="0 0 420 260" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <Defs />
      <circle cx="300" cy="140" r="108" fill="rgba(255,255,255,.08)" />
      <Globe cx={300} cy={140} r={78} />
      <path d="M40 200 C 120 120, 200 60, 360 40" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="2.5" strokeDasharray="6 8" style={{ animation: `${dash} 1.4s linear infinite` }} />
      <g style={{ animation: `${floatA} 5s ease-in-out infinite` }}><Plane x={332} y={20} r={-8} s={0.95} /></g>
      <Cloud x={10} y={150} s={1.2} delay={2} />
      <Cloud x={170} y={196} s={0.9} o={0.75} delay={4} />
      <Cloud x={330} y={205} s={0.8} o={0.6} delay={1} />
      <Pin x={246} y={96} c="#FBBF24" s={0.9} />
      <Pin x={330} y={118} c="#F472B6" s={1} delay={1} />
      <Pin x={282} y={176} c="#34D399" s={0.8} delay={2} />
      {[[40, 50], [110, 24], [380, 100], [60, 120]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="#fff" style={{ animation: `${twinkle} ${2 + i * 0.6}s ease-in-out infinite` }} />
      ))}
    </svg>
  </Box>
);

/** Small, soft doodle for page headers (looks fine on both light and dark surfaces). */
export const HeaderDoodle: React.FC<{ sx?: object }> = ({ sx }) => (
  <Box aria-hidden sx={{ pointerEvents: 'none', ...sx }}>
    <svg viewBox="0 0 300 110" width="100%" height="100%" preserveAspectRatio="xMaxYMid meet">
      <defs>
        <linearGradient id="hd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#A78BFA" /><stop offset="1" stopColor="#6366F1" /></linearGradient>
      </defs>
      <g opacity=".9">
        <g fill="#C4B5FD" opacity=".55" style={{ animation: `${drift} 10s ease-in-out infinite` }}>
          <path d="M150 70c-5 0-8-3-8-7s3-7 8-7c1-6 6-10 11-10 5 0 9 3 10 7 6 0 10 3 10 8s-3 9-9 9h-22z" />
        </g>
        <path d="M20 92 C 80 70, 150 40, 270 20" fill="none" stroke="url(#hd)" strokeWidth="2.2" strokeDasharray="5 7" opacity=".6" style={{ animation: `${dash} 1.6s linear infinite` }} />
        <g transform="translate(236 4) rotate(-14) scale(.6)" style={{ animation: `${floatA} 5s ease-in-out infinite` }}>
          <path d="M2 30 L58 6 L38 34 L52 52 L40 52 L28 38 L14 46 L10 40 L20 30 Z" fill="url(#hd)" />
        </g>
        <g transform="translate(60 58) scale(.7)" style={{ animation: `${floatB} 4s ease-in-out infinite` }}><path d="M12 0C5.4 0 0 5.2 0 11.6 0 20 12 32 12 32s12-12 12-20.4C24 5.2 18.6 0 12 0z" fill="#F472B6" /><circle cx="12" cy="11.5" r="4.5" fill="#fff" /></g>
        <g transform="translate(120 44) scale(.5)" style={{ animation: `${floatA} 3.4s ease-in-out infinite` }}><path d="M12 0C5.4 0 0 5.2 0 11.6 0 20 12 32 12 32s12-12 12-20.4C24 5.2 18.6 0 12 0z" fill="#34D399" /><circle cx="12" cy="11.5" r="4.5" fill="#fff" /></g>
        {[[200, 80], [280, 70], [100, 20]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.2" fill="#8B5CF6" style={{ animation: `${twinkle} ${2 + i}s ease-in-out infinite` }} />)}
      </g>
    </svg>
  </Box>
);

/** Friendly suitcase + map scene for empty states. */
export const EmptyArt: React.FC<{ size?: number }> = ({ size = 170 }) => (
  <Box aria-hidden sx={{ width: size, height: size * 0.75, mx: 'auto' }}>
    <svg viewBox="0 0 240 180" width="100%" height="100%">
      <defs>
        <linearGradient id="eb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#A78BFA" /><stop offset="1" stopColor="#7C3AED" /></linearGradient>
      </defs>
      <ellipse cx="120" cy="162" rx="82" ry="9" fill="rgba(124,58,237,.14)" />
      <g style={{ animation: `${floatB} 5s ease-in-out infinite` }}>
        <Cloud x={14} y={30} s={0.9} o={0.8} />
        <Cloud x={160} y={18} s={0.7} o={0.65} delay={2} />
      </g>
      <g style={{ animation: `${floatA} 4.5s ease-in-out infinite` }}>
        <rect x="62" y="60" width="116" height="88" rx="16" fill="url(#eb)" />
        <rect x="98" y="46" width="44" height="22" rx="8" fill="none" stroke="#6D28D9" strokeWidth="6" />
        <rect x="62" y="96" width="116" height="8" fill="rgba(255,255,255,.22)" />
        <rect x="108" y="90" width="24" height="20" rx="5" fill="#FBBF24" />
        <circle cx="86" cy="124" r="9" fill="rgba(255,255,255,.9)" /><path d="M82 124l3 3 6-7" stroke="#7C3AED" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <rect x="104" y="120" width="54" height="6" rx="3" fill="rgba(255,255,255,.55)" />
        <rect x="104" y="131" width="36" height="6" rx="3" fill="rgba(255,255,255,.35)" />
      </g>
      <g transform="translate(176 54)" style={{ animation: `${floatB} 3.2s ease-in-out infinite` }}><path d="M12 0C5.4 0 0 5.2 0 11.6 0 20 12 32 12 32s12-12 12-20.4C24 5.2 18.6 0 12 0z" fill="#F472B6" /><circle cx="12" cy="11.5" r="4.5" fill="#fff" /></g>
      <g transform="translate(40 84) rotate(-14) scale(.5)" style={{ animation: `${floatA} 3.8s ease-in-out infinite` }}><path d="M2 30 L58 6 L38 34 L52 52 L40 52 L28 38 L14 46 L10 40 L20 30 Z" fill="#8B5CF6" /></g>
    </svg>
  </Box>
);

/** Illustrated default avatar (used when a user has no photo). */
export const AvatarArt: React.FC<{ seed?: string }> = ({ seed = '' }) => {
  const palettes = [['#8B5CF6', '#C4B5FD'], ['#EC4899', '#F9A8D4'], ['#06B6D4', '#A5F3FC'], ['#F59E0B', '#FDE68A'], ['#10B981', '#A7F3D0'], ['#6366F1', '#C7D2FE']];
  const h = Array.from(seed).reduce((a, c) => a + c.charCodeAt(0), 0);
  const [bg, fg] = palettes[h % palettes.length];
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden>
      <rect width="64" height="64" fill={bg} />
      <circle cx="12" cy="14" r="14" fill={fg} opacity=".35" />
      <circle cx="54" cy="56" r="18" fill={fg} opacity=".3" />
      <circle cx="32" cy="25" r="11" fill="#fff" />
      <path d="M10 64c1-14 10-22 22-22s21 8 22 22z" fill="#fff" />
    </svg>
  );
};

/** Sidebar footer card art. */
export const SidebarArt: React.FC = () => (
  <Box aria-hidden sx={{ width: '100%', height: 84 }}>
    <svg viewBox="0 0 220 84" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <Defs />
      <rect width="220" height="84" rx="14" fill="url(#sky)" />
      <circle cx="170" cy="62" r="46" fill="rgba(255,255,255,.1)" />
      <Globe cx={176} cy={46} r={30} />
      <path d="M14 70 C 60 50, 100 30, 150 14" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="1.8" strokeDasharray="4 6" style={{ animation: `${dash} 1.4s linear infinite` }} />
      <g style={{ animation: `${floatA} 4s ease-in-out infinite` }}><Plane x={140} y={6} r={-10} s={0.5} /></g>
      <Cloud x={14} y={46} s={0.7} o={0.7} />
      <Pin x={160} y={24} c="#FBBF24" s={0.5} />
    </svg>
  </Box>
);
