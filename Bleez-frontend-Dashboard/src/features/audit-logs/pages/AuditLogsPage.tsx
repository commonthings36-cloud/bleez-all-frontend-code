import React, { useCallback, useEffect, useState } from 'react';
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

  return (
    <Box>
      <PageHeader
        title="Admin Audit Logs & Action Trail"
        subtitle="Track admin actions, module alterations, IP addresses, timestamps, and security events."
        breadcrumbs={[{ label: 'Platform' }, { label: 'Audit Logs' }]}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={exporting ? <CircularProgress size={16} /> : <DownloadIcon />}
              onClick={handleExportCsv}
              disabled={exporting || loading}
              sx={{ fontWeight: 700 }}
            >
              Export CSV
            </Button>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
              onClick={() => {
                fetchOverview();
                fetchLogs();
              }}
              disabled={loading}
              sx={{ fontWeight: 700 }}
            >
              Refresh
            </Button>
          </Stack>
        }
      />

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* KPI Overview Metric Cards */}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          mb: 3,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        }}
      >
        {/* Total Events */}
        <GlassCard sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
              Total Audit Events
            </Typography>
            <HistoryIcon sx={{ color: '#6366F1', fontSize: 24 }} />
          </Stack>
          <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
            {(overview?.totalEvents ?? totalCount).toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8rem' }}>
            Immutable security trail records
          </Typography>
        </GlassCard>

        {/* 24h Velocity */}
        <GlassCard sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
              24h Event Velocity
            </Typography>
            <SecurityIcon sx={{ color: '#10B981', fontSize: 24 }} />
          </Stack>
          <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
            {(overview?.events24h ?? 0).toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8rem' }}>
            Actions logged in last 24 hours
          </Typography>
        </GlassCard>

        {/* Security & Warnings */}
        <GlassCard sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
              Security & Alerts
            </Typography>
            <WarningAmberIcon sx={{ color: '#F59E0B', fontSize: 24 }} />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mt: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {(overview?.criticalCount ?? 0).toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              critical / security
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8rem' }}>
            {(overview?.warningCount ?? 0).toLocaleString()} warning notices logged
          </Typography>
        </GlassCard>

        {/* Active Admins */}
        <GlassCard sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
              Active Operators
            </Typography>
            <AdminPanelSettingsIcon sx={{ color: '#0EA5E9', fontSize: 24 }} />
          </Stack>
          <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
            {(overview?.activeAdminsCount ?? 1).toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8rem' }}>
            Authorized admin credentials
          </Typography>
        </GlassCard>
      </Box>

      {/* Main GlassCard Container */}
      <GlassCard sx={{ p: 2.5 }}>
        {/* Filters and Controls Bar */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 2.5 }}
        >
          {/* Search Box */}
          <TextField
            size="small"
            placeholder="Search action, details, actor email, IP..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: { xs: '100%', md: 320 } }}
          />

          {/* Dropdown Filters */}
          <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center">
            {/* Module Filter */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="module-filter-label">Module</InputLabel>
              <Select
                labelId="module-filter-label"
                label="Module"
                value={moduleFilter}
                onChange={(e) => {
                  setModuleFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Modules</MenuItem>
                <MenuItem value="SCHEDULER">Scheduler</MenuItem>
                <MenuItem value="SECURITY">Security</MenuItem>
                <MenuItem value="USERS">Users</MenuItem>
                <MenuItem value="CAMPAIGNS">Campaigns</MenuItem>
                <MenuItem value="EMERGENCY_SOS">Emergency SOS</MenuItem>
                <MenuItem value="BOOKINGS">Bookings</MenuItem>
                <MenuItem value="PLATFORM">Platform</MenuItem>
              </Select>
            </FormControl>

            {/* Severity Filter */}
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel id="severity-filter-label">Severity</InputLabel>
              <Select
                labelId="severity-filter-label"
                label="Severity"
                value={severityFilter}
                onChange={(e) => {
                  setSeverityFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Severities</MenuItem>
                <MenuItem value="INFO">Info</MenuItem>
                <MenuItem value="WARN">Warning</MenuItem>
                <MenuItem value="CRITICAL">Critical</MenuItem>
                <MenuItem value="SECURITY">Security</MenuItem>
              </Select>
            </FormControl>

            {/* Status Filter */}
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                label="Status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="SUCCESS">Success</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
                <MenuItem value="WARNING">Warning</MenuItem>
              </Select>
            </FormControl>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <Tooltip title="Reset all filters">
                <IconButton onClick={resetFilters} size="small" color="secondary">
                  <FilterAltOffIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>

        {/* Audit Logs Table */}
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Actor</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Module</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Target</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Client IP</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Severity</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.5 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, py: 1.5 }}>
                  Inspect
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ py: 6, textAlign: 'center' }}>
                    <EmptyState
                      title="No Audit Records Found"
                      description={hasActiveFilters ? 'Try adjusting your search filters.' : 'Audit events will stream here as operations execute.'}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const actorEmail = log.actorEmail || log.actor_email || 'admin@bleez.ai';
                  const actorRole = log.actorRole || log.actor_role || 'ADMIN';
                  const targetType = log.targetType || log.target_type || 'Entity';
                  const targetId = log.targetId || log.target_id || '—';
                  const ip = log.ipAddress || log.ip_address || '127.0.0.1';
                  const status = log.status || 'SUCCESS';
                  const severity = log.severity || 'INFO';
                  const moduleColor = getModuleBadgeColor(log.module);
                  const severityColor = getSeverityBadgeColor(severity);
                  const isSuccess = status === 'SUCCESS';

                  return (
                    <TableRow
                      key={log.id}
                      hover
                      sx={{
                        cursor: 'pointer',
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                      onClick={() => setSelectedLog(log)}
                    >
                      {/* Timestamp */}
                      <TableCell sx={{ py: 1.5, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {formatTimestamp(log.timestamp)}
                      </TableCell>

                      {/* Actor */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>
                          {actorEmail}
                        </Typography>
                        <Chip
                          size="small"
                          label={actorRole}
                          sx={{ fontSize: '0.65rem', height: 18, bgcolor: 'rgba(0, 0, 0, 0.05)', fontWeight: 600 }}
                        />
                      </TableCell>

                      {/* Module */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Chip
                          size="small"
                          label={log.module}
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            height: 22,
                            bgcolor: moduleColor.bg,
                            color: moduleColor.color,
                          }}
                        />
                      </TableCell>

                      {/* Action */}
                      <TableCell sx={{ py: 1.5, fontWeight: 700, fontSize: '0.82rem' }}>
                        {log.action}
                      </TableCell>

                      {/* Target */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                          {targetType}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          {targetId.length > 18 ? targetId.substring(0, 18) + '...' : targetId}
                        </Typography>
                      </TableCell>

                      {/* Client IP */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Chip
                          size="small"
                          label={ip}
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.72rem',
                            height: 20,
                            bgcolor: 'rgba(0, 0, 0, 0.04)',
                          }}
                        />
                      </TableCell>

                      {/* Severity */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Chip
                          size="small"
                          label={severity}
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            height: 22,
                            bgcolor: severityColor.bg,
                            color: severityColor.color,
                          }}
                        />
                      </TableCell>

                      {/* Status */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Chip
                          size="small"
                          label={status}
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            height: 22,
                            bgcolor: isSuccess ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: isSuccess ? '#10B981' : '#EF4444',
                          }}
                        />
                      </TableCell>

                      {/* Inspect */}
                      <TableCell align="right" sx={{ py: 1.5 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          sx={{ color: 'primary.main' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.06)', mt: 1 }}
        />
      </GlassCard>

      {/* Audit Detail Inspector Dialog */}
      <Dialog
        open={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Security Audit Trail Inspector</span>
          <IconButton size="small" onClick={() => setSelectedLog(null)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ py: 2.5 }}>
          {selectedLog && (
            <Stack spacing={2.5}>
              {/* Event Overview Badges */}
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                <Chip
                  label={selectedLog.module}
                  sx={{
                    fontWeight: 700,
                    bgcolor: getModuleBadgeColor(selectedLog.module).bg,
                    color: getModuleBadgeColor(selectedLog.module).color,
                  }}
                />
                <Chip
                  label={selectedLog.severity}
                  sx={{
                    fontWeight: 700,
                    bgcolor: getSeverityBadgeColor(selectedLog.severity).bg,
                    color: getSeverityBadgeColor(selectedLog.severity).color,
                  }}
                />
                <Chip
                  label={selectedLog.status}
                  sx={{
                    fontWeight: 700,
                    bgcolor: selectedLog.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    color: selectedLog.status === 'SUCCESS' ? '#10B981' : '#EF4444',
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  Logged: {formatTimestamp(selectedLog.timestamp)}
                </Typography>
              </Stack>

              {/* Action & Details */}
              <Box sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  {selectedLog.action}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                  {selectedLog.details || 'No detailed message provided.'}
                </Typography>
              </Box>

              {/* Actor & Target Specs */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    ADMIN ACTOR
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {selectedLog.actorEmail || selectedLog.actor_email || 'admin@bleez.ai'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Role: {selectedLog.actorRole || selectedLog.actor_role || 'ADMIN'} · ID: {selectedLog.actorId || selectedLog.actor_id || '—'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    TARGET RESOURCE
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {selectedLog.targetType || selectedLog.target_type || 'Entity'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                    ID: {selectedLog.targetId || selectedLog.target_id || '—'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    CLIENT IP ADDRESS
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, mt: 0.5 }}>
                    {selectedLog.ipAddress || selectedLog.ip_address || '127.0.0.1'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    USER AGENT
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', mt: 0.5, color: 'text.secondary' }}>
                    {selectedLog.userAgent || selectedLog.user_agent || 'Mozilla/5.0'}
                  </Typography>
                </Box>
              </Box>

              {/* JSON Metadata Payload */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                  METADATA & PAYLOAD SNAPSHOT
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    p: 2,
                    bgcolor: '#0F172A',
                    color: '#38BDF8',
                    borderRadius: 2,
                    fontSize: '0.8rem',
                    overflowX: 'auto',
                    fontFamily: 'monospace',
                  }}
                >
                  {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                </Box>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSelectedLog(null)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
