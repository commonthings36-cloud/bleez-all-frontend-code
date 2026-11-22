import React, { useCallback, useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Drawer,
  keyframes,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import HistoryIcon from '@mui/icons-material/History';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from 'notistack';
import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { apiClient } from '@/services/apiClient';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId?: string;
  actor_id?: string;
  actorEmail?: string;
  actor_email?: string;
  actorRole?: string;
  actor_role?: string;
  module: string;
  action: string;
  targetId?: string;
  target_id?: string;
  targetType?: string;
  target_type?: string;
  ipAddress?: string;
  ip_address?: string;
  userAgent?: string;
  user_agent?: string;
  status: string;
  severity: string;
  details: string;
  metadata?: Record<string, any>;
}

interface AuditOverview {
  totalEvents: number;
  events24h: number;
  criticalCount: number;
  warningCount: number;
  activeAdminsCount: number;
  moduleBreakdown: Record<string, number>;
}

const fadeUp = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}`;

export const AuditLogsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  // Data states
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [overview, setOverview] = useState<AuditOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);

  // Filters & Pagination
  const [search, setSearch] = useState<string>('');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);

  // Modal Inspector
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  // Fetch overview metrics
  const fetchOverview = useCallback(async () => {
    try {
      const res = await apiClient.get('/admin/audit-logs/overview');
      if (res.data) {
        setOverview({
          totalEvents: res.data.totalEvents ?? res.data.total_events ?? 0,
          events24h: res.data.events24h ?? res.data.events_24h ?? 0,
          criticalCount: res.data.criticalCount ?? res.data.critical_count ?? 0,
          warningCount: res.data.warningCount ?? res.data.warning_count ?? 0,
          activeAdminsCount: res.data.activeAdminsCount ?? res.data.active_admins_count ?? 0,
          moduleBreakdown: res.data.moduleBreakdown ?? res.data.module_breakdown ?? {},
        });
      }
    } catch (err: any) {
      console.debug('Audit overview fetch skipped:', err.message);
    }
  }, []);

  // Fetch paginated audit logs
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        limit: rowsPerPage,
      };
      if (search.trim()) params.search = search.trim();
      if (moduleFilter !== 'ALL') params.module = moduleFilter;
      if (severityFilter !== 'ALL') params.severity = severityFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await apiClient.get('/admin/audit-logs', { params });
      if (res.data) {
        setLogs(Array.isArray(res.data.logs) ? res.data.logs : []);
        setTotalCount(res.data.total ?? 0);
      }
    } catch (err: any) {
      enqueueSnackbar('Could not load audit logs. Showing latest cache.', { variant: 'warning' });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, moduleFilter, severityFilter, statusFilter, enqueueSnackbar]);

  useEffect(() => {
    fetchOverview();
    fetchLogs();
  }, [fetchOverview, fetchLogs]);

  // Periodic polling guard
  useEffect(() => {
    const timer = setInterval(() => {
      if (!document.hidden) {
        fetchOverview();
        fetchLogs();
      }
    }, 45000);
    return () => clearInterval(timer);
  }, [fetchOverview, fetchLogs]);

  // Export CSV handler
  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const params: Record<string, any> = {};
      if (search.trim()) params.search = search.trim();
      if (moduleFilter !== 'ALL') params.module = moduleFilter;
      if (severityFilter !== 'ALL') params.severity = severityFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const response = await apiClient.get('/admin/audit-logs/export', {
        params,
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bleez-audit-logs-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      enqueueSnackbar('Audit trail CSV exported successfully', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar('Export failed: ' + (err.message || 'Unknown error'), { variant: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setModuleFilter('ALL');
    setSeverityFilter('ALL');
    setStatusFilter('ALL');
    setPage(0);
  };

  const hasActiveFilters = Boolean(
    search.trim() || moduleFilter !== 'ALL' || severityFilter !== 'ALL' || statusFilter !== 'ALL'
  );

  const formatTimestamp = (iso?: string) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
    } catch {
      return iso;
    }
  };

  const getModuleBadgeColor = (mod?: string) => {
    switch (mod?.toUpperCase()) {
      case 'SECURITY':
        return { bg: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' };
      case 'SCHEDULER':
        return { bg: 'rgba(99, 102, 241, 0.12)', color: '#6366F1' };
      case 'USERS':
        return { bg: 'rgba(14, 165, 233, 0.12)', color: '#0EA5E9' };
      case 'CAMPAIGNS':
        return { bg: 'rgba(168, 85, 247, 0.12)', color: '#A855F7' };
      case 'EMERGENCY_SOS':
        return { bg: 'rgba(244, 63, 94, 0.12)', color: '#F43F5E' };
      case 'BOOKINGS':
        return { bg: 'rgba(16, 185, 129, 0.12)', color: '#10B981' };
      default:
        return { bg: 'rgba(107, 114, 128, 0.12)', color: '#6B7280' };
    }
  };

  const getSeverityBadgeColor = (sev?: string) => {
    switch (sev?.toUpperCase()) {
      case 'CRITICAL':
      case 'SECURITY':
        return { bg: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' };
      case 'WARN':
        return { bg: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B' };
      default:
        return { bg: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6' };
    }
  };

  const initials = (e?: string) => (e || 'A').split(/[\s@.]/).filter(Boolean).slice(0, 2).map((x) => x[0]?.toUpperCase()).join('');
  const pill = (c: { bg: string; color: string }) => ({ alignSelf: 'center', height: 26, borderRadius: '8px', fontWeight: 700, fontSize: '0.7rem', bgcolor: c.bg, color: c.color });
  const okStatus = (st?: string) => ['SUCCESS', 'OK', 'COMPLETED'].includes(String(st).toUpperCase());
  const moduleEntries = Object.entries(overview?.moduleBreakdown || {}).sort((x, y) => y[1] - x[1]).slice(0, 8);

  const kpis = [
    { label: 'Total events', value: (overview?.totalEvents ?? totalCount).toLocaleString(), sub: 'Immutable audit trail', color: '#6366F1', icon: <HistoryIcon /> },
    { label: 'Last 24 hours', value: (overview?.events24h ?? 0).toLocaleString(), sub: 'Actions logged today', color: '#0EA5E9', icon: <SecurityIcon /> },
    { label: 'Critical / warnings', value: `${(overview?.criticalCount ?? 0).toLocaleString()} / ${(overview?.warningCount ?? 0).toLocaleString()}`, sub: 'Need a human look', color: '#F59E0B', icon: <WarningAmberIcon /> },
    { label: 'Active admins', value: (overview?.activeAdminsCount ?? 0).toLocaleString(), sub: 'Took an action recently', color: '#7C3AED', icon: <AdminPanelSettingsIcon /> },
  ];

  const Field: React.FC<{ label: string; value?: React.ReactNode; mono?: boolean }> = ({ label, value, mono }) => (
    <Box sx={{ minWidth: 0 }}>
      <Typography color="text.secondary" sx={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase' }}>{label}</Typography>
      <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', wordBreak: 'break-word', fontFamily: mono ? 'monospace' : undefined }}>{value || '—'}</Typography>
    </Box>
  );

  const cellText = { fontSize: '0.84rem', lineHeight: 1.4 } as const;

  return (
    <Box>
      <PageHeader
        title="Audit Logs"
        subtitle="Every admin action across the platform: who did what, where from, and when"
        breadcrumbs={[{ label: 'Platform' }, { label: 'Audit Logs' }]}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={exporting ? <CircularProgress size={16} /> : <DownloadIcon />} onClick={handleExportCsv} disabled={exporting || loading} sx={{ fontWeight: 700 }}>
              Export CSV
            </Button>
            <Button variant="contained" startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />} onClick={() => { fetchOverview(); fetchLogs(); }} disabled={loading} sx={{ fontWeight: 700 }}>
              Refresh
            </Button>
          </Stack>
        }
      />

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* KPIs: four equal cards */}
      <Box sx={{ display: 'grid', gap: 2, mb: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' } }}>
        {kpis.map((k, i) => (
          <GlassCard key={k.label} sx={{ p: 2.5, height: 128, animation: `${fadeUp} .45s ease ${i * 0.07}s both` }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography color="text.secondary" sx={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>{k.label}</Typography>
                <Typography sx={{ fontSize: '1.9rem', fontWeight: 800, lineHeight: 1.3 }}>{k.value}</Typography>
              </Box>
              <Box sx={{ width: 42, height: 42, borderRadius: '12px', display: 'grid', placeItems: 'center', bgcolor: `${k.color}1a`, color: k.color }}>{k.icon}</Box>
            </Stack>
            <Typography noWrap color="text.secondary" sx={{ fontSize: '0.8rem' }}>{k.sub}</Typography>
          </GlassCard>
        ))}
      </Box>

      {/* Module quick filters */}
      {moduleEntries.length > 0 && (
        <GlassCard sx={{ p: 2, mb: 3, animation: `${fadeUp} .5s ease .2s both` }}>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', mr: 0.5 }}>Where the activity is</Typography>
            {moduleEntries.map(([m, n]) => {
              const c = getModuleBadgeColor(m);
              const on = moduleFilter === m;
              return (
                <Chip
                  key={m}
                  onClick={() => { setModuleFilter(on ? 'ALL' : m); setPage(0); }}
                  label={`${m.replace(/_/g, ' ')} · ${n.toLocaleString()}`}
                  sx={{ height: 30, borderRadius: '9px', fontWeight: 700, fontSize: '0.74rem', bgcolor: on ? c.color : c.bg, color: on ? '#fff' : c.color, '&:hover': { bgcolor: on ? c.color : c.bg, filter: 'brightness(1.08)' } }}
                />
              );
            })}
          </Stack>
        </GlassCard>
      )}

      <GlassCard sx={{ animation: `${fadeUp} .5s ease .25s both` }}>
        {/* Filters */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ p: 2.5, pb: 1.5 }} alignItems={{ md: 'center' }}>
          <TextField
            size="small" placeholder="Search actor, action, target or details…" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            sx={{ flex: 1, minWidth: 220 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Module</InputLabel>
            <Select label="Module" value={moduleFilter} onChange={(e) => { setModuleFilter(e.target.value); setPage(0); }}>
              <MenuItem value="ALL">All modules</MenuItem>
              {Array.from(new Set([...Object.keys(overview?.moduleBreakdown || {}), 'SECURITY', 'USERS', 'CAMPAIGNS', 'BOOKINGS', 'SCHEDULER', 'EMERGENCY_SOS'])).map((m) => <MenuItem key={m} value={m}>{m.replace(/_/g, ' ')}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Severity</InputLabel>
            <Select label="Severity" value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value); setPage(0); }}>
              <MenuItem value="ALL">All severities</MenuItem>
              <MenuItem value="INFO">Info</MenuItem>
              <MenuItem value="WARN">Warning</MenuItem>
              <MenuItem value="CRITICAL">Critical</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="SUCCESS">Success</MenuItem>
              <MenuItem value="FAILED">Failed</MenuItem>
            </Select>
          </FormControl>
          {hasActiveFilters && <Button startIcon={<FilterAltOffIcon />} onClick={resetFilters} sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Clear</Button>}
        </Stack>

        {logs.length === 0 && !loading ? (
          <Box sx={{ p: 2.5 }}>
            <EmptyState icon={<HistoryIcon />} title={hasActiveFilters ? 'No events match these filters' : 'No audit events yet'} description={hasActiveFilters ? 'Try clearing a filter or searching for something else.' : 'Admin actions will appear here as soon as they happen.'} actionLabel={hasActiveFilters ? 'Clear filters' : undefined} onAction={hasActiveFilters ? resetFilters : undefined} />
          </Box>
        ) : (
          <>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="medium" sx={{ minWidth: 960, '& td, & th': { px: 1.5 } }}>
                <TableHead>
                  <TableRow>
                    {['When', 'Actor', 'Module', 'Action', 'Target', 'IP address', 'Severity', 'Status', ''].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 800, fontSize: '0.72rem', letterSpacing: 0.5, textTransform: 'uppercase', color: 'text.secondary', whiteSpace: 'nowrap' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => {
                    const email = log.actorEmail || log.actor_email || 'admin@bleez.ai';
                    const role = log.actorRole || log.actor_role || 'ADMIN';
                    const mc = getModuleBadgeColor(log.module);
                    const sc = getSeverityBadgeColor(log.severity);
                    const ok = okStatus(log.status);
                    return (
                      <TableRow key={log.id} hover onClick={() => setSelectedLog(log)} sx={{ cursor: 'pointer', '& td': { py: 1.25 } }}>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}><Typography sx={{ ...cellText, fontWeight: 600 }}>{log.timestamp ? new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '—'}</Typography><Typography color="text.secondary" sx={{ fontSize: '0.72rem', lineHeight: 1.3 }}>{log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</Typography></TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 170 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.74rem', fontWeight: 800 }}>{initials(email)}</Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography noWrap sx={{ ...cellText, fontWeight: 700 }}>{email}</Typography>
                              <Typography color="text.secondary" sx={{ fontSize: '0.72rem', lineHeight: 1.3 }}>{role}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell><Chip size="small" label={String(log.module || '—').replace(/_/g, ' ')} sx={pill(mc)} /></TableCell>
                        <TableCell sx={{ maxWidth: 210 }}>
                          <Typography noWrap sx={{ ...cellText, fontWeight: 700 }}>{log.action}</Typography>
                          <Typography noWrap color="text.secondary" sx={{ fontSize: '0.74rem', lineHeight: 1.3 }}>{log.details}</Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 170 }}>
                          <Typography noWrap sx={cellText}>{log.targetType || log.target_type || '—'}</Typography>
                          <Typography noWrap color="text.secondary" sx={{ fontSize: '0.72rem', fontFamily: 'monospace', lineHeight: 1.3 }}>{log.targetId || log.target_id || ''}</Typography>
                        </TableCell>
                        <TableCell><Typography sx={{ ...cellText, fontFamily: 'monospace' }}>{log.ipAddress || log.ip_address || '—'}</Typography></TableCell>
                        <TableCell><Chip size="small" label={log.severity || 'INFO'} sx={pill(sc)} /></TableCell>
                        <TableCell><Chip size="small" label={log.status} sx={pill(ok ? { bg: 'rgba(22,163,74,.14)', color: '#16A34A' } : { bg: 'rgba(239,68,68,.14)', color: '#EF4444' })} /></TableCell>
                        <TableCell align="right">
                          <Tooltip title="Inspect"><IconButton size="small" onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[10, 25, 50, 100]}
            />
          </>
        )}
      </GlassCard>

      {/* Inspector side panel */}
      <Drawer anchor="right" open={Boolean(selectedLog)} onClose={() => setSelectedLog(null)} PaperProps={{ sx: { width: { xs: '100%', sm: 460 }, borderTopLeftRadius: { sm: 20 }, borderBottomLeftRadius: { sm: 20 } } }}>
        {selectedLog && (() => {
          const mc = getModuleBadgeColor(selectedLog.module);
          const sc = getSeverityBadgeColor(selectedLog.severity);
          const ok = okStatus(selectedLog.status);
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ position: 'relative', flexShrink: 0, p: 3, color: '#fff', background: `linear-gradient(135deg, #4C1D95, ${ok ? '#7C3AED' : '#DC2626'})` }}>
                <IconButton onClick={() => setSelectedLog(null)} size="small" sx={{ position: 'absolute', top: 12, right: 12, color: '#fff' }} aria-label="close"><CloseIcon /></IconButton>
                <Typography sx={{ opacity: 0.85, fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase' }}>Audit event</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', lineHeight: 1.3, pr: 4 }}>{selectedLog.action}</Typography>
                <Typography sx={{ opacity: 0.9, fontSize: '0.82rem', mt: 0.5 }}>{formatTimestamp(selectedLog.timestamp)}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1.75 }}>
                  <Chip size="small" label={String(selectedLog.module).replace(/_/g, ' ')} sx={{ ...pill({ bg: 'rgba(255,255,255,.2)', color: '#fff' }), alignSelf: 'auto' }} />
                  <Chip size="small" label={selectedLog.severity || 'INFO'} sx={{ ...pill({ bg: 'rgba(255,255,255,.2)', color: '#fff' }), alignSelf: 'auto' }} />
                  <Chip size="small" label={selectedLog.status} sx={{ ...pill({ bg: 'rgba(255,255,255,.2)', color: '#fff' }), alignSelf: 'auto' }} />
                </Stack>
              </Box>
              <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
                <Stack spacing={2.5}>
                  <Box sx={{ p: 2, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
                    <Typography color="text.secondary" sx={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', mb: 0.5 }}>What happened</Typography>
                    <Typography sx={{ lineHeight: 1.6 }}>{selectedLog.details || 'No detailed message provided.'}</Typography>
                  </Box>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 800 }}>{initials(selectedLog.actorEmail || selectedLog.actor_email)}</Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography noWrap sx={{ fontWeight: 800 }}>{selectedLog.actorEmail || selectedLog.actor_email || 'admin@bleez.ai'}</Typography>
                      <Typography color="text.secondary" variant="body2">{selectedLog.actorRole || selectedLog.actor_role || 'ADMIN'}</Typography>
                    </Box>
                  </Stack>
                  <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
                    <Field label="Actor ID" value={selectedLog.actorId || selectedLog.actor_id} mono />
                    <Field label="IP address" value={selectedLog.ipAddress || selectedLog.ip_address} mono />
                    <Field label="Target type" value={selectedLog.targetType || selectedLog.target_type} />
                    <Field label="Target ID" value={selectedLog.targetId || selectedLog.target_id} mono />
                  </Box>
                  <Field label="Device / browser" value={selectedLog.userAgent || selectedLog.user_agent} />
                  <Box>
                    <Typography color="text.secondary" sx={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', mb: 0.75 }}>Raw metadata</Typography>
                    <Box component="pre" sx={{ m: 0, p: 2, borderRadius: '12px', fontSize: '0.78rem', overflow: 'auto', maxHeight: 280, bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(0,0,0,.35)' : 'rgba(15,23,42,.05)') }}>
                      {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Box>
          );
        })()}
      </Drawer>
    </Box>
  );
};
