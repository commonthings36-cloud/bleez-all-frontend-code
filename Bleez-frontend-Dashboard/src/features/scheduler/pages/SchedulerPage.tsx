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

  return (
    <Box>
      <PageHeader
        title="Scheduler & Background Cron Jobs"
        subtitle="Manage scheduled background tasks, trigger 'Run Now', pause/resume cron jobs, and inspect server health logs."
        breadcrumbs={[{ label: 'Platform' }, { label: 'Task Scheduler' }]}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
              onClick={fetchOverview}
              disabled={loading}
              sx={{ fontWeight: 700 }}
            >
              Refresh
            </Button>
          </Stack>
        }
      />

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* Server Health & Telemetry Metrics Row */}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          mb: 3,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        }}
      >
        {/* 1. Server Uptime & Status */}
        <GlassCard sx={{ p: 2.5, position: 'relative', overflow: 'hidden' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
              Backend Server Health
            </Typography>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: serverHealth?.status === 'HEALTHY' ? '#10B981' : '#EF4444',
                animation: `${pulseDot} 2s infinite`,
              }}
            />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="baseline">
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {serverHealth?.serverStatus || 'UP'}
            </Typography>
            <Chip
              size="small"
              label={serverHealth?.status || 'HEALTHY'}
              sx={{ bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#10B981', fontWeight: 700, height: 22 }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.8rem' }}>
            Uptime: <strong>{serverHealth?.uptime || '—'}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            OS: {serverHealth?.osName || 'Linux'} · JVM: {serverHealth?.javaVersion || 'Java 17'}
          </Typography>
        </GlassCard>

        {/* 2. JVM Heap Memory */}
        <GlassCard sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
              JVM Heap Memory
            </Typography>
            <MemoryIcon sx={{ fontSize: 20, color: '#6366F1' }} />
          </Stack>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {serverHealth ? `${serverHealth.heapUsedMb} MB` : '—'}
          </Typography>
          <Box sx={{ width: '100%', mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, serverHealth?.heapPercent || 0)}
              sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(99, 102, 241, 0.15)' }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {serverHealth ? `${serverHealth.heapPercent}% of ${serverHealth.heapMaxMb} MB max` : 'Calculating...'}
          </Typography>
        </GlassCard>

        {/* 3. Threads & CPU Concurrency */}
        <GlassCard sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
              Active Concurrency
            </Typography>
            <SpeedIcon sx={{ fontSize: 20, color: '#EC4899' }} />
          </Stack>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {serverHealth ? `${serverHealth.activeThreads} Threads` : '—'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.8rem' }}>
            Peak Threads: <strong>{serverHealth?.peakThreads ?? '—'}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            CPU Cores: {serverHealth?.availableProcessors ?? '—'} Available Workers
          </Typography>
        </GlassCard>

        {/* 4. Traffic & Database Ping */}
        <GlassCard sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
              Database & Traffic
            </Typography>
            <StorageIcon sx={{ fontSize: 20, color: '#10B981' }} />
          </Stack>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {serverHealth ? `${serverHealth.mongoStatus}` : '—'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.8rem' }}>
            MongoDB Ping: <strong>{serverHealth?.mongoPingMs ?? 0} ms</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            24h Traffic: {serverHealth?.totalRequests24h?.toLocaleString() ?? 0} req ({serverHealth?.errorRate24h ?? 0}% err)
          </Typography>
        </GlassCard>
      </Box>

      {/* Main Scheduler Management Card */}
      <GlassCard sx={{ p: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 2.5 }}>
          <Tabs value={tab} onChange={(_, val) => setTab(val)} textColor="primary" indicatorColor="primary">
            <Tab label={`Background Tasks (${tasks.length})`} value="tasks" sx={{ fontWeight: 700 }} />
            <Tab label={`Execution Logs (${logs.length})`} value="logs" sx={{ fontWeight: 700 }} />
          </Tabs>

          {tab === 'tasks' && (
            <TextField
              size="small"
              placeholder="Search scheduled tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 260 }}
            />
          )}
        </Stack>

        {/* Tab 1: Scheduled Tasks Table */}
        {tab === 'tasks' && (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                  <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Task Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Schedule</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Last Run</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Runs</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, py: 1.5 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ py: 6, textAlign: 'center' }}>
                      <EmptyState title="No Tasks Found" description="Try adjusting your search criteria." />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((t) => {
                    const isRunning = runningTaskId === t.id || t.status === 'RUNNING';
                    const isPaused = t.status === 'PAUSED';

                    return (
                      <TableRow key={t.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell sx={{ py: 1.8 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {t.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 360 }}>
                            {t.description}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ py: 1.8 }}>
                          <Chip
                            size="small"
                            label={t.intervalText}
                            icon={<AccessTimeIcon sx={{ fontSize: '14px !important' }} />}
                            sx={{ fontWeight: 600, fontSize: '0.75rem', bgcolor: 'rgba(99, 102, 241, 0.08)', color: '#6366F1' }}
                          />
                        </TableCell>

                        <TableCell sx={{ py: 1.8 }}>
                          {isRunning ? (
                            <Chip
                              size="small"
                              label="RUNNING"
                              icon={<CircularProgress size={12} color="inherit" />}
                              sx={{ fontWeight: 700, bgcolor: 'rgba(59, 130, 246, 0.12)', color: '#2563EB' }}
                            />
                          ) : isPaused ? (
                            <Chip
                              size="small"
                              label="PAUSED"
                              sx={{ fontWeight: 700, bgcolor: 'rgba(245, 158, 11, 0.12)', color: '#D97706' }}
                            />
                          ) : (
                            <Chip
                              size="small"
                              label="ACTIVE"
                              sx={{ fontWeight: 700, bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}
                            />
                          )}
                        </TableCell>

                        <TableCell sx={{ py: 1.8 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>
                            {formatTimestamp(t.lastRunTime)}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ py: 1.8 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                            {t.lastDurationMs} ms
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ py: 1.8 }}>
                          <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>
                            {t.totalRuns.toLocaleString()}{' '}
                            {t.failureCount > 0 && (
                              <Typography component="span" color="error.main" sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
                                ({t.failureCount} err)
                              </Typography>
                            )}
                          </Typography>
                        </TableCell>

                        <TableCell align="right" sx={{ py: 1.8 }}>
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="Trigger immediate execution">
                              <span>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  startIcon={isRunning ? <CircularProgress size={12} /> : <PlayArrowIcon />}
                                  onClick={() => handleRunNow(t.id)}
                                  disabled={isRunning}
                                  sx={{ fontWeight: 700, textTransform: 'none', px: 1.5 }}
                                >
                                  Run Now
                                </Button>
                              </span>
                            </Tooltip>

                            <Tooltip title={isPaused ? 'Resume scheduled execution' : 'Pause scheduled runs'}>
                              <IconButton
                                size="small"
                                color={isPaused ? 'success' : 'default'}
                                onClick={() => handleToggle(t.id)}
                                sx={{ border: '1px solid rgba(0, 0, 0, 0.12)' }}
                              >
                                {isPaused ? <PlayArrowIcon fontSize="small" /> : <PauseIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Box>
        )}

        {/* Tab 2: Execution Logs Table */}
        {tab === 'logs' && (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                  <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Executed At</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Task Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Trigger Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Message</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ py: 6, textAlign: 'center' }}>
                      <EmptyState title="No Execution Logs Yet" description="Logs will stream here as scheduled tasks run." />
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => {
                    const taskTitle = log.taskName || log.task_name || log.taskId || log.task_id || 'Scheduled Task';
                    const rawTrigger = log.triggeredBy || log.triggered_by || 'AUTOMATIC';
                    const triggerLabel = String(rawTrigger).replace(/_/g, ' ');
                    const execTime = log.executedAt || log.executed_at;
                    const duration = log.durationMs ?? log.duration_ms ?? 0;
                    const status = log.status || 'SUCCESS';
                    const msg = log.message || '';
                    const isSuccess = status === 'SUCCESS';

                    return (
                      <TableRow key={log.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell sx={{ py: 1.5, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          {formatTimestamp(execTime)}
                        </TableCell>
                        <TableCell sx={{ py: 1.5, fontWeight: 700, fontSize: '0.84rem' }}>
                          {taskTitle}
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Chip
                            size="small"
                            label={triggerLabel}
                            sx={{ fontSize: '0.7rem', fontWeight: 600, height: 22 }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Chip
                            size="small"
                            label={status}
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              height: 22,
                              bgcolor: isSuccess ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                              color: isSuccess ? '#10B981' : '#EF4444',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.5, fontWeight: 600, fontSize: '0.82rem' }}>
                          {duration} ms
                        </TableCell>
                        <TableCell sx={{ py: 1.5, fontSize: '0.8rem', color: 'text.secondary', maxWidth: 400 }}>
                          <Typography noWrap variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {msg}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Box>
        )}
      </GlassCard>
    </Box>
  );
};
