import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Chip, Skeleton, Stack, ToggleButton, ToggleButtonGroup, Typography, useTheme } from '@mui/material';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { apiClient } from '@/services/apiClient';
import type { BillingTransaction, SubscriptionAnalytics } from '@/features/subscriptions/types/subscription.types';

interface UserDoc {
  createdAt?: string;
  roles?: string[];
  online?: boolean;
}

interface AiTelemetry {
  totalTokensUsed?: number;
  totalCostUSD?: number;
}

type Slice<T> = { data: T | null; error: boolean };

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const Kpi: React.FC<{ label: string; value?: string; hint?: string; icon: React.ReactNode; loading: boolean; unavailable?: boolean }> = ({ label, value, hint, icon, loading, unavailable }) => (
  <GlassCard sx={{ p: 2.5, height: '100%' }}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</Typography>
        {loading ? <Skeleton width={90} height={44} /> : (
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>{unavailable ? '—' : value}</Typography>
        )}
        <Typography variant="caption" color="text.secondary">{unavailable ? 'Unavailable' : hint}</Typography>
      </Box>
      <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'action.hover', color: 'primary.main', display: 'flex' }}>{icon}</Box>
    </Stack>
  </GlassCard>
);

const QUICK_ACTIONS = [
  { to: '/users', label: 'Review users', desc: 'Roles and presence' },
  { to: '/subscriptions', label: 'Subscription plans', desc: 'Plans, features, subscribers' },
  { to: '/payments', label: 'Payments', desc: 'Transactions and providers' },
  { to: '/campaigns', label: 'Campaigns', desc: 'Approvals and performance' },
  { to: '/community', label: 'Moderate community', desc: 'Messages and presence' },
  { to: '/api-monitoring', label: 'Platform health', desc: 'API usage and errors' },
];

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Slice<UserDoc[]>>({ data: null, error: false });
  const [analytics, setAnalytics] = useState<Slice<SubscriptionAnalytics>>({ data: null, error: false });
  const [txs, setTxs] = useState<Slice<BillingTransaction[]>>({ data: null, error: false });
  const [ai, setAi] = useState<Slice<AiTelemetry>>({ data: null, error: false });
  const [months, setMonths] = useState(6);

  const load = useCallback(async () => {
    setLoading(true);
    const [u, a, t, g] = await Promise.allSettled([
      apiClient.get('/admin/users'),
      apiClient.get('/admin/subscriptions/analytics'),
      apiClient.get('/admin/subscriptions/transactions'),
      apiClient.get('/admin/ai-telemetry'),
    ]);
    setUsers(u.status === 'fulfilled' ? { data: Array.isArray(u.value.data) ? u.value.data : [], error: false } : { data: null, error: true });
    setAnalytics(a.status === 'fulfilled' ? { data: a.value.data, error: false } : { data: null, error: true });
    setTxs(t.status === 'fulfilled' ? { data: Array.isArray(t.value.data) ? t.value.data : [], error: false } : { data: null, error: true });
    setAi(g.status === 'fulfilled' ? { data: g.value.data, error: false } : { data: null, error: true });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const signupSeries = useMemo(() => {
    const list = users.data || [];
    const now = new Date();
    const buckets: { key: string; month: string; signups: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ key: monthKey(d), month: d.toLocaleString(undefined, { month: 'short' }), signups: 0 });
    }
    list.forEach((u) => {
      if (!u.createdAt) return;
      const b = buckets.find((x) => x.key === monthKey(new Date(u.createdAt!)));
      if (b) b.signups += 1;
    });
    return buckets;
  }, [users.data, months]);

  const planMix = useMemo(() => {
    const a = analytics.data;
    if (!a) return [];
    return [
      { name: 'Free', value: a.freeUsers },
      { name: 'Explorer', value: a.explorerSubscribers },
      { name: 'Business', value: a.businessSubscribers },
    ].filter((p) => p.value > 0);
  }, [analytics.data]);

  const txByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    (txs.data || []).forEach((t) => {
      map[t.status || 'UNKNOWN'] = (map[t.status || 'UNKNOWN'] || 0) + 1;
    });
    return Object.entries(map).map(([status, count]) => ({ status, count }));
  }, [txs.data]);

  const recentTxs = useMemo(
    () => [...(txs.data || [])].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 5),
    [txs.data]
  );

  const colors = [theme.palette.grey[500], theme.palette.primary.main, theme.palette.secondary.main];
  const failedAll = users.error && analytics.error && txs.error && ai.error;

  return (
    <Box>
      <PageHeader
        title="Overview"
        subtitle="Platform health at a glance. Every figure is calculated from live API data."
        action={<Button variant="outlined" startIcon={<RefreshIcon />} onClick={load} disabled={loading}>Refresh</Button>}
      />

      {failedAll && !loading && (
        <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={load}>Retry</Button>}>
          None of the admin APIs responded. Check that the backend is running and your session is still valid.
        </Alert>
      )}

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, mb: 3 }}>
        <Kpi
          label="Users" icon={<PeopleOutlinedIcon />} loading={loading} unavailable={users.error}
          value={(users.data?.length ?? 0).toLocaleString()}
          hint={`${(users.data || []).filter((u) => u.online).length} online · ${(users.data || []).filter((u) => u.roles?.includes('ADMIN')).length} admin`}
        />
        <Kpi
          label="Active subscribers" icon={<WorkspacePremiumOutlinedIcon />} loading={loading} unavailable={analytics.error}
          value={(analytics.data?.activeSubscribers ?? 0).toLocaleString()}
          hint={`${analytics.data?.freeUsers ?? 0} on free plan`}
        />
        <Kpi
          label="Estimated MRR" icon={<PaymentsOutlinedIcon />} loading={loading} unavailable={analytics.error}
          value={`${(analytics.data?.estimatedMRR ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${analytics.data?.currency ?? ''}`.trim()}
          hint="From active plan prices"
        />
        <Kpi
          label="AI spend" icon={<AutoAwesomeOutlinedIcon />} loading={loading} unavailable={ai.error}
          value={`$${(ai.data?.totalCostUSD ?? 0).toFixed(2)}`}
          hint={`${(ai.data?.totalTokensUsed ?? 0).toLocaleString()} tokens`}
        />
      </Box>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, mb: 3 }}>
        <GlassCard sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>New sign-ups</Typography>
            <ToggleButtonGroup size="small" exclusive value={months} onChange={(_, v) => v && setMonths(v)} aria-label="Range">
              <ToggleButton value={3}>3M</ToggleButton>
              <ToggleButton value={6}>6M</ToggleButton>
              <ToggleButton value={12}>12M</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          {users.error ? <Typography color="text.secondary">Could not load users.</Typography> : (
            <Box sx={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={signupSeries} margin={{ left: -20, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="signupFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="signups" name="Sign-ups" stroke={theme.palette.primary.main} strokeWidth={2.5} fill="url(#signupFill)" isAnimationActive />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          )}
        </GlassCard>

        <GlassCard sx={{ p: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Plan mix</Typography>
          {analytics.error ? <Typography color="text.secondary">Could not load analytics.</Typography> : planMix.length === 0 ? (
            <Typography color="text.secondary" sx={{ mt: 2 }}>{loading ? 'Loading…' : 'No users to show.'}</Typography>
          ) : (
            <Box sx={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={planMix} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3} label={(e: any) => `${e.name} ${e.value}`}>
                    {planMix.map((p, i) => <Cell key={p.name} fill={colors[i % colors.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          )}
        </GlassCard>
      </Box>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, mb: 3 }}>
        <GlassCard sx={{ p: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Transactions by status</Typography>
          {txs.error ? <Typography color="text.secondary">Could not load transactions.</Typography> : txByStatus.length === 0 ? (
            <Typography color="text.secondary">{loading ? 'Loading…' : 'No transactions recorded yet.'}</Typography>
          ) : (
            <Box sx={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={txByStatus} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                  <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Transactions" fill={theme.palette.secondary.main} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}
        </GlassCard>

        <GlassCard sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Latest transactions</Typography>
            <Button component={RouterLink} to="/payments" size="small" endIcon={<ArrowForwardIcon />}>View all</Button>
          </Stack>
          {recentTxs.length === 0 ? (
            <Typography color="text.secondary">{loading ? 'Loading…' : txs.error ? 'Could not load transactions.' : 'Nothing yet.'}</Typography>
          ) : recentTxs.map((t) => (
            <Stack key={t.id} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{t.productId || t.transactionType}</Typography>
                <Typography variant="caption" color="text.secondary">{t.provider} · {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}</Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                {t.amount != null && <Typography variant="body2" sx={{ fontWeight: 700 }}>{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {t.currency}</Typography>}
                <Chip size="small" label={t.status} />
              </Stack>
            </Stack>
          ))}
        </GlassCard>
      </Box>

      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>Jump to</Typography>
      <Box sx={{ display: 'grid', gap: 2, mt: 0.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
        {QUICK_ACTIONS.map((q) => (
          <RouterLink key={q.to} to={q.to} style={{ textDecoration: 'none', color: 'inherit' }}>
            <GlassCard sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', '&:hover': { transform: 'translateY(-2px)' } }}>
              <Box>
                <Typography sx={{ fontWeight: 800 }}>{q.label}</Typography>
                <Typography variant="caption" color="text.secondary">{q.desc}</Typography>
              </Box>
              <ArrowForwardIcon color="primary" />
            </GlassCard>
          </RouterLink>
        ))}
      </Box>
    </Box>
  );
};
