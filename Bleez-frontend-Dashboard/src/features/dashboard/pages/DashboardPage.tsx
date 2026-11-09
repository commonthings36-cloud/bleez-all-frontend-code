import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Grid2 as Grid,
  Typography,
  Stack,
  Chip,
  keyframes,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import WifiTetheringIcon from '@mui/icons-material/WifiTethering';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MapIcon from '@mui/icons-material/Map';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PaymentIcon from '@mui/icons-material/Payment';
import ForumIcon from '@mui/icons-material/Forum';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { TravelHeroArt } from '@/components/Illustrations';
import { apiClient } from '@/services/apiClient';

const DEST_COLORS = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6'];

/* ───────── Animation helpers ───────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const slideInRow = keyframes`
  from { opacity: 0; transform: translateX(-14px); }
  to   { opacity: 1; transform: translateX(0); }
`;
const gradientShift = keyframes`
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;
const floatY = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(18px); }
`;
const growX = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
`;
const pulseRing = keyframes`
  0%   { box-shadow: 0 0 0 0 currentColor; }
  70%  { box-shadow: 0 0 0 8px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
`;
const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,.5); }
  50%      { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
`;

/** Animates a number from its previous value to the new one. */
const CountUp: React.FC<{ value: number; format: (n: number) => string; duration?: number }> = ({ value, format, duration = 1100 }) => {
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const origin = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = origin + (value - origin) * eased;
      setShown(v);
      from.current = v;
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{format(shown)}</>;
};

const ChartTooltip: React.FC<any> = ({ active, payload, label, suffix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ px: 1.5, py: 1, borderRadius: '12px', bgcolor: 'background.paper', backdropFilter: 'blur(12px)', border: '1px solid', borderColor: 'divider', boxShadow: '0 12px 28px -8px rgba(0,0,0,.25)' }}>
      {(label || payload[0].name) && (
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
          {label || payload[0].name}
        </Typography>
      )}
      {payload.map((p: any, i: number) => (
        <Typography key={i} variant="body2" sx={{ fontWeight: 800 }}>
          {p.name && label ? `${p.name}: ` : ''}{p.value}{suffix}
        </Typography>
      ))}
    </Box>
  );
};


export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [liveLocationData, setLiveLocationData] = useState<any>(null);
  const [apiConnected, setApiConnected] = useState(false);

  // Real Backend MongoDB Data States
  const [totalUsersCount, setTotalUsersCount] = useState<number>(0);
  const [onlineUsersCount, setOnlineUsersCount] = useState<number>(0);
  const [apiUtilisedCount, setApiUtilisedCount] = useState<number>(0);
  const [totalTripsCount, setTotalTripsCount] = useState<number>(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [paymentsProcessed, setPaymentsProcessed] = useState<number>(0);
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  // Dynamic Chart States
  const [revenueTrendData, setRevenueTrendData] = useState<any[]>([]);
  const [destinationChartData, setDestinationChartData] = useState<any[]>([]);

  const LEGACY_SEEDED_IDS = new Set([
    'exp_101', 'exp_102', 'exp_103',
    'itin_paris_001', 'itin_tokyo_002', 'itin_rome_003',
    'bk_101', 'bk_102', 'bk_103',
    'TK8912', 'MAR-7731', 'AF4420',
  ]);

  const fetchDashboardLiveData = () => {
    // 1. Fetch real-time consolidated dashboard analytics from MongoDB backend
    apiClient
      .get('/admin/dashboard/stats')
      .then((res) => {
        if (res.data) {
          if (typeof res.data.totalUsers === 'number') setTotalUsersCount(res.data.totalUsers);
          if (typeof res.data.onlineUsers === 'number') setOnlineUsersCount(res.data.onlineUsers);
          if (typeof res.data.monthlyRevenue === 'number') setMonthlyRevenue(res.data.monthlyRevenue);
          if (typeof res.data.paymentsProcessed === 'number') setPaymentsProcessed(res.data.paymentsProcessed);
          if (typeof res.data.totalTrips === 'number') setTotalTripsCount(res.data.totalTrips);
          if (typeof res.data.apiUtilised === 'number') setApiUtilisedCount(res.data.apiUtilised);
          if (Array.isArray(res.data.revenueTrend)) {
            setRevenueTrendData(res.data.revenueTrend);
          }
          if (Array.isArray(res.data.topDestinations)) {
            setDestinationChartData(res.data.topDestinations);
          }
          setApiConnected(true);
        }
      })
      .catch((err) => {
        console.debug('Dashboard stats notice:', err.message);
      });

    // 2. Emergency location detection endpoint
    apiClient
      .get('/emergency/detect-location')
      .then((res) => {
        setLiveLocationData(res.data);
      })
      .catch(() => {});

    // 3. Real SOS Panic Alerts (/emergency/panic-events) + Travel threat alerts (/alerts/all)
    Promise.allSettled([
      apiClient.get('/emergency/panic-events'),
      apiClient.get('/alerts/all'),
    ]).then(([panicRes, alertsRes]) => {
      const panicList =
        panicRes.status === 'fulfilled' && Array.isArray(panicRes.value.data)
          ? panicRes.value.data.map((ev: any) => ({
              id: ev.id,
              title: `🚨 SOS Panic Alert: ${ev.senderName || 'Traveler'}${ev.senderEmail ? ` (${ev.senderEmail})` : ''}`,
              country:
                ev.locationLabel ||
                (ev.latitude != null && ev.longitude != null
                  ? `${Number(ev.latitude).toFixed(4)}, ${Number(ev.longitude).toFixed(4)}`
                  : 'GPS Signal'),
              description: `${ev.note || 'Emergency SOS triggered'} • ${ev.recipientCount ?? 0} emergency email(s) delivered`,
              googleMapsUrl: ev.googleMapsUrl,
              createdAt: ev.createdAt,
              isPanic: true,
            }))
          : [];

      const advisoryList =
        alertsRes.status === 'fulfilled'
          ? Array.isArray(alertsRes.value.data)
            ? alertsRes.value.data
            : alertsRes.value.data?.alerts || []
          : [];

      setRecentAlerts([...panicList, ...advisoryList]);
    });

    // 4. Community forum messages endpoint
    apiClient
      .get('/community/messages')
      .then((res) => {
        if (Array.isArray(res.data)) {
          setCommunityPosts(res.data);
        }
      })
      .catch(() => {});

    // 5. Live Flight & Hotel Bookings Stream (real MongoDB users & trips)
    apiClient
      .get('/admin/bookings/all')
      .then((res) => {
        if (Array.isArray(res.data)) {
          const cleanBookings = res.data.filter(
            (b: any) => !LEGACY_SEEDED_IDS.has(b.id) && !LEGACY_SEEDED_IDS.has(b.bookingReference)
          );
          setRecentBookings(cleanBookings.slice(0, 5));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    // Purge legacy seeded expenses if still present in MongoDB
    ['exp_101', 'exp_102', 'exp_103'].forEach((id) => {
      apiClient.delete(`/expenses/${id}`).catch(() => {});
    });
    fetchDashboardLiveData();
    const interval = setInterval(fetchDashboardLiveData, 15000); // 15-second live refresh
    return () => clearInterval(interval);
  }, []);

  const userGrowth = totalUsersCount > 0 ? `+${totalUsersCount}` : '0';
  const onlineGrowth = onlineUsersCount > 0 ? `${onlineUsersCount} live` : '0';
  const revenueGrowth = monthlyRevenue > 0 ? `+$${monthlyRevenue.toLocaleString()}` : '$0';
  const tripGrowth = totalTripsCount > 0 ? `+${totalTripsCount}` : '0';
  const apiGrowth = apiUtilisedCount > 0 ? `${apiUtilisedCount} active` : '0';
  const paymentGrowth = paymentsProcessed > 0 ? `+$${paymentsProcessed.toLocaleString()}` : '$0';
  const communityGrowth = communityPosts.length > 0 ? `+${communityPosts.length}` : '0';

  const stats = [
    { title: 'Total Users', value: totalUsersCount, display: (n: number) => Math.round(n).toString(), change: userGrowth, isUp: true, icon: <PeopleIcon />, color: '#6366F1', path: '/users' },
    { title: 'Online Users', value: onlineUsersCount, display: (n: number) => Math.round(n).toString(), change: onlineGrowth, isUp: true, icon: <WifiTetheringIcon />, color: '#10B981', path: '/users', live: onlineUsersCount > 0 },
    { title: 'Monthly Revenue', value: monthlyRevenue, display: (n: number) => `$${Math.round(n).toLocaleString()}`, change: revenueGrowth, isUp: true, icon: <AttachMoneyIcon />, color: '#F59E0B', path: '/payments' },
    { title: 'Total Trips', value: totalTripsCount, display: (n: number) => Math.round(n).toString(), change: tripGrowth, isUp: true, icon: <MapIcon />, color: '#8B5CF6', path: '/destinations' },
    { title: 'API Utilised', value: apiUtilisedCount, display: (n: number) => Math.round(n).toString(), change: apiGrowth, isUp: true, icon: <AutoAwesomeIcon />, color: '#EC4899', path: '/api-monitoring' },
    { title: 'Active SOS Alerts', value: recentAlerts.length, display: (n: number) => `${Math.round(n)} Active`, change: `${recentAlerts.length} Active`, isUp: false, icon: <WarningAmberIcon />, color: '#EF4444', path: '/emergency', live: recentAlerts.length > 0 },
    { title: 'Payments Processed', value: paymentsProcessed, display: (n: number) => `$${Math.round(n).toLocaleString()}`, change: paymentGrowth, isUp: true, icon: <PaymentIcon />, color: '#06B6D4', path: '/payments' },
    { title: 'Community Posts', value: communityPosts.length, display: (n: number) => Math.round(n).toString(), change: communityGrowth, isUp: true, icon: <ForumIcon />, color: '#3B82F6', path: '/community' },
  ];

  const destTotal = destinationChartData.reduce((s, d) => s + (Number(d.value) || 0), 0);
  const hasRevenue = revenueTrendData.some((d) => Number(d.revenue) > 0 || Number(d.bookings) > 0);

  const sectionTitle = (title: string, subtitle: string, right?: React.ReactNode) => (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 2.5 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>{title}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
      </Box>
      {right}
    </Stack>
  );

  const rowCardSx = (color: string) => ({
    p: 2,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeft: `3px solid ${color}`,
    boxShadow: 'none',
    '&:hover': { transform: 'translateX(4px)', boxShadow: `0 8px 20px -10px ${color}80` },
  });

  return (
    <Box>
      {/* ───────── Hero ───────── */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '24px',
          p: { xs: 3, md: 4 },
          mb: 3.5,
          color: '#fff',
          background: 'linear-gradient(120deg, #5B21B6 0%, #7C3AED 45%, #6366F1 100%)',
          backgroundSize: '200% 200%',
          animation: `${gradientShift} 14s ease infinite, ${fadeUp} .6s ease-out both`,
          boxShadow: '0 24px 48px -20px rgba(124,58,237,.6)',
        }}
      >
        <Box sx={{ position: 'absolute', top: -80, right: -40, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.22), transparent 70%)', animation: `${floatY} 7s ease-in-out infinite` }} />
        <Box sx={{ position: 'absolute', bottom: -100, right: '28%', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,.35), transparent 70%)', animation: `${floatY} 9s ease-in-out infinite reverse` }} />
        <TravelHeroArt sx={{ position: 'absolute', right: { md: 24, lg: 60 }, top: '50%', transform: 'translateY(-50%)', width: 380, height: 235, display: { xs: 'none', lg: 'block' }, opacity: 0.95 }} />
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3} sx={{ position: 'relative' }}>
          <Box>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.8, mb: 0.75 }}>
              Dashboard · Overview
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: { xs: '1.6rem', md: '2.1rem' }, color: '#fff' }}>
              Bleez.AI Platform Console
            </Typography>
            <Typography sx={{ mt: 0.75, opacity: 0.85, maxWidth: 560, fontSize: '0.95rem', color: '#fff' }}>
              Real-time operational metrics, global threat monitoring, and booking analytics.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <Box
              onClick={() => navigate('/api-monitoring')}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderRadius: '999px', cursor: 'pointer',
                bgcolor: 'rgba(255,255,255,.16)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.25)',
                fontWeight: 700, fontSize: '0.85rem', transition: 'background-color .2s', '&:hover': { bgcolor: 'rgba(255,255,255,.26)' },
              }}
            >
              <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: apiConnected ? '#34D399' : '#FBBF24', animation: `${pulseRing} 1.8s infinite`, color: apiConnected ? '#34D399' : '#FBBF24' }} />
              {apiConnected ? 'System Online' : 'Connecting...'}
            </Box>
            <Box sx={{ px: 2, py: 1, borderRadius: '999px', bgcolor: 'rgba(255,255,255,.16)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.25)', fontWeight: 600, fontSize: '0.85rem' }}>
              📍 {liveLocationData?.country ? `${liveLocationData.city ? liveLocationData.city + ', ' : ''}${liveLocationData.country}` : 'Global'}
            </Box>
          </Stack>
        </Stack>
      </Box>

      {/* ───────── KPI cards ───────── */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {stats.map((stat, idx) => (
          <Grid key={stat.title} size={{ xs: 12, sm: 6, lg: 3 }}>
            <GlassCard
              onClick={() => navigate(stat.path)}
              sx={{
                position: 'relative',
                overflow: 'hidden',
                p: 2.5,
                height: '100%',
                cursor: 'pointer',
                animation: `${fadeUp} .55s ${0.08 * idx}s ease-out both`,
                '&::after': {
                  content: '""', position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%',
                  background: `radial-gradient(circle, ${stat.color}26, transparent 70%)`, transition: 'transform .5s',
                },
                '&:hover': { borderColor: stat.color, boxShadow: `0 16px 32px -12px ${stat.color}55`, transform: 'translateY(-5px)' },
                '&:hover::after': { transform: 'scale(1.6)' },
                '&:hover .kpi-icon': { transform: 'rotate(-8deg) scale(1.1)' },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.75, mb: 0.75, letterSpacing: '-0.02em' }}>
                    <CountUp value={stat.value} format={stat.display} />
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Box
                      sx={{
                        px: 0.9, py: 0.2, borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800,
                        color: stat.isUp ? 'success.main' : 'error.main',
                        bgcolor: stat.isUp ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)',
                      }}
                    >
                      {stat.isUp ? '↗' : '↘'} {stat.change}
                    </Box>
                    <Typography variant="caption" color="text.secondary">vs last month</Typography>
                  </Stack>
                </Box>
                <Box
                  className="kpi-icon"
                  sx={{
                    position: 'relative', width: 50, height: 50, borderRadius: '15px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                    background: `linear-gradient(135deg, ${stat.color}, ${stat.color}bb)`,
                    boxShadow: `0 10px 20px -8px ${stat.color}`, transition: 'transform .3s',
                  }}
                >
                  {stat.icon}
                  {stat.live && (
                    <Box sx={{ position: 'absolute', top: -3, right: -3, width: 12, height: 12, borderRadius: '50%', bgcolor: stat.color, border: '2px solid', borderColor: 'background.default', color: stat.color, animation: `${pulseRing} 1.8s infinite` }} />
                  )}
                </Box>
              </Stack>
            </GlassCard>
          </Grid>
        ))}
      </Grid>

      {/* ───────── Charts ───────── */}
      <Grid container spacing={3} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <GlassCard sx={{ p: 3, height: '100%', animation: `${fadeUp} .6s .35s ease-out both` }}>
            {sectionTitle(
              'Revenue & Booking Trends',
              'Monthly performance analytics and AI itinerary prompt growth',
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.5, borderRadius: '999px', bgcolor: 'rgba(124,58,237,.1)', color: 'primary.main', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'primary.main', color: 'primary.main', animation: `${pulseRing} 1.8s infinite` }} />
                Live MongoDB Stream
              </Box>
            )}
            {revenueTrendData.length > 0 ? (
              <Box sx={{ width: '100%', height: 320, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrendData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 6" vertical={false} opacity={0.15} />
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <RechartsTooltip content={<ChartTooltip />} cursor={{ stroke: '#7C3AED', strokeOpacity: 0.3, strokeDasharray: '4 4' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={3} fill="url(#colorRevenue)" name="Revenue ($)" animationDuration={1400} activeDot={{ r: 6, strokeWidth: 3, stroke: '#fff' }} />
                  </AreaChart>
                </ResponsiveContainer>
                {!hasRevenue && (
                  <Typography variant="caption" color="text.secondary" sx={{ position: 'absolute', top: '38%', left: 0, right: 0, textAlign: 'center', fontWeight: 600 }}>
                    No revenue recorded in this period yet — it will stream in as bookings are processed.
                  </Typography>
                )}
              </Box>
            ) : (
              <EmptyState title="No Revenue Trends Yet" description="Revenue metrics will stream live as bookings are processed." />
            )}
          </GlassCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <GlassCard sx={{ p: 3, height: '100%', animation: `${fadeUp} .6s .45s ease-out both` }}>
            {sectionTitle('Top Travel Destinations', 'Active traveler distribution by country')}
            {destinationChartData.length > 0 ? (
              <>
                <Box sx={{ width: '100%', height: 210, position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={destinationChartData} cx="50%" cy="50%" innerRadius={64} outerRadius={88} paddingAngle={3} cornerRadius={6} dataKey="value" stroke="none" animationDuration={1200}>
                        {destinationChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || DEST_COLORS[index % DEST_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<ChartTooltip suffix="%" />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{destinationChartData.length}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Destinations</Typography>
                  </Box>
                </Box>

                <Stack spacing={1.25} sx={{ mt: 2, maxHeight: 230, overflowY: 'auto', pr: 0.5 }}>
                  {destinationChartData.map((dest, i) => {
                    const c = dest.color || DEST_COLORS[i % DEST_COLORS.length];
                    const pct = destTotal > 0 ? (Number(dest.value) / destTotal) * 100 : 0;
                    return (
                      <Box key={i}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: c }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{dest.name}</Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>{dest.value}%</Typography>
                        </Stack>
                        <Box sx={{ height: 4, borderRadius: 4, bgcolor: 'action.hover', overflow: 'hidden' }}>
                          <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: c, borderRadius: 4, transformOrigin: 'left', animation: `${growX} 1s ${0.5 + i * 0.06}s ease-out both` }} />
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </>
            ) : (
              <EmptyState title="No Destination Data" description="Travel destination distribution will display here." />
            )}
          </GlassCard>
        </Grid>
      </Grid>

      {/* ───────── Streams ───────── */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 3, height: '100%', animation: `${fadeUp} .6s .55s ease-out both` }}>
            {sectionTitle('Recent Bookings Stream', 'Latest flight & hotel bookings', (
              <Chip label="View all" size="small" onClick={() => navigate('/bookings')} sx={{ fontWeight: 700, cursor: 'pointer' }} />
            ))}
            {recentBookings.length > 0 ? (
              <Stack spacing={1.5}>
                {recentBookings.map((b, i) => (
                  <GlassCard key={i} sx={{ ...rowCardSx('#10B981'), animation: `${slideInRow} .4s ${i * 0.07}s ease-out both` }}>
                    <Box sx={{ minWidth: 0, mr: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {b.title || b.destination || 'Flight / Hotel Booking'}
                      </Typography>
                      {b.userName && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Traveler: {b.userName} {b.userEmail ? `(${b.userEmail})` : ''}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {b.bookingReference || b.id ? `Ref: ${b.bookingReference || b.id}` : ''}
                        {b.vendor ? ` • Vendor: ${b.vendor}` : ''}
                      </Typography>
                    </Box>
                    <Chip label={`$${b.amount ? Number(b.amount).toLocaleString() : '0'}`} size="small" color="success" sx={{ fontWeight: 700, flexShrink: 0 }} />
                  </GlassCard>
                ))}
              </Stack>
            ) : (
              <EmptyState title="No Recent Bookings" description="Trip bookings created will stream live here." />
            )}
          </GlassCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 3, height: '100%', animation: `${fadeUp} .6s .65s ease-out both` }}>
            {sectionTitle('Live SOS Incidents', 'Geotagged distress signals from travelers', (
              <Chip
                label="Panic Radar"
                color="error"
                size="small"
                onClick={() => navigate('/emergency')}
                sx={{ fontWeight: 700, cursor: 'pointer', animation: recentAlerts.length ? `${pulseGlow} 2s infinite` : 'none' }}
              />
            ))}
            {recentAlerts.length > 0 ? (
              <Stack spacing={1.5}>
                {recentAlerts.slice(0, 5).map((alert, i) => (
                  <GlassCard
                    key={alert.id || i}
                    onClick={() => navigate('/emergency')}
                    sx={{ ...rowCardSx('#EF4444'), cursor: 'pointer', animation: `${slideInRow} .4s ${i * 0.07}s ease-out both` }}
                  >
                    <Box sx={{ minWidth: 0, mr: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'error.main' }}>
                        {alert.title || alert.type || 'Emergency SOS Alert'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {alert.country || 'Global'} • {alert.description || 'Geotagged distress alert'}
                      </Typography>
                      {alert.createdAt && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                          Triggered: {new Date(alert.createdAt).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                    <Chip label="ACTIVE" size="small" color="error" sx={{ fontWeight: 700, flexShrink: 0 }} />
                  </GlassCard>
                ))}
              </Stack>
            ) : (
              <EmptyState title="No Active SOS Events" description="Geotagged panic distress alerts will display live here." />
            )}
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
};
