import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Avatar, Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, FormControlLabel, FormGroup, IconButton,
  InputAdornment, ListItemIcon, ListItemText, Menu, MenuItem, Select, Stack, Switch, TextField, ToggleButton,
  ToggleButtonGroup, Tooltip, Typography, keyframes,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BlockIcon from '@mui/icons-material/Block';
import WifiTetheringIcon from '@mui/icons-material/WifiTethering';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useSnackbar } from 'notistack';
import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DangerConfirmDialog } from '@/components/DangerConfirmDialog';
import { GrantOfferDialog } from '@/features/subscriptions/components/GrantOfferDialog';
import { apiClient } from '@/services/apiClient';
import { useAppSelector } from '@/store/hooks';
import { UsersMap, MapUser } from '../components/UsersMap';

type BackendRole = 'USER' | 'ADMIN';
type StatusFilter = 'all' | 'active' | 'deactivated';
type PresenceFilter = 'all' | 'online' | 'offline';

interface UserRow {
  id: string;
  name: string;
  email: string;
  phone?: string;
  picture?: string;
  role: BackendRole;
  enabled: boolean;
  online: boolean;
  authProvider?: string;
  city?: string;
  region?: string;
  country?: string;
  lat?: number;
  lng?: number;
  lastSeen?: string;
  lastLogin?: string;
  createdAt?: string;
}

// Maps a raw backend User document to a row. The password hash is deliberately never read.
const toRow = (u: any): UserRow => {
  const lat = typeof u.activeLocationLatitude === 'number' ? u.activeLocationLatitude : undefined;
  const lng = typeof u.activeLocationLongitude === 'number' ? u.activeLocationLongitude : undefined;
  return {
    id: u.id,
    name: u.name || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email,
    email: u.email,
    phone: u.phone,
    picture: u.picture,
    role: Array.isArray(u.roles) && (u.roles.includes('ADMIN') || u.roles.includes('SUPER_ADMIN') || u.roles.includes('CAMPAIGN_ADMIN')) ? 'ADMIN' : 'USER',
    enabled: u.enabled !== false,
    online: !!(u.online ?? u.isOnline),
    authProvider: u.authProvider,
    city: u.activeLocationCity || u.city || (u.profile && u.profile.city),
    region: u.activeLocationRegion || u.region || (u.profile && u.profile.state),
    country: u.activeLocationCountry || u.detectedCountry || u.country || (u.profile && u.profile.country),
    lat,
    lng,
    lastSeen: u.lastSeen,
    lastLogin: u.lastLogin,
    createdAt: u.createdAt,
  };
};

const placeOf = (u: UserRow) => {
  const parts = [u.city, u.region, u.country].filter(Boolean);
  if (parts.length > 0) return parts.join(', ');
  if (u.lat != null && u.lng != null) {
    return `${u.lat.toFixed(3)}°, ${u.lng.toFixed(3)}°`;
  }
  return '';
};

const timeAgo = (iso?: string) => {
  if (!iso) return '—';
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} d ago`;
  return new Date(iso).toLocaleDateString();
};

const fadeUp = keyframes`from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}`;
const ping = keyframes`0%{box-shadow:0 0 0 0 rgba(16,185,129,.6)}70%{box-shadow:0 0 0 7px rgba(16,185,129,0)}100%{box-shadow:0 0 0 0 rgba(16,185,129,0)}`;

const PresenceDot: React.FC<{ online: boolean }> = ({ online }) => (
  <Box sx={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, bgcolor: online ? '#10B981' : '#94A3B8', animation: online ? `${ping} 1.8s infinite` : 'none' }} />
);

export const UsersPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const currentEmail = useAppSelector((s) => s.auth.user?.email);
  const themeMode = useAppSelector((s) => s.theme.mode);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<{ user: UserRow; role: BackendRole } | null>(null);

  // filters
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [presence, setPresence] = useState<PresenceFilter>('all');
  const [role, setRole] = useState<'all' | BackendRole>('all');
  const [country, setCountry] = useState('all');
  const [provider, setProvider] = useState('all');
  const [showOffline, setShowOffline] = useState(true);
  const [focusId, setFocusId] = useState<string | null>(null);

  // Grant Offer & Perks Dialog state
  const [selectedUserForOffer, setSelectedUserForOffer] = useState<{ id: string; name: string; email: string } | null>(null);
  const [globalOfferOpen, setGlobalOfferOpen] = useState(false);

  // User status (deactivate / reactivate) confirmation dialog
  const [statusDialogUser, setStatusDialogUser] = useState<UserRow | null>(null);

  // Permanently delete user confirmation dialog
  const [deleteDialogUser, setDeleteDialogUser] = useState<UserRow | null>(null);

  // Bulk and purge all users state
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkDeleteUsersOpen, setBulkDeleteUsersOpen] = useState(false);
  const [purgeAllUsersOpen, setPurgeAllUsersOpen] = useState(false);

  // Clear history dialog state
  const [clearHistoryUser, setClearHistoryUser] = useState<UserRow | null>(null);
  const [historyScope, setHistoryScope] = useState({
    all: true,
    trips: true,
    bookings: true,
    media: true,
    alerts: true,
  });

  // Location history modal state
  const [locationHistoryUser, setLocationHistoryUser] = useState<UserRow | null>(null);
  const [locationHistoryList, setLocationHistoryList] = useState<any[]>([]);
  const [locationHistoryLoading, setLocationHistoryLoading] = useState(false);

  const fetchLocationHistory = async (user: UserRow) => {
    setLocationHistoryUser(user);
    setLocationHistoryLoading(true);
    try {
      const res = await apiClient.get(`/admin/users/${user.id}/location-history`);
      setLocationHistoryList(Array.isArray(res.data?.history) ? res.data.history : []);
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message || 'Failed to fetch location history', { variant: 'error' });
      setLocationHistoryList([]);
    } finally {
      setLocationHistoryLoading(false);
    }
  };

  // Action menu anchor state (3-dot menu)
  const [actionMenu, setActionMenu] = useState<{ anchorEl: HTMLElement; user: UserRow } | null>(null);

  const isProtectedAdmin = useCallback((row: UserRow) => {
    const e = (row.email || '').toLowerCase().trim();
    return e === (currentEmail || '').toLowerCase().trim() ||
           e === 'admin@aitravelglobe.com' ||
           e === 'syed@aitravelglobe.com';
  }, [currentEmail]);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/admin/users');
      setUsers((Array.isArray(res.data) ? res.data : []).map(toRow));
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Could not load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => {
      if (!document.hidden) load(true);
    }, 25000); // keep presence/location fresh
    return () => clearInterval(t);
  }, [load]);

  const countries = useMemo(() => Array.from(new Set(users.map((u) => u.country).filter(Boolean) as string[])).sort(), [users]);
  const providers = useMemo(() => Array.from(new Set(users.map((u) => u.authProvider).filter(Boolean) as string[])).sort(), [users]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (status === 'active' && !u.enabled) return false;
      if (status === 'deactivated' && u.enabled) return false;
      if (presence === 'online' && !u.online) return false;
      if (presence === 'offline' && u.online) return false;
      if (role !== 'all' && u.role !== role) return false;
      if (country !== 'all' && u.country !== country) return false;
      if (provider !== 'all' && u.authProvider !== provider) return false;
      if (!q) return true;
      return [u.name, u.email, u.phone, u.role, u.city, u.region, u.country].some((v) => (v || '').toLowerCase().includes(q));
    });
  }, [users, query, status, presence, role, country, provider]);

  const filtersActive = status !== 'all' || presence !== 'all' || role !== 'all' || country !== 'all' || provider !== 'all' || !!query;
  const clearFilters = () => { setQuery(''); setStatus('all'); setPresence('all'); setRole('all'); setCountry('all'); setProvider('all'); };

  const counts = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.enabled).length,
    deactivated: users.filter((u) => !u.enabled).length,
    online: users.filter((u) => u.online).length,
    admins: users.filter((u) => u.role === 'ADMIN').length,
  }), [users]);

  const mapUsers: MapUser[] = useMemo(
    () => filtered
      .filter((u) => u.lat != null && u.lng != null && (u.online || showOffline))
      .map((u) => ({ id: u.id, name: u.name, email: u.email, picture: u.picture, online: u.online, lat: u.lat!, lng: u.lng!, place: placeOf(u) || 'Unknown location' })),
    [filtered, showOffline]
  );
  const onlineOnMap = mapUsers.filter((u) => u.online);

  const changeRole = async () => {
    if (!pending) return;
    try {
      await apiClient.put(`/admin/users/${pending.user.id}/role`, { role: pending.role });
      enqueueSnackbar(`${pending.user.name} is now ${pending.role}`, { variant: 'success' });
      setPending(null);
      load();
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message || 'Could not change role', { variant: 'error' });
      setPending(null);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusDialogUser) return;
    try {
      const nextStatus = !statusDialogUser.enabled;
      await apiClient.put(`/admin/users/${statusDialogUser.id}/status`, { enabled: nextStatus });
      enqueueSnackbar(
        nextStatus ? `${statusDialogUser.name} has been reactivated.` : `${statusDialogUser.name} has been deactivated.`,
        { variant: 'success' }
      );
      setStatusDialogUser(null);
      load(true);
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message || 'Failed to update user status', { variant: 'error' });
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteDialogUser) return;
    try {
      await apiClient.delete(`/admin/users/${deleteDialogUser.id}`);
      enqueueSnackbar(`${deleteDialogUser.name} and all data deleted permanently.`, { variant: 'success' });
      setDeleteDialogUser(null);
      load(true);
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message || 'Failed to delete user', { variant: 'error' });
    }
  };

  const handleBulkDeleteUsers = async () => {
    if (!selectedUserIds.length) return;
    try {
      const res = await apiClient.post('/admin/users/bulk-delete', { userIds: selectedUserIds });
      enqueueSnackbar(`Successfully deleted ${res.data?.deleted_count ?? selectedUserIds.length} users.`, { variant: 'success' });
      setSelectedUserIds([]);
      setBulkDeleteUsersOpen(false);
      load(true);
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message || 'Failed to bulk delete users', { variant: 'error' });
    }
  };

  const handlePurgeAllUsers = async () => {
    try {
      const res = await apiClient.delete('/admin/users/all');
      enqueueSnackbar(`All platform users purged (${res.data?.deleted_count ?? 0} deleted, ${res.data?.preserved_count ?? 0} admins preserved).`, { variant: 'success' });
      setSelectedUserIds([]);
      setPurgeAllUsersOpen(false);
      load(true);
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message || 'Failed to purge users', { variant: 'error' });
    }
  };

  const handleClearHistory = async () => {
    if (!clearHistoryUser) return;
    try {
      const parts: string[] = [];
      if (historyScope.all) {
        parts.push('ALL');
      } else {
        if (historyScope.trips) parts.push('TRIPS');
        if (historyScope.bookings) parts.push('BOOKINGS');
        if (historyScope.media) parts.push('MEDIA');
        if (historyScope.alerts) parts.push('ALERTS_AND_ACTIVITY');
      }
      const scopeStr = parts.length > 0 ? parts.join(',') : 'ALL';
      await apiClient.delete(`/admin/users/${clearHistoryUser.id}/history`, {
        params: { scope: scopeStr },
      });
      enqueueSnackbar(`History cleared successfully for ${clearHistoryUser.name}.`, { variant: 'success' });
      setClearHistoryUser(null);
      load(true);
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message || 'Failed to clear user history', { variant: 'error' });
    }
  };

  const exportCsv = () => {
    const head = ['Name', 'Email', 'Phone', 'Role', 'Account', 'Presence', 'City', 'Region', 'Country', 'Sign-in', 'Last seen', 'Last login', 'Joined'];
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = filtered.map((u) => [u.name, u.email, u.phone, u.role, u.enabled ? 'Active' : 'Deactivated', u.online ? 'Online' : 'Offline', u.city, u.region, u.country, u.authProvider, u.lastSeen, u.lastLogin, u.createdAt]);
    const blob = new Blob([[head, ...rows].map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bleez-users.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const locate = (u: UserRow) => {
    if (u.lat == null) return;
    setFocusId(null);
    setTimeout(() => setFocusId(u.id), 0);
    document.getElementById('users-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const columns: GridColDef<UserRow>[] = [
    {
      field: 'name', headerName: 'Name', flex: 1, minWidth: 220,
      renderCell: (p) => (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ height: '100%' }}>
          <Avatar src={p.row.picture} sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.95rem' }}>{p.row.name.charAt(0).toUpperCase()}</Avatar>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }} noWrap>{p.row.name}</Typography>
        </Stack>
      ),
    },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 230 },
    { field: 'phone', headerName: 'Phone', width: 150, valueFormatter: (v: string) => v || '—' },
    {
      field: 'role', headerName: 'Role', width: 130,
      renderCell: (p) => (
        <Select
          size="small" variant="standard" value={p.row.role} disableUnderline
          disabled={p.row.email === currentEmail}
          onChange={(e) => setPending({ user: p.row, role: e.target.value as BackendRole })}
          sx={{ fontWeight: 700, fontSize: '0.85rem', color: p.row.role === 'ADMIN' ? 'warning.main' : 'text.primary' }}
          inputProps={{ 'aria-label': `Role for ${p.row.name}` }}
        >
          <MenuItem value="USER">USER</MenuItem>
          <MenuItem value="ADMIN">ADMIN</MenuItem>
        </Select>
      ),
    },
    {
      field: 'enabled', headerName: 'Account Status', width: 175,
      renderCell: (p) => {
        const isProtected = isProtectedAdmin(p.row);
        return (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
            <Switch
              size="small"
              checked={Boolean(p.value)}
              disabled={isProtected}
              color="success"
              onChange={() => setStatusDialogUser(p.row)}
              inputProps={{ 'aria-label': `Account status toggle for ${p.row.name}` }}
            />
            <Chip
              size="small"
              label={p.value ? 'Active' : 'Deactivated'}
              color={p.value ? 'success' : 'error'}
              variant={p.value ? 'filled' : 'outlined'}
              sx={{ fontWeight: 800, cursor: isProtected ? 'default' : 'pointer' }}
              onClick={() => {
                if (!isProtected) setStatusDialogUser(p.row);
              }}
            />
          </Stack>
        );
      },
    },
    {
      field: 'online', headerName: 'Presence', width: 130,
      renderCell: (p) => (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '100%' }}>
          <PresenceDot online={!!p.value} />
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: p.value ? 'success.main' : 'text.secondary' }}>{p.value ? 'Online' : 'Offline'}</Typography>
        </Stack>
      ),
    },
    {
      field: 'location', headerName: 'Current location', width: 240, sortable: true,
      valueGetter: (_v, row) => placeOf(row),
      renderCell: (p) => (p.value
        ? <Stack direction="row" spacing={0.75} alignItems="center" sx={{ height: '100%' }}><MyLocationIcon sx={{ fontSize: 16, color: p.row.online ? 'success.main' : 'text.disabled' }} /><Typography noWrap sx={{ fontSize: '0.875rem' }}>{p.value as string}</Typography></Stack>
        : <Typography color="text.disabled" sx={{ fontSize: '0.85rem' }}>Not shared</Typography>),
    },
    { field: 'country', headerName: 'Country', width: 130, valueFormatter: (v: string) => v || '—' },
    { field: 'authProvider', headerName: 'Sign-in', width: 100, valueFormatter: (v: string) => (v ? v.charAt(0).toUpperCase() + v.slice(1) : '—') },
    { field: 'lastSeen', headerName: 'Last seen', width: 130, valueGetter: (_v, r) => (r.online ? 'Now' : timeAgo(r.lastSeen || r.lastLogin)) },
    { field: 'lastLogin', headerName: 'Last login', width: 180, valueFormatter: (v: string) => (v ? new Date(v).toLocaleString() : '—') },
    { field: 'createdAt', headerName: 'Joined', width: 120, valueFormatter: (v: string) => (v ? new Date(v).toLocaleDateString() : '—') },
    {
      field: 'actions', headerName: 'Actions', width: 80, sortable: false, filterable: false, align: 'center', headerAlign: 'center',
      renderCell: (p) => (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setActionMenu({ anchorEl: e.currentTarget, user: p.row });
          }}
          aria-label={`Actions for ${p.row.name}`}
          sx={{
            color: 'text.secondary',
            '&:hover': { color: 'text.primary', bgcolor: 'action.hover' },
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const kpis = [
    { label: 'Total users', value: counts.total, icon: <PeopleIcon />, color: '#6366F1', apply: () => clearFilters(), on: !filtersActive },
    { label: 'Active accounts', value: counts.active, icon: <CheckCircleIcon />, color: '#10B981', apply: () => setStatus('active'), on: status === 'active' },
    { label: 'Deactivated', value: counts.deactivated, icon: <BlockIcon />, color: '#EF4444', apply: () => setStatus('deactivated'), on: status === 'deactivated' },
    { label: 'Online now', value: counts.online, icon: <WifiTetheringIcon />, color: '#06B6D4', apply: () => setPresence('online'), on: presence === 'online' },
    { label: 'Administrators', value: counts.admins, icon: <AdminPanelSettingsIcon />, color: '#F59E0B', apply: () => setRole('ADMIN'), on: role === 'ADMIN' },
  ];

  return (
    <Box>
      <PageHeader
        title="Users"
        subtitle="Everyone registered on the platform — see who is active, where they are, and manage administrators."
        breadcrumbs={[{ label: 'Users' }]}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              startIcon={<CardGiftcardIcon />}
              onClick={() => setGlobalOfferOpen(true)}
              sx={{ fontWeight: 800 }}
            >
              Grant Offer
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportCsv} disabled={!filtered.length}>Export CSV</Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => load()} disabled={loading}>Refresh</Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteForeverIcon />}
              onClick={() => setPurgeAllUsersOpen(true)}
              sx={{ fontWeight: 800 }}
            >
              Purge All Users
            </Button>
          </Stack>
        }
      />
      {error && <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={() => load()}>Retry</Button>}>{error}</Alert>}

      {/* KPI cards double as quick filters */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, 1fr)' }, gap: 2, mb: 3 }}>
        {kpis.map((k, i) => (
          <GlassCard
            key={k.label}
            onClick={() => { clearFilters(); if (k.label !== 'Total users') k.apply(); }}
            sx={{
              p: 2, cursor: 'pointer', position: 'relative', overflow: 'hidden',
              animation: `${fadeUp} .5s ${i * 0.07}s ease-out both`,
              borderColor: k.on && k.label !== 'Total users' ? k.color : undefined,
              boxShadow: k.on && k.label !== 'Total users' ? `0 10px 26px -10px ${k.color}88` : undefined,
              '&:hover': { transform: 'translateY(-4px)', borderColor: k.color },
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>{loading ? '…' : k.value.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ width: 44, height: 44, borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: `linear-gradient(135deg, ${k.color}, ${k.color}bb)`, boxShadow: `0 8px 18px -8px ${k.color}` }}>{k.icon}</Box>
            </Stack>
          </GlassCard>
        ))}
      </Box>

      {/* Live map */}
      <GlassCard id="users-map" sx={{ p: 2.5, mb: 3, animation: `${fadeUp} .6s .3s ease-out both` }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Live User Map</Typography>
            <Typography variant="body2" color="text.secondary">
              <Box component="span" sx={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', bgcolor: '#10B981', mr: 0.75 }} />
              Green = active right now · <Box component="span" sx={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', bgcolor: '#94A3B8', mx: 0.75 }} />Grey = last known location
            </Typography>
          </Box>
          <FormControlLabel control={<Switch size="small" checked={showOffline} onChange={(e) => setShowOffline(e.target.checked)} />} label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Show offline users</Typography>} />
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 300px' }, gap: 2 }}>
          <UsersMap users={mapUsers} mode={themeMode} focusId={focusId} height={440} />
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, maxHeight: 440 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', mb: 1 }}>Active now ({onlineOnMap.length})</Typography>
            <Stack spacing={1} sx={{ overflowY: 'auto', pr: 0.5, flexGrow: 1 }}>
              {onlineOnMap.length === 0 && <Typography variant="body2" color="text.secondary">No active user is sharing a location right now.</Typography>}
              {onlineOnMap.map((u) => (
                <Box
                  key={u.id}
                  onClick={() => { setFocusId(null); setTimeout(() => setFocusId(u.id), 0); }}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25, borderRadius: '12px', cursor: 'pointer', border: '1px solid', borderColor: 'divider', borderLeft: '3px solid #10B981', transition: 'all .2s', '&:hover': { transform: 'translateX(4px)', bgcolor: 'action.hover' } }}
                >
                  <Avatar src={u.picture} sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.85rem' }}>{u.name.charAt(0).toUpperCase()}</Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{u.name}</Typography>
                    <Typography noWrap variant="caption" color="text.secondary">📍 {u.place}</Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </GlassCard>

      {/* Filters + table */}
      <GlassCard sx={{ p: 2, animation: `${fadeUp} .6s .4s ease-out both` }}>
        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            size="small" placeholder="Search name, email, phone, location…" value={query} onChange={(e) => setQuery(e.target.value)}
            sx={{ width: { xs: '100%', sm: 320 } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
          <ToggleButtonGroup size="small" exclusive value={status} onChange={(_, v) => v && setStatus(v)} color="primary">
            <ToggleButton value="all" sx={{ px: 2, fontWeight: 700 }}>All</ToggleButton>
            <ToggleButton value="active" sx={{ px: 2, fontWeight: 700 }}>Active</ToggleButton>
            <ToggleButton value="deactivated" sx={{ px: 2, fontWeight: 700 }}>Deactivated</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup size="small" exclusive value={presence} onChange={(_, v) => v && setPresence(v)} color="success">
            <ToggleButton value="all" sx={{ px: 2, fontWeight: 700 }}>Any presence</ToggleButton>
            <ToggleButton value="online" sx={{ px: 2, fontWeight: 700 }}>Online</ToggleButton>
            <ToggleButton value="offline" sx={{ px: 2, fontWeight: 700 }}>Offline</ToggleButton>
          </ToggleButtonGroup>
          <Select size="small" value={role} onChange={(e) => setRole(e.target.value as any)} sx={{ minWidth: 130 }}>
            <MenuItem value="all">All roles</MenuItem><MenuItem value="USER">User</MenuItem><MenuItem value="ADMIN">Admin</MenuItem>
          </Select>
          <Select size="small" value={country} onChange={(e) => setCountry(e.target.value)} sx={{ minWidth: 150 }}>
            <MenuItem value="all">All countries</MenuItem>
            {countries.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
          <Select size="small" value={provider} onChange={(e) => setProvider(e.target.value)} sx={{ minWidth: 140 }}>
            <MenuItem value="all">All sign-ins</MenuItem>
            {providers.map((p) => <MenuItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</MenuItem>)}
          </Select>
          {filtersActive && <Button size="small" startIcon={<FilterAltOffIcon />} onClick={clearFilters}>Clear</Button>}

          {selectedUserIds.length > 0 && (
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<DeleteOutlineIcon />}
              onClick={() => setBulkDeleteUsersOpen(true)}
              sx={{ fontWeight: 700 }}
            >
              Delete Selected ({selectedUserIds.length})
            </Button>
          )}

          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Showing {filtered.length} of {users.length}</Typography>
        </Stack>

        {!loading && filtered.length === 0 ? (
          <EmptyState title="No users found" description={filtersActive ? 'Nothing matches the current filters.' : 'No users are registered yet.'} />
        ) : (
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <DataGrid
              rows={filtered}
              columns={columns}
              loading={loading}
              rowHeight={60}
              autoHeight
              checkboxSelection
              onRowSelectionModelChange={(newModel) => setSelectedUserIds(newModel as string[])}
              rowSelectionModel={selectedUserIds}
              isRowSelectable={(params) => !isProtectedAdmin(params.row)}
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              sx={{ border: 0, minWidth: 1100, '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 800 }, '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' } }}
            />
          </Box>
        )}
      </GlassCard>

      <ConfirmDialog
        open={!!pending}
        title="Change user role?"
        message={pending ? `${pending.user.name} (${pending.user.email}) will become ${pending.role}. ${pending.role === 'ADMIN' ? 'They will gain full access to this dashboard.' : 'They will lose access to this dashboard.'}` : ''}
        confirmText="Change role"
        color={pending?.role === 'ADMIN' ? 'warning' : 'primary'}
        onConfirm={changeRole}
        onClose={() => setPending(null)}
      />

      <GrantOfferDialog
        open={Boolean(selectedUserForOffer || globalOfferOpen)}
        targetUser={selectedUserForOffer}
        onClose={() => {
          setSelectedUserForOffer(null);
          setGlobalOfferOpen(false);
        }}
        onSuccess={() => {
          load(true);
        }}
      />

      <ConfirmDialog
        open={!!statusDialogUser}
        title={statusDialogUser?.enabled ? 'Deactivate user account?' : 'Reactivate user account?'}
        message={statusDialogUser ? (
          statusDialogUser.enabled
            ? `Are you sure you want to deactivate ${statusDialogUser.name} (${statusDialogUser.email})? The user will be immediately logged out and blocked from logging into the mobile or web app.`
            : `Reactivate ${statusDialogUser.name} (${statusDialogUser.email})? The user will regain access to their Bleez account.`
        ) : ''}
        confirmText={statusDialogUser?.enabled ? 'Deactivate' : 'Reactivate'}
        color={statusDialogUser?.enabled ? 'error' : 'success'}
        onConfirm={handleToggleStatus}
        onClose={() => setStatusDialogUser(null)}
      />

      <ConfirmDialog
        open={!!deleteDialogUser}
        title="Permanently delete user account?"
        message={deleteDialogUser ? `Are you sure you want to permanently delete ${deleteDialogUser.name} (${deleteDialogUser.email})? All associated trips, flight bookings, media albums, intelligence alerts, and behavior logs will be permanently erased. THIS ACTION CANNOT BE UNDONE.` : ''}
        confirmText="Delete Permanently"
        color="error"
        onConfirm={handleDeleteUser}
        onClose={() => setDeleteDialogUser(null)}
      />

      {/* Bulk Delete Selected Users */}
      <ConfirmDialog
        open={bulkDeleteUsersOpen}
        title="Permanently delete selected users?"
        message={`Are you sure you want to permanently delete ${selectedUserIds.length} selected user accounts and all their associated trips, bookings, and alerts? Protected administrator accounts will be automatically preserved.`}
        confirmText={`Delete ${selectedUserIds.length} Users`}
        color="error"
        onConfirm={handleBulkDeleteUsers}
        onClose={() => setBulkDeleteUsersOpen(false)}
      />

      {/* Purge All Users Danger Confirm */}
      <DangerConfirmDialog
        open={purgeAllUsersOpen}
        title="Purge All Registered Platform Users?"
        message="Are you sure you want to purge all standard traveler user accounts from the database? All itineraries, bookings, and alerts will be erased. Protected administrator accounts and your current session will be preserved."
        expectedWord="DELETE"
        confirmText="Purge All Users"
        onConfirm={handlePurgeAllUsers}
        onClose={() => setPurgeAllUsersOpen(false)}
      />

      <Dialog
        open={!!clearHistoryUser}
        onClose={() => setClearHistoryUser(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Clear User History</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Select the history data you want to wipe for <strong>{clearHistoryUser?.name}</strong>. The user account will remain active.
          </DialogContentText>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={historyScope.all}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setHistoryScope({
                      all: checked,
                      trips: checked,
                      bookings: checked,
                      media: checked,
                      alerts: checked,
                    });
                  }}
                  color="warning"
                />
              }
              label={<strong>Wipe All History (Complete reset)</strong>}
            />
            <Box sx={{ pl: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={historyScope.trips}
                    onChange={(e) => {
                      const next = { ...historyScope, trips: e.target.checked };
                      next.all = next.trips && next.bookings && next.media && next.alerts;
                      setHistoryScope(next);
                    }}
                    color="warning"
                    size="small"
                  />
                }
                label="Trips & Itineraries (including expenses)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={historyScope.bookings}
                    onChange={(e) => {
                      const next = { ...historyScope, bookings: e.target.checked };
                      next.all = next.trips && next.bookings && next.media && next.alerts;
                      setHistoryScope(next);
                    }}
                    color="warning"
                    size="small"
                  />
                }
                label="Flight Bookings"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={historyScope.media}
                    onChange={(e) => {
                      const next = { ...historyScope, media: e.target.checked };
                      next.all = next.trips && next.bookings && next.media && next.alerts;
                      setHistoryScope(next);
                    }}
                    color="warning"
                    size="small"
                  />
                }
                label="Media & Photo Albums"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={historyScope.alerts}
                    onChange={(e) => {
                      const next = { ...historyScope, alerts: e.target.checked };
                      next.all = next.trips && next.bookings && next.media && next.alerts;
                      setHistoryScope(next);
                    }}
                    color="warning"
                    size="small"
                  />
                }
                label="Alerts, Intelligence Logs & Telemetry"
              />
            </Box>
          </FormGroup>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setClearHistoryUser(null)} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleClearHistory}
            variant="contained"
            color="warning"
            disabled={!historyScope.trips && !historyScope.bookings && !historyScope.media && !historyScope.alerts && !historyScope.all}
          >
            Clear Selected History
          </Button>
        </DialogActions>
      </Dialog>

      {/* 3-Dot Row Action Menu */}
      <Menu
        anchorEl={actionMenu?.anchorEl}
        open={Boolean(actionMenu)}
        onClose={() => setActionMenu(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            minWidth: 220,
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            border: '1px solid',
            borderColor: 'divider',
            p: 0.5,
          },
        }}
      >
        {actionMenu && (() => {
          const user = actionMenu.user;
          const isProtected = isProtectedAdmin(user);
          return (
            <>
              <MenuItem
                disabled={isProtected}
                onClick={() => {
                  setStatusDialogUser(user);
                  setActionMenu(null);
                }}
                sx={{
                  borderRadius: '8px',
                  py: 1,
                  gap: 1.5,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: user.enabled ? 'error.main' : 'success.main',
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 'auto' }}>
                  {user.enabled ? <BlockIcon fontSize="small" /> : <CheckCircleOutlineIcon fontSize="small" />}
                </ListItemIcon>
                <ListItemText primary={user.enabled ? 'Deactivate User' : 'Reactivate User'} />
              </MenuItem>

              <MenuItem
                disabled={isProtected}
                onClick={() => {
                  setDeleteDialogUser(user);
                  setActionMenu(null);
                }}
                sx={{
                  borderRadius: '8px',
                  py: 1,
                  gap: 1.5,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#EF4444',
                }}
              >
                <ListItemIcon sx={{ color: '#EF4444', minWidth: 'auto' }}>
                  <DeleteOutlineIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Delete Permanently" />
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setHistoryScope({ all: true, trips: true, bookings: true, media: true, alerts: true });
                  setClearHistoryUser(user);
                  setActionMenu(null);
                }}
                sx={{
                  borderRadius: '8px',
                  py: 1,
                  gap: 1.5,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'warning.main',
                }}
              >
                <ListItemIcon sx={{ color: 'warning.main', minWidth: 'auto' }}>
                  <HistoryToggleOffIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Clear History" />
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setSelectedUserForOffer({ id: user.id, name: user.name, email: user.email });
                  setActionMenu(null);
                }}
                sx={{
                  borderRadius: '8px',
                  py: 1,
                  gap: 1.5,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'primary.main',
                }}
              >
                <ListItemIcon sx={{ color: 'primary.main', minWidth: 'auto' }}>
                  <CardGiftcardIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Grant Offer / Perks" />
              </MenuItem>

              <MenuItem
                onClick={() => {
                  fetchLocationHistory(user);
                  setActionMenu(null);
                }}
                sx={{
                  borderRadius: '8px',
                  py: 1,
                  gap: 1.5,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'info.main',
                }}
              >
                <ListItemIcon sx={{ color: 'info.main', minWidth: 'auto' }}>
                  <MyLocationIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="View Location Timeline" />
              </MenuItem>

              {user.lat != null && (
                <MenuItem
                  onClick={() => {
                    locate(user);
                    setActionMenu(null);
                  }}
                  sx={{
                    borderRadius: '8px',
                    py: 1,
                    gap: 1.5,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  <ListItemIcon sx={{ color: 'info.main', minWidth: 'auto' }}>
                    <MyLocationIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="View on Map" />
                </MenuItem>
              )}
            </>
          );
        })()}
      </Menu>

      {/* Location History Dialog */}
      <Dialog
        open={Boolean(locationHistoryUser)}
        onClose={() => setLocationHistoryUser(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <MyLocationIcon color="primary" />
          Location Timeline — {locationHistoryUser?.name}
        </DialogTitle>
        <DialogContent dividers>
          {locationHistoryLoading ? (
            <Typography variant="body2" sx={{ py: 3, textAlign: 'center' }}>Loading timeline…</Typography>
          ) : locationHistoryList.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
              No location breadcrumbs recorded yet for this traveler.
            </Typography>
          ) : (
            <Stack spacing={1.5} sx={{ py: 1 }}>
              {locationHistoryList.map((item, idx) => (
                <Box
                  key={item.id || idx}
                  sx={{
                    p: 1.5,
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderLeft: '4px solid #3B82F6',
                    bgcolor: 'action.hover',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      📍 {[item.city, item.region, item.country].filter(Boolean).join(', ') || 'GPS Coordinate Ping'}
                    </Typography>
                    <Chip
                      size="small"
                      label={item.triggerEvent || 'HEARTBEAT'}
                      color={item.triggerEvent === 'APP_RESUME' ? 'secondary' : item.triggerEvent === 'LOGIN' ? 'success' : 'default'}
                      sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Coordinates: {item.latitude}, {item.longitude}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Captured: {item.recordedAt ? new Date(item.recordedAt).toLocaleString() : '—'} · Platform: {item.platform || 'MOBILE_APP'}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setLocationHistoryUser(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
