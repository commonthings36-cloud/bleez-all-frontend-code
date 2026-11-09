import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert, Avatar, Box, Button, Chip, InputAdornment, LinearProgress, Stack, TextField,
  ToggleButton, ToggleButtonGroup, Typography, keyframes,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import RefreshIcon from '@mui/icons-material/Refresh';
import MemoryIcon from '@mui/icons-material/Memory';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import BoltIcon from '@mui/icons-material/Bolt';
import SpeedIcon from '@mui/icons-material/Speed';
import CachedIcon from '@mui/icons-material/Cached';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, ReferenceDot,
} from 'recharts';

import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { apiClient } from '@/services/apiClient';

const OPENAI = '#10A37F';
const GEMINI = '#4285F4';

const fadeUp = keyframes`from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}`;
const growX = keyframes`from{transform:scaleX(0)}to{transform:scaleX(1)}`;

// Reference list prices (USD per 1M tokens) – informational only.
const PRICING = [
  { model: 'gpt-4o-mini', provider: 'OpenAI', input: '$0.15', output: '$0.60', color: OPENAI },
  { model: 'gpt-4o', provider: 'OpenAI', input: '$2.50', output: '$10.00', color: OPENAI },
  { model: 'gemini-1.5-flash', provider: 'Gemini', input: '$0.075', output: '$0.30', color: GEMINI },
  { model: 'gemini-1.5-pro', provider: 'Gemini', input: '$1.25', output: '$5.00', color: GEMINI },
];

interface AiLog {
  id: string;
  fullName?: string;
  userEmail?: string;
  provider: string;
  model: string;
  task: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  createdAt?: string;
  rank?: number;
}

// Backend uses aiProvider / llmModel / requestTask; accept the shorter names too.
const toLog = (l: any, i: number): AiLog => ({
  id: l.id || String(i),
  fullName: l.fullName,
  userEmail: l.userEmail,
  provider: String(l.aiProvider || l.provider || '').toUpperCase() === 'OPENAI' ? 'OpenAI' : 'Gemini',
  model: l.llmModel || l.model || '—',
  task: l.requestTask || l.requestType || '—',
  promptTokens: l.promptTokens ?? 0,
  completionTokens: l.completionTokens ?? 0,
  totalTokens: l.totalTokens ?? (l.promptTokens ?? 0) + (l.completionTokens ?? 0),
  cost: Number(l.estimatedCostUSD ?? 0),
  createdAt: l.createdAt,
});

const prettyTask = (t: string) => t.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
const providerColor = (p: string) => (p === 'OpenAI' ? OPENAI : GEMINI);

const ChartTip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ px: 1.5, py: 1, borderRadius: '12px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: '0 12px 28px -8px rgba(0,0,0,.25)' }}>
      {label && <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>{label}</Typography>}
      {payload.map((p: any, i: number) => (
        <Typography key={i} variant="body2" sx={{ fontWeight: 800, color: p.color || p.payload?.color }}>
          {p.name}: {Number(p.value).toLocaleString()}
        </Typography>
      ))}
    </Box>
  );
};

const UsageTip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <Box sx={{ minWidth: 170, px: 1.75, py: 1.25, borderRadius: '14px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: '0 16px 32px -10px rgba(0,0,0,.3)' }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</Typography>
      {[['OpenAI', d.openAiTokens, OPENAI], ['Gemini', d.geminiTokens, GEMINI]].map(([n, v, c]: any) => (
        <Stack key={n} direction="row" justifyContent="space-between" spacing={2} sx={{ mt: 0.5 }}>
          <Stack direction="row" spacing={0.75} alignItems="center"><Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: c }} /><Typography variant="body2">{n}</Typography></Stack>
          <Typography variant="body2" sx={{ fontWeight: 800 }}>{Number(v).toLocaleString()}</Typography>
        </Stack>
      ))}
      <Box sx={{ mt: 0.75, pt: 0.75, borderTop: '1px dashed', borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between"><Typography variant="body2" sx={{ fontWeight: 700 }}>Total</Typography><Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>{d.total.toLocaleString()}</Typography></Stack>
      </Box>
    </Box>
  );
};

export const AiManagementPage: React.FC = () => {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState<'all' | 'OpenAI' | 'Gemini'>('all');

  const fetchAiTelemetry = () => {
    setLoading(true);
    setError(null);
    apiClient
      .get('/admin/ai-telemetry')
      .then((res) => res.data && setTelemetry(res.data))
      .catch((e) => setError(e?.response?.data?.message || 'Could not load AI telemetry.'))
      .finally(() => setLoading(false));
  };
  useEffect(fetchAiTelemetry, []);

  const logs: AiLog[] = useMemo(() => {
    const list: AiLog[] = (telemetry?.recentAiLogs || []).map(toLog);
    // Rank by total tokens: #1 = heaviest consumer.
    [...list].sort((a, b) => b.totalTokens - a.totalTokens).forEach((l, i) => { l.rank = i + 1; });
    return list;
  }, [telemetry]);

  const totalTokens = telemetry?.totalTokensUsed ?? 0;
  const openAiTokens = telemetry?.openAiTokens ?? 0;
  const geminiTokens = telemetry?.geminiTokens ?? 0;
  const openAiCost = telemetry?.openAiCostUSD ?? 0;
  const geminiCost = telemetry?.geminiCostUSD ?? 0;
  const totalCost = telemetry?.totalCostUSD ?? 0;
  const avgCostPerRequest = logs.length ? logs.reduce((s, l) => s + l.cost, 0) / logs.length : 0;

  // Daily series from the backend if present, otherwise built from the audit logs.
  const series = useMemo(() => {
    if (Array.isArray(telemetry?.dailySeries) && telemetry.dailySeries.length)
      return telemetry.dailySeries.map((d: any) => ({ ...d, openAiTokens: d.openAiTokens ?? 0, geminiTokens: d.geminiTokens ?? 0, total: (d.openAiTokens ?? 0) + (d.geminiTokens ?? 0) }));
    const byDay = new Map<string, { day: string; ts: number; openAiTokens: number; geminiTokens: number }>();
    logs.forEach((l) => {
      if (!l.createdAt) return;
      const d = new Date(l.createdAt);
      const key = d.toISOString().slice(0, 10);
      const row = byDay.get(key) || { day: d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }), ts: +d, openAiTokens: 0, geminiTokens: 0 };
      if (l.provider === 'OpenAI') row.openAiTokens += l.totalTokens; else row.geminiTokens += l.totalTokens;
      byDay.set(key, row);
    });
    return Array.from(byDay.values()).sort((a, b) => a.ts - b.ts).map((d) => ({ ...d, total: d.openAiTokens + d.geminiTokens }));
  }, [telemetry, logs]);

  const peak = useMemo(() => series.reduce((m: any, d: any) => (!m || d.total > m.total ? d : m), null as any), [series]);
  const weekTotal = series.reduce((sum: number, d: any) => sum + d.total, 0);
  const dailyAvg = series.length ? Math.round(weekTotal / series.length) : 0;

  const split = [
    { name: 'OpenAI', value: openAiTokens, color: OPENAI },
    { name: 'Gemini', value: geminiTokens, color: GEMINI },
  ];
  const splitTotal = openAiTokens + geminiTokens;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs.filter((l) => (provider === 'all' || l.provider === provider) && (!q || [l.fullName, l.userEmail, l.model, l.task, l.provider].some((v) => (v || '').toLowerCase().includes(q))));
  }, [logs, query, provider]);

  const exportCsv = () => {
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const head = ['Time', 'Name', 'Email', 'Provider', 'Model', 'Task', 'Prompt tokens', 'Completion tokens', 'Total tokens', 'Cost USD'];
    const data = rows.map((l) => [l.createdAt, l.fullName, l.userEmail, l.provider, l.model, l.task, l.promptTokens, l.completionTokens, l.totalTokens, l.cost]);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([[head, ...data].map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv' }));
    a.download = 'bleez-ai-usage.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const columns: GridColDef<AiLog>[] = [
    {
      field: 'rank', headerName: '#', width: 70, align: 'center', headerAlign: 'center', type: 'number',
      renderCell: (p) => {
        const r = p.value as number;
        const c = r === 1 ? '#F59E0B' : r === 2 ? '#94A3B8' : r === 3 ? '#B45309' : undefined;
        return c ? (
          <Box sx={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.8rem', bgcolor: c, boxShadow: `0 4px 10px -3px ${c}` }}>{r}</Box>
        ) : <Typography sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.85rem' }}>{r}</Typography>;
      },
    },
    { field: 'createdAt', headerName: 'Date', width: 120, valueFormatter: (v: string) => (v ? new Date(v).toLocaleDateString() : '—') },
    { field: 'time', headerName: 'Time', width: 110, valueGetter: (_v, r) => (r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—') },
    { field: 'fullName', headerName: 'Name', width: 170, valueFormatter: (v: string) => v || '—', renderCell: (p) => <Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }} noWrap>{p.value || '—'}</Typography> },
    { field: 'userEmail', headerName: 'Email', width: 250, valueFormatter: (v: string) => v || '—' },
    {
      field: 'provider', headerName: 'Provider', width: 130,
      renderCell: (p) => (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
          <Avatar sx={{ width: 24, height: 24, bgcolor: providerColor(p.row.provider), fontSize: '0.65rem', fontWeight: 800 }}>{p.row.provider === 'OpenAI' ? 'OA' : 'G'}</Avatar>
          <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{p.row.provider}</Typography>
        </Stack>
      ),
    },
    { field: 'model', headerName: 'Model', width: 170, renderCell: (p) => <Chip label={p.value} size="small" variant="outlined" sx={{ fontWeight: 700, borderColor: providerColor(p.row.provider), color: providerColor(p.row.provider) }} /> },
    { field: 'task', headerName: 'Task', width: 220, renderCell: (p) => <Chip label={prettyTask(p.value)} size="small" sx={{ fontWeight: 600 }} /> },
    { field: 'promptTokens', headerName: 'Prompt tokens', width: 140, type: 'number', valueFormatter: (v: number) => (v ?? 0).toLocaleString() },
    { field: 'completionTokens', headerName: 'Completion tokens', width: 160, type: 'number', valueFormatter: (v: number) => (v ?? 0).toLocaleString() },
    { field: 'totalTokens', headerName: 'Total tokens', width: 130, type: 'number', renderCell: (p) => <Typography sx={{ fontWeight: 800, color: 'primary.main', fontSize: '0.9rem' }}>{(p.value ?? 0).toLocaleString()}</Typography> },
    { field: 'cost', headerName: 'Est. cost', width: 120, type: 'number', renderCell: (p) => <Typography sx={{ fontWeight: 800, color: 'success.main', fontSize: '0.9rem' }}>${Number(p.value).toFixed(5)}</Typography> },
  ];

  const kpis = [
    { label: 'Total tokens consumed', value: totalTokens.toLocaleString(), sub: `${logs.length} requests in log`, color: '#8B5CF6', icon: <MemoryIcon /> },
    { label: 'OpenAI spend', value: `$${openAiCost.toFixed(4)}`, sub: `${openAiTokens.toLocaleString()} tokens`, color: OPENAI, icon: <AutoAwesomeIcon /> },
    { label: 'Gemini spend', value: `$${geminiCost.toFixed(4)}`, sub: `${geminiTokens.toLocaleString()} tokens`, color: GEMINI, icon: <SmartToyIcon /> },
    { label: 'Gross AI cost', value: `$${totalCost.toFixed(4)}`, sub: logs.length ? `Avg $${avgCostPerRequest.toFixed(5)} / request` : 'No requests yet', color: '#10B981', icon: <AttachMoneyIcon /> },
  ];

  const cache = Number(telemetry?.cacheHitRatioPercent ?? 0);
  const health = [
    { label: 'Active model', value: telemetry?.activeModel || '—', icon: <BoltIcon />, color: '#7C3AED' },
    { label: 'Fallback model', value: telemetry?.fallbackModel || '—', icon: <AltRouteIcon />, color: '#F59E0B' },
    { label: 'Avg generation time', value: telemetry?.avgGenerationTimeMs != null ? `${(telemetry.avgGenerationTimeMs / 1000).toFixed(2)} s` : '—', icon: <SpeedIcon />, color: '#06B6D4' },
    { label: 'Cache hit ratio', value: telemetry?.cacheHitRatioPercent != null ? `${cache}%` : '—', icon: <CachedIcon />, color: '#10B981', bar: cache },
  ];

  const iconBox = (color: string, icon: React.ReactNode, size = 50) => (
    <Box sx={{ width: size, height: size, borderRadius: '15px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: `linear-gradient(135deg, ${color}, ${color}bb)`, boxShadow: `0 10px 20px -8px ${color}` }}>{icon}</Box>
  );

  return (
    <Box>
      <PageHeader
        title="AI Token & Cost Console"
        subtitle="Monitor OpenAI and Google Gemini token consumption, model health, API costs and every AI request."
        breadcrumbs={[{ label: 'AI Usage' }]}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportCsv} disabled={!rows.length}>Export CSV</Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchAiTelemetry} disabled={loading} sx={{ fontWeight: 700 }}>Refresh</Button>
          </Stack>
        }
      />
      {error && <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={fetchAiTelemetry}>Retry</Button>}>{error}</Alert>}

      {/* KPI row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2.5, mb: 2.5 }}>
        {kpis.map((k, i) => (
          <GlassCard key={k.label} sx={{ p: 2.5, height: 128, display: 'flex', alignItems: 'center', animation: `${fadeUp} .5s ${i * 0.08}s ease-out both`, '&:hover': { transform: 'translateY(-4px)', borderColor: k.color, boxShadow: `0 14px 30px -12px ${k.color}77` } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ width: '100%' }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>{k.label}</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: k.color, lineHeight: 1.25, letterSpacing: '-0.02em' }}>{loading && !telemetry ? '…' : k.value}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{k.sub}</Typography>
              </Box>
              {iconBox(k.color, k.icon)}
            </Stack>
          </GlassCard>
        ))}
      </Box>

      {/* Model health row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2.5, mb: 3.5 }}>
        {health.map((h, i) => (
          <GlassCard key={h.label} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.75, animation: `${fadeUp} .5s ${0.3 + i * 0.07}s ease-out both` }}>
            {iconBox(h.color, h.icon, 42)}
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>{h.label}</Typography>
              <Typography noWrap sx={{ fontWeight: 800, fontSize: '1.05rem' }}>{h.value}</Typography>
              {h.bar != null && (
                <Box sx={{ mt: 0.5, height: 4, borderRadius: 4, bgcolor: 'action.hover', overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${Math.min(100, h.bar)}%`, bgcolor: h.color, transformOrigin: 'left', animation: `${growX} 1s .6s ease-out both` }} />
                </Box>
              )}
            </Box>
          </GlassCard>
        ))}
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 3.5 }}>
        <GlassCard sx={{ p: 3, position: 'relative', overflow: 'hidden', animation: `${fadeUp} .6s .35s ease-out both` }}>
          <Box sx={{ position: 'absolute', top: -90, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,.14), transparent 70%)', pointerEvents: 'none' }} />
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2.5, position: 'relative' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Token usage over time</Typography>
              <Typography variant="body2" color="text.secondary">Daily tokens, split by provider</Typography>
            </Box>
            <Stack direction="row" spacing={2} alignItems="center">
              {[['OpenAI', OPENAI], ['Gemini', GEMINI]].map(([n, c]) => (
                <Stack key={n} direction="row" spacing={0.75} alignItems="center"><Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: c }} /><Typography variant="caption" sx={{ fontWeight: 700 }}>{n}</Typography></Stack>
              ))}
              <Stack direction="row" spacing={0.75} alignItems="center"><Box sx={{ width: 16, height: 3, borderRadius: 2, bgcolor: '#7C3AED' }} /><Typography variant="caption" sx={{ fontWeight: 700 }}>Total</Typography></Stack>
            </Stack>
          </Stack>

          {series.length > 0 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 2.5, position: 'relative' }}>
              {[
                { l: 'Period total', v: weekTotal.toLocaleString(), c: '#7C3AED' },
                { l: 'Daily average', v: dailyAvg.toLocaleString(), c: '#06B6D4' },
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
            <Box sx={{ height: 280, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={series} margin={{ top: 16, right: 12, left: -8, bottom: 0 }} barCategoryGap="28%">
                  <defs>
                    <linearGradient id="bOpenAi" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={OPENAI} /><stop offset="100%" stopColor={OPENAI} stopOpacity={0.55} /></linearGradient>
                    <linearGradient id="bGemini" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={GEMINI} /><stop offset="100%" stopColor={GEMINI} stopOpacity={0.55} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 6" vertical={false} opacity={0.15} />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 100) / 10}k` : v)} />
                  <RechartsTooltip content={<UsageTip />} cursor={{ fill: 'rgba(124,58,237,.07)', radius: 10 }} />
                  <Bar dataKey="openAiTokens" name="OpenAI" stackId="t" fill="url(#bOpenAi)" maxBarSize={44} animationDuration={1100} />
                  <Bar dataKey="geminiTokens" name="Gemini" stackId="t" fill="url(#bGemini)" radius={[10, 10, 0, 0]} maxBarSize={44} animationDuration={1100} />
                  <Line type="monotone" dataKey="total" name="Total" stroke="#7C3AED" strokeWidth={2.5} strokeDasharray="1 0" dot={{ r: 4, strokeWidth: 2, stroke: '#fff', fill: '#7C3AED' }} activeDot={{ r: 6 }} animationDuration={1500} />
                  {peak && peak.total > 0 && <ReferenceDot x={peak.day} y={peak.total} r={9} fill="#F59E0B" stroke="#fff" strokeWidth={3} ifOverflow="extendDomain" />}
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <EmptyState title="No usage history yet" description="Daily token usage will appear here once AI requests are logged." />
          )}
        </GlassCard>

        <GlassCard sx={{ p: 3, animation: `${fadeUp} .6s .45s ease-out both` }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Provider share</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Tokens consumed by provider</Typography>
          {splitTotal > 0 ? (
            <>
              <Box sx={{ height: 200, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={split} dataKey="value" nameKey="name" innerRadius={62} outerRadius={86} paddingAngle={4} cornerRadius={6} stroke="none" animationDuration={1200}>
                      {split.map((s) => <Cell key={s.name} fill={s.color} />)}
                    </Pie>
                    <RechartsTooltip content={<ChartTip />} />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1 }}>{splitTotal.toLocaleString()}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>tokens</Typography>
                </Box>
              </Box>
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {split.map((s) => {
                  const pct = (s.value / splitTotal) * 100;
                  return (
                    <Box key={s.name}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Stack direction="row" spacing={1} alignItems="center"><Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: s.color }} /><Typography variant="body2" sx={{ fontWeight: 600 }}>{s.name}</Typography></Stack>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{pct.toFixed(1)}%</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={pct} sx={{ height: 5, borderRadius: 4, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: s.color, borderRadius: 4 } }} />
                    </Box>
                  );
                })}
              </Stack>
            </>
          ) : (
            <EmptyState title="No token data" description="Provider split will appear once requests are made." />
          )}
        </GlassCard>
      </Box>

      {/* Pricing reference */}
      <GlassCard sx={{ p: 3, mb: 3.5, animation: `${fadeUp} .6s .5s ease-out both` }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Model pricing reference</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Published API rates per 1,000,000 tokens (for reference)</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
          {PRICING.map((m) => (
            <Box key={m.model} sx={{ p: 2, borderRadius: '14px', border: '1px solid', borderColor: 'divider', borderTop: `3px solid ${m.color}`, transition: 'all .2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 10px 24px -12px ${m.color}88` } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
                <Typography sx={{ fontWeight: 800, color: m.color, fontSize: '0.95rem' }}>{m.model}</Typography>
                <Chip label={m.provider} size="small" sx={{ height: 20, fontSize: '0.68rem' }} />
              </Stack>
              <Stack direction="row" justifyContent="space-between"><Typography variant="caption" color="text.secondary">Input</Typography><Typography variant="body2" sx={{ fontWeight: 800 }}>{m.input}</Typography></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography variant="caption" color="text.secondary">Output</Typography><Typography variant="body2" sx={{ fontWeight: 800 }}>{m.output}</Typography></Stack>
            </Box>
          ))}
        </Box>
      </GlassCard>

      {/* Request log */}
      <GlassCard sx={{ p: 2.5, animation: `${fadeUp} .6s .55s ease-out both` }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>AI request audit log</Typography>
          <Typography variant="body2" color="text.secondary">Ranked by token usage — the heaviest requests come first</Typography>
        </Box>
        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            size="small" placeholder="Search name, email, model, task…" value={query} onChange={(e) => setQuery(e.target.value)}
            sx={{ width: { xs: '100%', sm: 320 } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
          <ToggleButtonGroup size="small" exclusive value={provider} onChange={(_, v) => v && setProvider(v)} color="primary">
            <ToggleButton value="all" sx={{ px: 2, fontWeight: 700 }}>All</ToggleButton>
            <ToggleButton value="OpenAI" sx={{ px: 2, fontWeight: 700 }}>OpenAI</ToggleButton>
            <ToggleButton value="Gemini" sx={{ px: 2, fontWeight: 700 }}>Gemini</ToggleButton>
          </ToggleButtonGroup>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Showing {rows.length} of {logs.length}</Typography>
        </Stack>

        {!loading && rows.length === 0 ? (
          <EmptyState title="No AI requests found" description={logs.length ? 'Nothing matches the current filters.' : 'AI requests will be logged here.'} />
        ) : (
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading && !telemetry}
              rowHeight={60}
              autoHeight
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } }, sorting: { sortModel: [{ field: 'totalTokens', sort: 'desc' }] } }}
              sx={{ border: 0, minWidth: 1280, '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 800 }, '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' } }}
            />
          </Box>
        )}
      </GlassCard>
    </Box>
  );
};
