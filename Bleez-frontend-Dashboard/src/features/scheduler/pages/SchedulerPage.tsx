import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  keyframes,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MemoryIcon from '@mui/icons-material/Memory';
import SpeedIcon from '@mui/icons-material/Speed';
import StorageIcon from '@mui/icons-material/Storage';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import DnsIcon from '@mui/icons-material/Dns';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TerminalIcon from '@mui/icons-material/Terminal';
import { useSnackbar } from 'notistack';
import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { apiClient } from '@/services/apiClient';

interface ServerHealth {
  status: string;
  serverStatus: string;
  uptime: string;
  uptimeMs: number;
  heapUsedMb: number;
  heapTotalMb: number;
  heapMaxMb: number;
  heapPercent: number;
  activeThreads: number;
  peakThreads: number;
  availableProcessors: number;
  mongoStatus: string;
  mongoPingMs: number;
  totalRequests24h: number;
  errorRate24h: number;
  activeTasks: number;
  pausedTasks: number;
  totalRegisteredTasks: number;
  javaVersion: string;
  osName: string;
}

interface ScheduledTask {
  id: string;
  name: string;
  description: string;
  type: string;
  intervalText: string;
  status: 'ACTIVE' | 'PAUSED' | 'RUNNING';
  lastRunTime: string;
  lastDurationMs: number;
  totalRuns: number;
  failureCount: number;
  lastMessage: string;
}

interface AuditLog {
  id: string;
  taskId?: string;
  task_id?: string;
  taskName?: string;
  task_name?: string;
  triggeredBy?: string;
  triggered_by?: string;
  status: string;
  executedAt?: string;
  executed_at?: string;
  durationMs?: number;
  duration_ms?: number;
  message?: string;
}

const pulseDot = keyframes`
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
`;

export const SchedulerPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [tab, setTab] = useState<'tasks' | 'logs'>('tasks');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [logDetails, setLogDetails] = useState<AuditLog | null>(null);

  const [serverHealth, setServerHealth] = useState<ServerHealth | null>(null);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  const fetchOverview = useCallback(async () => {
    try {
      const res = await apiClient.get('/admin/scheduler/overview');
      if (res.data) {
        if (res.data.server) setServerHealth(res.data.server);
        if (Array.isArray(res.data.tasks)) setTasks(res.data.tasks);
        if (Array.isArray(res.data.recentLogs)) setLogs(res.data.recentLogs);
      }
    } catch (err: any) {
      console.debug('Scheduler overview fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchOverview();
      }
    }, 45000);
    return () => clearInterval(interval);
  }, [fetchOverview]);

  const handleRunNow = async (taskId: string) => {
    setRunningTaskId(taskId);
    try {
      const res = await apiClient.post(`/admin/scheduler/tasks/${taskId}/run-now`);
      if (res.data?.success) {
        enqueueSnackbar(`Task triggered: ${res.data.message || 'Execution completed'} (${res.data.durationMs}ms)`, {
          variant: 'success',
        });
        await fetchOverview();
      } else {
        enqueueSnackbar(res.data?.message || 'Could not run task', { variant: 'warning' });
      }
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || 'Execution failed', { variant: 'error' });
    } finally {
      setRunningTaskId(null);
    }
  };

  const handleToggle = async (taskId: string) => {
    try {
      const res = await apiClient.post(`/admin/scheduler/tasks/${taskId}/toggle`);
      if (res.data?.success) {
        enqueueSnackbar(res.data.message || 'Task status updated', { variant: 'info' });
        await fetchOverview();
      }
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || 'Toggle failed', { variant: 'error' });
    }
  };

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.intervalText.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q)
    );
  }, [tasks, search]);

  const formatTimestamp = (iso?: string) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return isNaN(d.getTime()) ? iso : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (' + d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ')';
    } catch {
      return iso;
    }
  };

  const fadeUp = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}`;
  const spin = keyframes`to{transform:rotate(360deg)}`;

  const healthy = (serverHealth?.status || 'HEALTHY') === 'HEALTHY';
  const heap = Math.min(100, Math.max(0, Math.round(serverHealth?.heapPercent ?? 0)));
  const mongoOk = String(serverHealth?.mongoStatus || 'UP').toUpperCase() === 'UP' || String(serverHealth?.mongoStatus || '').toUpperCase() === 'CONNECTED';
  const fmtMs = (ms?: number) => (ms == null ? '—' : ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`);
  const taskColor = (st: string) => (st === 'RUNNING' ? '#0EA5E9' : st === 'PAUSED' ? '#F59E0B' : '#16A34A');
  const okLog = (st?: string) => ['SUCCESS', 'OK', 'COMPLETED'].includes(String(st).toUpperCase());
  const pill = (c: string) => ({ alignSelf: 'center', height: 26, borderRadius: '8px', fontWeight: 700, fontSize: '0.7rem', bgcolor: `${c}1a`, color: c });
  const cellText = { fontSize: '0.84rem', lineHeight: 1.4 } as const;

  const health = [
    {
      label: 'Backend server', value: serverHealth?.serverStatus || 'UP', color: healthy ? '#16A34A' : '#EF4444', icon: <DnsIcon />,
      sub: `Up for ${serverHealth?.uptime || '—'}`, extra: <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: healthy ? '#16A34A' : '#EF4444', animation: `${pulseDot} 2s infinite`, ml: 1 }} />,
    },
    { label: 'Memory (heap)', value: `${heap}%`, color: heap > 85 ? '#EF4444' : heap > 65 ? '#F59E0B' : '#7C3AED', icon: <MemoryIcon />, sub: `${serverHealth?.heapUsedMb ?? '—'} / ${serverHealth?.heapMaxMb ?? serverHealth?.heapTotalMb ?? '—'} MB`, bar: heap },
    { label: 'Database', value: serverHealth?.mongoStatus || 'UP', color: mongoOk ? '#0EA5E9' : '#EF4444', icon: <StorageIcon />, sub: `Ping ${serverHealth?.mongoPingMs ?? '—'} ms` },
    { label: 'Requests (24h)', value: (serverHealth?.totalRequests24h ?? 0).toLocaleString(), color: '#F59E0B', icon: <SpeedIcon />, sub: `${serverHealth?.errorRate24h ?? 0}% errors · ${serverHealth?.activeThreads ?? 0} threads` },
  ];

  const activeCount = tasks.filter((t) => t.status !== 'PAUSED').length;

  return (
    <Box>
      <PageHeader
        title="Task Scheduler"
        subtitle="Background jobs that keep Bleez running: run one now, pause it, or check how it went"
        breadcrumbs={[{ label: 'Platform' }, { label: 'Task Scheduler' }]}
        action={
          <Button variant="contained" startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />} onClick={fetchOverview} disabled={loading} sx={{ fontWeight: 700 }}>
            Refresh
          </Button>
        }
      />

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      <Box sx={{ display: 'grid', gap: 2, mb: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' } }}>
        {health.map((h, i) => (
          <GlassCard key={h.label} sx={{ p: 2.5, height: 136, animation: `${fadeUp} .45s ease ${i * 0.07}s both` }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography color="text.secondary" sx={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>{h.label}</Typography>
                <Stack direction="row" alignItems="center">
                  <Typography sx={{ fontSize: String(h.value).length > 7 ? '1.3rem' : '1.8rem', fontWeight: 800, lineHeight: String(h.value).length > 7 ? 1.9 : 1.3, color: h.color }}>{h.value}</Typography>
                  {h.extra}
                </Stack>
              </Box>
              <Box sx={{ width: 42, height: 42, borderRadius: '12px', display: 'grid', placeItems: 'center', bgcolor: `${h.color}1a`, color: h.color }}>{h.icon}</Box>
            </Stack>
            {h.bar != null && <LinearProgress variant="determinate" value={h.bar} sx={{ height: 6, borderRadius: 3, my: 0.75, bgcolor: `${h.color}22`, '& .MuiLinearProgress-bar': { bgcolor: h.color, borderRadius: 3 } }} />}
            <Typography noWrap color="text.secondary" sx={{ fontSize: '0.8rem', mt: h.bar != null ? 0 : 0.5 }}>{h.sub}</Typography>
          </GlassCard>
        ))}
      </Box>

      <GlassCard sx={{ animation: `${fadeUp} .5s ease .25s both` }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ md: 'center' }} sx={{ px: 2.5, pt: 1.5 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ minHeight: 44 }}>
            <Tab value="tasks" icon={<AccessTimeIcon fontSize="small" />} iconPosition="start" label={`Scheduled jobs (${tasks.length})`} sx={{ minHeight: 44, fontWeight: 700, textTransform: 'none' }} />
            <Tab value="logs" icon={<HistoryIcon fontSize="small" />} iconPosition="start" label={`Run history (${logs.length})`} sx={{ minHeight: 44, fontWeight: 700, textTransform: 'none' }} />
          </Tabs>
          {tab === 'tasks' && (
            <TextField size="small" placeholder="Search jobs…" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} sx={{ minWidth: { md: 280 } }} />
          )}
        </Stack>

        <Box sx={{ p: 2.5, pt: 2 }}>
          {tab === 'tasks' && (
            filteredTasks.length === 0 && !loading ? (
              <EmptyState icon={<AccessTimeIcon />} title={tasks.length ? 'No jobs match your search' : 'No scheduled jobs found'} description={tasks.length ? 'Try a different word.' : 'The server did not report any background jobs.'} />
            ) : (
              <>
                <Typography color="text.secondary" sx={{ fontSize: '0.84rem', mb: 1.5 }}>{activeCount} of {tasks.length} jobs are running on their schedule</Typography>
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' } }}>
                  {filteredTasks.map((t, i) => {
                    const c = taskColor(t.status);
                    const busy = runningTaskId === t.id || t.status === 'RUNNING';
                    return (
                      <Box key={t.id} sx={{ p: 2.25, minHeight: 236, borderRadius: '16px', border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', animation: `${fadeUp} .4s ease ${i * 0.04}s both`, transition: 'transform .2s, box-shadow .2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 14px 30px -14px rgba(124,58,237,.35)' } }}>
                        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, bgcolor: c }} />
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                            <Box sx={{ width: 40, height: 40, borderRadius: '12px', flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor: `${c}1a`, color: c }}>
                              {busy ? <CircularProgress size={20} color="inherit" /> : <TerminalIcon fontSize="small" />}
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography noWrap sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.35 }}>{t.name}</Typography>
                              <Typography noWrap color="text.secondary" sx={{ fontSize: '0.72rem', fontFamily: 'monospace' }}>{t.id}</Typography>
                            </Box>
                          </Stack>
                          <Chip size="small" label={t.status === 'RUNNING' ? 'Running' : t.status === 'PAUSED' ? 'Paused' : 'Active'} sx={pill(c)} />
                        </Stack>
                        <Typography color="text.secondary" sx={{ fontSize: '0.82rem', lineHeight: 1.5, mt: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.description}</Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1.25 }} flexWrap="wrap" useFlexGap>
                          <Chip size="small" icon={<AccessTimeIcon sx={{ fontSize: 14 }} />} label={t.intervalText} sx={{ height: 24, borderRadius: '7px', fontWeight: 700, fontSize: '0.7rem' }} />
                          <Chip size="small" label={t.type} variant="outlined" sx={{ height: 24, borderRadius: '7px', fontWeight: 700, fontSize: '0.7rem' }} />
                        </Stack>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mt: 1.5, py: 1, borderTop: '1px dashed', borderBottom: '1px dashed', borderColor: 'divider' }}>
                          {[
                            { k: 'Runs', v: (t.totalRuns ?? 0).toLocaleString() },
                            { k: 'Failures', v: String(t.failureCount ?? 0), bad: (t.failureCount ?? 0) > 0 },
                            { k: 'Last took', v: fmtMs(t.lastDurationMs) },
                          ].map((m) => (
                            <Box key={m.k} sx={{ textAlign: 'center' }}>
                              <Typography sx={{ fontWeight: 800, fontSize: '0.98rem', color: m.bad ? '#EF4444' : 'text.primary' }}>{m.v}</Typography>
                              <Typography color="text.secondary" sx={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>{m.k}</Typography>
                            </Box>
                          ))}
                        </Box>
                        <Typography noWrap color="text.secondary" sx={{ fontSize: '0.74rem', mt: 1 }}>Last run: {formatTimestamp(t.lastRunTime)}</Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
                          <Button fullWidth size="small" variant="contained" disabled={busy || t.status === 'PAUSED'} startIcon={busy ? <Box component="span" sx={{ display: 'inline-flex', animation: `${spin} 1s linear infinite` }}><RefreshIcon sx={{ fontSize: 16 }} /></Box> : <PlayArrowIcon />} onClick={() => handleRunNow(t.id)} sx={{ fontWeight: 700 }}>
                            {busy ? 'Running…' : 'Run now'}
                          </Button>
                          <Button fullWidth size="small" variant="outlined" color={t.status === 'PAUSED' ? 'success' : 'warning'} startIcon={t.status === 'PAUSED' ? <PlayArrowIcon /> : <PauseIcon />} onClick={() => handleToggle(t.id)} sx={{ fontWeight: 700 }}>
                            {t.status === 'PAUSED' ? 'Resume' : 'Pause'}
                          </Button>
                        </Stack>
                      </Box>
                    );
                  })}
                </Box>
              </>
            )
          )}

          {tab === 'logs' && (
            logs.length === 0 ? (
              <EmptyState icon={<HistoryIcon />} title="No runs recorded yet" description="Every time a job runs, it will be listed here." />
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 820 }}>
                  <TableHead>
                    <TableRow>
                      {['When', 'Job', 'Triggered by', 'Duration', 'Result', 'Message'].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 800, fontSize: '0.72rem', letterSpacing: 0.5, textTransform: 'uppercase', color: 'text.secondary' }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.map((l) => {
                      const ok = okLog(l.status);
                      const c = ok ? '#16A34A' : '#EF4444';
                      return (
                        <TableRow key={l.id} hover onClick={() => setLogDetails(l)} sx={{ cursor: 'pointer', '& td': { py: 1.25 } }}>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}><Typography sx={cellText}>{formatTimestamp(l.executedAt || l.executed_at)}</Typography></TableCell>
                          <TableCell><Typography sx={{ ...cellText, fontWeight: 700 }}>{l.taskName || l.task_name || l.taskId || l.task_id}</Typography></TableCell>
                          <TableCell><Chip size="small" label={l.triggeredBy || l.triggered_by || 'SYSTEM'} variant="outlined" sx={{ ...pill('#64748B'), bgcolor: 'transparent', border: '1px solid', borderColor: 'divider' }} /></TableCell>
                          <TableCell><Typography sx={cellText}>{fmtMs(l.durationMs ?? l.duration_ms)}</Typography></TableCell>
                          <TableCell><Chip size="small" icon={ok ? <CheckCircleIcon sx={{ fontSize: '14px !important', color: `${c} !important` }} /> : <WarningAmberIcon sx={{ fontSize: '14px !important', color: `${c} !important` }} />} label={l.status} sx={pill(c)} /></TableCell>
                          <TableCell sx={{ maxWidth: 340 }}><Typography noWrap color="text.secondary" sx={cellText}>{l.message || '—'}</Typography></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            )
          )}
        </Box>
      </GlassCard>

      <Dialog open={Boolean(logDetails)} onClose={() => setLogDetails(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '18px' } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{logDetails?.taskName || logDetails?.task_name || 'Run details'}</DialogTitle>
        <DialogContent dividers>
          {logDetails && (
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1}>
                <Chip size="small" label={logDetails.status} sx={{ ...pill(okLog(logDetails.status) ? '#16A34A' : '#EF4444'), alignSelf: 'auto' }} />
                <Chip size="small" label={`Took ${fmtMs(logDetails.durationMs ?? logDetails.duration_ms)}`} variant="outlined" />
              </Stack>
              <Typography variant="body2" color="text.secondary">Ran at {formatTimestamp(logDetails.executedAt || logDetails.executed_at)} · started by {logDetails.triggeredBy || logDetails.triggered_by || 'SYSTEM'}</Typography>
              <Box component="pre" sx={{ m: 0, p: 2, borderRadius: '12px', whiteSpace: 'pre-wrap', fontSize: '0.82rem', bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(0,0,0,.35)' : 'rgba(15,23,42,.05)') }}>{logDetails.message || 'No message.'}</Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={() => setLogDetails(null)}>Close</Button></DialogActions>
      </Dialog>
    </Box>
  );
};
