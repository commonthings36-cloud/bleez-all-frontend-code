import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid2 as Grid,
  Typography,
  Stack,
  Chip,
  Button,
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
import { apiClient } from '@/services/apiClient';

const DEST_COLORS = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6'];


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
    {
      title: 'Total Users',
      value: totalUsersCount.toString(),
      change: userGrowth,
      isUp: true,
      icon: <PeopleIcon />,
      color: '#6366F1',
    },
    {
      title: 'Online Users',
      value: onlineUsersCount.toString(),
      change: onlineGrowth,
      isUp: true,
      icon: <WifiTetheringIcon />,
      color: '#10B981',
    },
    {
      title: 'Monthly Revenue',
      value: `$${monthlyRevenue.toLocaleString()}`,
      change: revenueGrowth,
      isUp: true,
      icon: <AttachMoneyIcon />,
      color: '#F59E0B',
    },
    {
      title: 'Total Trips',
      value: totalTripsCount.toString(),
      change: tripGrowth,
      isUp: true,
      icon: <MapIcon />,
      color: '#8B5CF6',
    },
    {
      title: 'API Utilised',
      value: apiUtilisedCount.toString(),
      change: apiGrowth,
      isUp: true,
      icon: <AutoAwesomeIcon />,
      color: '#EC4899',
    },
    {
      title: 'Active SOS Alerts',
      value: `${recentAlerts.length} Active`,
      change: `${recentAlerts.length} Active`,
      isUp: false,
      icon: <WarningAmberIcon />,
      color: '#EF4444',
    },
    {
      title: 'Payments Processed',
      value: `$${paymentsProcessed.toLocaleString()}`,
      change: paymentGrowth,
      isUp: true,
      icon: <PaymentIcon />,
      color: '#06B6D4',
    },
    {
      title: 'Community Posts',
      value: communityPosts.length.toString(),
      change: communityGrowth,
      isUp: true,
      icon: <ForumIcon />,
      color: '#3B82F6',
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Bleez.AI Platform Console"
        subtitle="Real-time operational metrics, global threat monitoring, and booking analytics."
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Overview' }]}
        action={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              label={apiConnected ? 'System Online' : 'Connecting...'}
              color={apiConnected ? 'success' : 'warning'}
              variant="filled"
              onClick={() => navigate('/api-monitoring')}
              sx={{ fontWeight: 800, cursor: 'pointer' }}
            />
            <Chip
              label={
                liveLocationData?.country
                  ? `Region: ${liveLocationData.city ? liveLocationData.city + ', ' : ''}${liveLocationData.country}`
                  : 'Region: Global'
              }
              color="info"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        }
      />

      {/* 8 KPI Statistics Cards Grid */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {stats.map((stat, idx) => {
          const handleCardClick = () => {
            switch (stat.title) {
              case 'Total Users':
              case 'Online Users':
                navigate('/users');
                break;
              case 'Monthly Revenue':
              case 'Payments Processed':
                navigate('/payments');
                break;
              case 'Total Trips':
                navigate('/destinations');
                break;
              case 'API Utilised':
                navigate('/api-monitoring');
                break;
              case 'Active SOS Alerts':
                navigate('/emergency');
                break;
              case 'Community Posts':
                navigate('/community');
                break;
              default:
                break;
            }
          };

          return (
            <Grid key={idx} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <GlassCard
                onClick={handleCardClick}
                sx={{
                  p: 2.5,
                  height: '100%',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: stat.color,
                    boxShadow: `0 8px 24px -4px ${stat.color}40`,
                    transform: 'translateY(-3px)',
                  },
                  transition: 'all 0.25s ease-in-out',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography variant="caption" color={stat.isUp ? 'success.main' : 'error.main'} sx={{ fontWeight: 700 }}>
                        {stat.isUp ? '↗' : '↘'} {stat.change}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        vs last month
                      </Typography>
                    </Stack>
                  </Box>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: `${stat.color}15`,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Stack>
              </GlassCard>
            </Grid>
          );
        })}
      </Grid>

      {/* Analytics & Distribution Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue & Booking Trends Area Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <GlassCard sx={{ p: 3, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Revenue & Booking Trends
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monthly performance analytics and AI itinerary prompt growth
                </Typography>
              </Box>
              <Chip label="Live MongoDB Stream" size="small" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
            </Stack>

            {revenueTrendData.length > 0 ? (
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrendData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                    <YAxis stroke="#94A3B8" fontSize={12} />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue ($)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <EmptyState title="No Revenue Trends Yet" description="Revenue metrics will stream live as bookings are processed." />
            )}
          </GlassCard>
        </Grid>

        {/* Top Travel Destinations Pie Chart */}
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 3, height: '100%' }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Top Travel Destinations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active traveler distribution by country
              </Typography>
            </Box>

            {destinationChartData.length > 0 ? (
              <>
                <Box sx={{ width: '100%', height: 220, display: 'flex', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={destinationChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                        {destinationChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>

                <Stack spacing={1} sx={{ mt: 1 }}>
                  {destinationChartData.map((dest, i) => (
                    <Stack key={i} direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: dest.color }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {dest.name}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {dest.value}%
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </>
            ) : (
              <EmptyState title="No Destination Data" description="Travel destination distribution will display here." />
            )}
          </GlassCard>
        </Grid>
      </Grid>

      {/* Streams Grid: Recent Bookings & Live SOS Incidents */}
      <Grid container spacing={3}>
        {/* Recent Bookings Stream */}
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Recent Bookings Stream
            </Typography>
            {recentBookings.length > 0 ? (
              <Stack spacing={2}>
                {recentBookings.map((b, i) => (
                  <GlassCard key={i} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

        {/* Live SOS Incidents */}
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 3, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Live SOS Incidents
              </Typography>
              <Chip
                label="Panic Radar"
                color="error"
                size="small"
                onClick={() => navigate('/emergency')}
                sx={{ fontWeight: 700, cursor: 'pointer' }}
              />
            </Stack>
            {recentAlerts.length > 0 ? (
              <Stack spacing={2}>
                {recentAlerts.slice(0, 5).map((alert, i) => (
                  <GlassCard
                    key={alert.id || i}
                    onClick={() => navigate('/emergency')}
                    sx={{
                      p: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderColor: 'error.main',
                      cursor: 'pointer',
                    }}
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
