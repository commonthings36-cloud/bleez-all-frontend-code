import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert, Avatar, Box, Button, Chip, Divider, Drawer, IconButton, InputAdornment, LinearProgress, Stack, TextField,
  ToggleButton, ToggleButtonGroup, Typography, keyframes,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import AndroidIcon from '@mui/icons-material/Android';
import LanguageIcon from '@mui/icons-material/Language';
import GroupIcon from '@mui/icons-material/Group';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ChatIcon from '@mui/icons-material/Chat';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MemoryIcon from '@mui/icons-material/Memory';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { apiClient } from '@/services/apiClient';

type PlatformKey = 'IOS' | 'ANDROID' | 'WEB';
const PLATFORMS: Record<PlatformKey, { label: string; color: string; icon: React.ReactElement }> = {
  IOS: { label: 'iOS App', color: '#6366F1', icon: <PhoneIphoneIcon sx={{ fontSize: 16 }} /> },
  ANDROID: { label: 'Android App', color: '#F59E0B', icon: <AndroidIcon sx={{ fontSize: 16 }} /> },
  WEB: { label: 'Web App', color: '#3B82F6', icon: <LanguageIcon sx={{ fontSize: 16 }} /> },
};
const platformKey = (p?: string): PlatformKey => (p === 'MOBILE_APP_IOS' ? 'IOS' : p === 'MOBILE_APP_ANDROID' ? 'ANDROID' : 'WEB');
const MOBILE = '#EC4899';
const WEB = '#3B82F6';
const MONEY = '#10B981'; // green is reserved for money

const fadeUp = keyframes`from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}`;
const growX = keyframes`from{transform:scaleX(0)}to{transform:scaleX(1)}`;

const PlatformChip: React.FC<{ platform?: string }> = ({ platform }) => {
  const p = PLATFORMS[platformKey(platform)];
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', alignSelf: 'center', flexShrink: 0, height: 28, gap: 0.75, px: 1.5, borderRadius: '8px', bgcolor: `${p.color}1F`, color: p.color, fontWeight: 700, fontSize: '0.8rem', lineHeight: 1, whiteSpace: 'nowrap', border: `1px solid ${p.color}40` }}>
      {p.icon}{p.label}
    </Box>
  );
};

interface Row {
  id: string;
  fullName: string;
  userEmail: string;
  platform: PlatformKey;
  rawPlatform?: string;
  trips: number;
  pdfs: number;
  chats: number;
  weather: number;
  expenses: number;
  tokens: number;
  cost: number;
  activity: number;
}

const toRow = (u: any, i: number): Row => {
  const trips = u.totalTripsPlanned || 0, pdfs = u.totalPdfsGenerated || 0, chats = u.totalChatMessages || 0, weather = u.totalWeatherLookups || 0;
  return {
    id: u.userId || u.userEmail || String(i),
    fullName: u.fullName || 'Traveler',
    userEmail: u.userEmail || '',
    platform: platformKey(u.primaryPlatform),
    rawPlatform: u.primaryPlatform,
    trips, pdfs, chats, weather,
    expenses: Number(u.totalExpensesLoggedUSD || 0),
    tokens: u.totalAiTokensUsed || 0,
    cost: Number(u.estimatedAiCostUSD || 0),
    activity: trips + pdfs + chats + weather,
  };
};

const UsageTip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <Box sx={{ minWidth: 170, px: 1.75, py: 1.25, borderRadius: '14px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: '0 16px 32px -10px rgba(0,0,0,.3)' }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</Typography>
      {[['Mobile', d.mobileActivity, MOBILE], ['Web', d.webActivity, WEB]].map(([n, v, c]: any) => (
        <Stack key={n} direction="row" justifyContent="space-between" spacing={2} sx={{ mt: 0.5 }}>
          <Stack direction="row" spacing={0.75} alignItems="center"><Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: c }} /><Typography variant="body2">{n}</Typography></Stack>
          <Typography variant="body2" sx={{ fontWeight: 800 }}>{Number(v || 0).toLocaleString()}</Typography>
        </Stack>
      ))}
      <Box sx={{ mt: 0.75, pt: 0.75, borderTop: '1px dashed', borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between"><Typography variant="body2" sx={{ fontWeight: 700 }}>Total</Typography><Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>{d.total.toLocaleString()}</Typography></Stack>
      </Box>
    </Box>
  );
};

export const UserwiseAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Row | null>(null);
  const [query, setQuery] = useState('');
  const [platform, setPlatform] = useState<'ALL' | PlatformKey>('ALL');

  const fetchAnalytics = () => {
    setLoading(true);
    setError(null);
    apiClient
      .get('/admin/userwise-analytics')
      .then((res) => res.data && setAnalytics(res.data))
      .catch((e) => setError(e?.response?.data?.message || 'Could not load user analytics.'))
      .finally(() => setLoading(false));
  };
  useEffect(fetchAnalytics, []);

  const allRows: Row[] = useMemo(() => (analytics?.userwiseMatrix || []).map(toRow), [analytics]);
  const maxActivity = useMemo(() => Math.max(1, ...allRows.map((r) => r.activity)), [allRows]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allRows.filter((r) => (platform === 'ALL' || r.platform === platform) && (!q || r.fullName.toLowerCase().includes(q) || r.userEmail.toLowerCase().includes(q)));
  }, [allRows, query, platform]);

  const platformCounts = useMemo(() => {
    const c: Record<PlatformKey, number> = { IOS: 0, ANDROID: 0, WEB: 0 };
    allRows.forEach((r) => { c[r.platform] += 1; });
    return c;
  }, [allRows]);
  const mobileUsers = platformCounts.IOS + platformCounts.ANDROID;
  const split = (Object.keys(PLATFORMS) as PlatformKey[]).map((k) => ({ key: k, name: PLATFORMS[k].label, value: platformCounts[k], color: PLATFORMS[k].color }));

  const series = useMemo(
    () => (analytics?.dailyActivitySeries || []).map((d: any) => ({ ...d, mobileActivity: d.mobileActivity ?? 0, webActivity: d.webActivity ?? 0, total: (d.mobileActivity ?? 0) + (d.webActivity ?? 0) })),
    [analytics]
  );
  const peak = useMemo(() => series.reduce((m: any, d: any) => (!m || d.total > m.total ? d : m), null as any), [series]);
  const sessions = series.reduce((s: number, d: any) => s + d.total, 0);

  const totalTravelers = analytics?.totalTravelers ?? allRows.length;
  const globalTrips = analytics?.globalTripsPlanned ?? 0;
  const globalExpenses = analytics?.globalExpensesUSD ?? 0;
  const globalTokens = analytics?.globalAiTokensUsed ?? 0;

  const exportCsv = () => {
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const head = ['Name', 'Email', 'Platform', 'Trips', 'PDFs', 'AI chat messages', 'Weather lookups', 'Expenses USD', 'AI tokens', 'AI cost USD'];
    const data = rows.map((r) => [r.fullName, r.userEmail, PLATFORMS[r.platform].label, r.trips, r.pdfs, r.chats, r.weather, r.expenses, r.tokens, r.cost]);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([[head, ...data].map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv' }));
    a.download = 'bleez-user-analytics.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const num = (v: number) => (v || 0).toLocaleString();
  const columns: GridColDef<Row>[] = [
    {
      field: 'fullName', headerName: 'Name', width: 200,
      renderCell: (p) => (
        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ height: '100%' }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: '0.85rem', fontWeight: 800 }}>{p.row.fullName.charAt(0).toUpperCase()}</Avatar>
          <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.row.fullName}</Typography>
        </Stack>
      ),
    },
    { field: 'userEmail', headerName: 'Email', width: 250 },
    { field: 'platform', headerName: 'Primary platform', width: 160, renderCell: (p) => <PlatformChip platform={p.row.rawPlatform} /> },
    {
      field: 'activity', headerName: 'Activity', width: 160,
      renderCell: (p) => (
        <Box sx={{ width: '100%' }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{num(p.row.activity)} actions</Typography>
          <Box sx={{ height: 5, borderRadius: 4, bgcolor: 'action.hover', overflow: 'hidden', mt: 0.4 }}>
            <Box sx={{ height: '100%', width: `${(p.row.activity / maxActivity) * 100}%`, borderRadius: 4, bgcolor: 'primary.main', transformOrigin: 'left', animation: `${growX} .9s ease-out both` }} />
          </Box>
        </Box>
      ),
    },
    { field: 'trips', headerName: 'Trips', width: 100, type: 'number', renderCell: (p) => <Typography sx={{ fontWeight: 800, color: 'primary.main', fontSize: '0.9rem' }}>{num(p.value)}</Typography> },
    { field: 'pdfs', headerName: 'PDFs', width: 100, type: 'number', valueFormatter: (v: number) => num(v) },
    { field: 'chats', headerName: 'AI chat msgs', width: 130, type: 'number', valueFormatter: (v: number) => num(v) },
    { field: 'weather', headerName: 'Weather lookups', width: 150, type: 'number', valueFormatter: (v: number) => num(v) },
    {
      field: 'expenses', headerName: 'Expenses', width: 120, type: 'number',
      renderCell: (p) => <Typography sx={{ fontWeight: 800, color: MONEY, fontSize: '0.9rem' }}>${num(p.value)}</Typography>,
    },
    { field: 'tokens', headerName: 'AI tokens', width: 120, type: 'number', renderCell: (p) => <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>{num(p.value)}</Typography> },
    { field: 'cost', headerName: 'AI cost', width: 110, type: 'number', renderCell: (p) => <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>${Number(p.value).toFixed(4)}</Typography> },
  ];

  const kpis = [
    { label: 'Registered travelers', value: totalTravelers.toLocaleString(), sub: allRows.length ? `${Math.round((mobileUsers / allRows.length) * 100)}% mobile · ${Math.round((platformCounts.WEB / allRows.length) * 100)}% web` : '—', color: '#7C3AED', icon: <GroupIcon /> },
    { label: 'Cross-platform trips', value: globalTrips.toLocaleString(), sub: 'Mobile + web plans', color: '#3B82F6', icon: <FlightTakeoffIcon /> },
    { label: 'Total travel expenses', value: `$${globalExpenses.toLocaleString()}`, sub: 'Logged by travelers', color: MONEY, icon: <AttachMoneyIcon /> },
    { label: 'AI tokens used', value: globalTokens.toLocaleString(), sub: 'OpenAI & Gemini', color: '#A855F7', icon: <MemoryIcon /> },
  ];

  const footprint = selected ? [
    { label: 'Trips planned', value: num(selected.trips), color: '#7C3AED', icon: <FlightTakeoffIcon /> },
    { label: 'PDF guides', value: num(selected.pdfs), color: '#EF4444', icon: <PictureAsPdfIcon /> },
    { label: 'AI chat messages', value: num(selected.chats), color: '#3B82F6', icon: <ChatIcon /> },
    { label: 'Weather lookups', value: num(selected.weather), color: '#F59E0B', icon: <WbSunnyIcon /> },
    { label: 'Expenses logged', value: `$${num(selected.expenses)}`, color: MONEY, icon: <AttachMoneyIcon /> },
    { label: 'AI tokens', value: num(selected.tokens), color: '#A855F7', icon: <MemoryIcon /> },
  ] : [];

  return (
    <Box>
      <PageHeader
        title="User Analytics"
        subtitle="Live traveler activity across the iOS, Android and Web apps — trips, PDFs, AI chat, weather, expenses and token spend."
        breadcrumbs={[{ label: 'User Analytics' }]}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportCsv} disabled={!rows.length}>Export CSV</Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchAnalytics} disabled={loading} sx={{ fontWeight: 700 }}>Refresh</Button>
          </Stack>
        }
      />
      {error && <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={fetchAnalytics}>Retry</Button>}>{error}</Alert>}

      {/* KPI row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2.5, mb: 3.5 }}>
        {kpis.map((k, i) => (
          <GlassCard key={k.label} sx={{ p: 2.5, height: 128, display: 'flex', alignItems: 'center', animation: `${fadeUp} .5s ${i * 0.08}s ease-out both`, '&:hover': { transform: 'translateY(-4px)', borderColor: k.color, boxShadow: `0 14px 30px -12px ${k.color}77` } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ width: '100%' }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>{k.label}</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: k.color, lineHeight: 1.25, letterSpacing: '-0.02em' }}>{loading && !analytics ? '…' : k.value}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{k.sub}</Typography>
              </Box>
              <Box sx={{ width: 50, height: 50, borderRadius: '15px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: `linear-gradient(135deg, ${k.color}, ${k.color}bb)`, boxShadow: `0 10px 20px -8px ${k.color}` }}>{k.icon}</Box>
            </Stack>
          </GlassCard>
        ))}
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 3.5 }}>
        <GlassCard sx={{ p: 3, position: 'relative', overflow: 'hidden', animation: `${fadeUp} .6s .3s ease-out both` }}>
          <Box sx={{ position: 'absolute', top: -90, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,.12), transparent 70%)', pointerEvents: 'none' }} />
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2.5, position: 'relative' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Mobile vs Web activity</Typography>
              <Typography variant="body2" color="text.secondary">Daily sessions by platform</Typography>
            </Box>
            <Stack direction="row" spacing={2} alignItems="center">
              {[['Mobile', MOBILE], ['Web', WEB]].map(([n, c]) => (
                <Stack key={n} direction="row" spacing={0.75} alignItems="center"><Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: c }} /><Typography variant="caption" sx={{ fontWeight: 700 }}>{n}</Typography></Stack>
              ))}
              <Stack direction="row" spacing={0.75} alignItems="center"><Box sx={{ width: 16, height: 3, borderRadius: 2, bgcolor: '#7C3AED' }} /><Typography variant="caption" sx={{ fontWeight: 700 }}>Total</Typography></Stack>
            </Stack>
          </Stack>

          {series.length > 0 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 2.5, position: 'relative' }}>
              {[
                { l: 'Total sessions', v: sessions.toLocaleString(), c: '#7C3AED' },
                { l: 'Daily average', v: Math.round(sessions / series.length).toLocaleString(), c: '#06B6D4' },
                { l: 'Peak day', v: peak ? `${peak.day} · ${peak.total.toLocaleString()}` : '—', c: '#F59E0B' },
              ].map((x) => (
                <Box key={x.l} sx={{ px: 1.75, py: 1.25, borderRadius: '14px', bgcolor: `${x.c}14`, border: `1px solid ${x.c}33` }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>{x.l}</Typography>
                  <Typography noWrap sx={{ fontWeight: 800, fontSize: '1.05rem', color: x.c }}>{x.v}</Typography>
                </Box>
              ))}
            </Box>
          )}

          {series.length > 0 ? (
            <Box sx={{ height: 270 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={series} margin={{ top: 16, right: 12, left: -8, bottom: 0 }} barCategoryGap="28%">
                  <defs>
                    <linearGradient id="bMobile" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={MOBILE} /><stop offset="100%" stopColor={MOBILE} stopOpacity={0.55} /></linearGradient>
                    <linearGradient id="bWeb" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={WEB} /><stop offset="100%" stopColor={WEB} stopOpacity={0.55} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 6" vertical={false} opacity={0.15} />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip content={<UsageTip />} cursor={{ fill: 'rgba(124,58,237,.07)', radius: 10 }} />
                  <Bar dataKey="mobileActivity" name="Mobile" stackId="s" fill="url(#bMobile)" maxBarSize={44} animationDuration={1100} />
                  <Bar dataKey="webActivity" name="Web" stackId="s" fill="url(#bWeb)" radius={[10, 10, 0, 0]} maxBarSize={44} animationDuration={1100} />
                  <Line type="monotone" dataKey="total" name="Total" stroke="#7C3AED" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, stroke: '#fff', fill: '#7C3AED' }} activeDot={{ r: 6 }} animationDuration={1500} />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <EmptyState title="No activity history yet" description="Daily session counts will appear here once travelers use the apps." />
          )}
        </GlassCard>

        <GlassCard sx={{ p: 3, animation: `${fadeUp} .6s .4s ease-out both` }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Platform mix</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Travelers by primary platform</Typography>
          {allRows.length > 0 ? (
            <>
              <Box sx={{ height: 190, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={split} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={4} cornerRadius={6} stroke="none" animationDuration={1200}>
                      {split.map((s) => <Cell key={s.key} fill={s.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{allRows.length}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>travelers</Typography>
                </Box>
              </Box>
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {split.map((s) => {
                  const pct = (s.value / allRows.length) * 100;
                  return (
                    <Box key={s.key}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Stack direction="row" spacing={1} alignItems="center"><Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: s.color }} /><Typography variant="body2" sx={{ fontWeight: 600 }}>{s.name}</Typography></Stack>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{s.value} · {pct.toFixed(0)}%</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={pct} sx={{ height: 5, borderRadius: 4, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: s.color, borderRadius: 4 } }} />
                    </Box>
                  );
                })}
              </Stack>
            </>
          ) : (
            <EmptyState title="No travelers yet" description="Platform split will appear once users sign up." />
          )}
        </GlassCard>
      </Box>

      {/* Userwise table */}
      <GlassCard sx={{ p: 2.5, animation: `${fadeUp} .6s .5s ease-out both` }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Traveler activity matrix</Typography>
          <Typography variant="body2" color="text.secondary">Click any row to open the traveler's full activity profile</Typography>
        </Box>
        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            size="small" placeholder="Search name or email…" value={query} onChange={(e) => setQuery(e.target.value)}
            sx={{ width: { xs: '100%', sm: 300 } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
          <ToggleButtonGroup size="small" exclusive value={platform} onChange={(_, v) => v && setPlatform(v)} color="primary">
            <ToggleButton value="ALL" sx={{ px: 2, fontWeight: 700 }}>All</ToggleButton>
            {(Object.keys(PLATFORMS) as PlatformKey[]).map((k) => <ToggleButton key={k} value={k} sx={{ px: 2, fontWeight: 700 }}>{PLATFORMS[k].label.replace(' App', '')}</ToggleButton>)}
          </ToggleButtonGroup>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Showing {rows.length} of {allRows.length}</Typography>
        </Stack>

        {!loading && rows.length === 0 ? (
          <EmptyState title="No travelers found" description={allRows.length ? 'Nothing matches the current filters.' : 'No analytics data yet.'} />
        ) : (
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading && !analytics}
              rowHeight={60}
              autoHeight
              onRowClick={(p) => setSelected(p.row)}
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } }, sorting: { sortModel: [{ field: 'activity', sort: 'desc' }] } }}
              sx={{ border: 0, minWidth: 1500, '& .MuiDataGrid-row': { cursor: 'pointer' }, '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 800 }, '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' } }}
            />
          </Box>
        )}
      </GlassCard>

      {/* Traveler profile drawer */}
      <Drawer anchor="right" open={!!selected} onClose={() => setSelected(null)} PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, borderRadius: 0 } }}>
        {selected && (
          <Box sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Traveler profile</Typography>
              <IconButton onClick={() => setSelected(null)}><CloseIcon /></IconButton>
            </Stack>
            <Divider sx={{ mb: 3 }} />
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main', fontWeight: 800, fontSize: '1.3rem' }}>{selected.fullName.charAt(0).toUpperCase()}</Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography noWrap sx={{ fontWeight: 800, fontSize: '1.1rem' }}>{selected.fullName}</Typography>
                <Typography noWrap variant="body2" color="text.secondary">{selected.userEmail}</Typography>
                <Box sx={{ mt: 0.75 }}><PlatformChip platform={selected.rawPlatform} /></Box>
              </Box>
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Feature footprint</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 1.5 }}>
              {footprint.map((f) => (
                <Box key={f.label} sx={{ p: 1.75, height: 96, borderRadius: '14px', border: '1px solid', borderColor: 'divider', borderLeft: `3px solid ${f.color}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: f.color, '& svg': { fontSize: 18 } }}>
                    {f.icon}<Typography variant="caption" color="text.secondary" noWrap sx={{ fontWeight: 700 }}>{f.label}</Typography>
                  </Stack>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color: f.color }}>{f.value}</Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ mt: 2.5, p: 2, borderRadius: '14px', bgcolor: 'rgba(168,85,247,.08)', border: '1px solid rgba(168,85,247,.25)' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Estimated AI spend</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#A855F7' }}>${selected.cost.toFixed(4)}</Typography>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};
