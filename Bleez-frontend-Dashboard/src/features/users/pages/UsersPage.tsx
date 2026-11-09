import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Avatar, Box, Button, Chip, FormControlLabel, IconButton, InputAdornment, MenuItem, Select, Stack,
  Switch, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography, keyframes,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import WifiTetheringIcon from '@mui/icons-material/WifiTethering';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useSnackbar } from 'notistack';
import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
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
    role: Array.isArray(u.roles) && u.roles.includes('ADMIN') ? 'ADMIN' : 'USER',
    enabled: u.enabled !== false,
    online: !!(u.online ?? u.isOnline),
    authProvider: u.authProvider,
    city: u.activeLocationCity,
    region: u.activeLocationRegion,
    country: u.activeLocationCountry || u.detectedCountry,
    lat,
    lng,
    lastSeen: u.lastSeen,
    lastLogin: u.lastLogin,
    createdAt: u.createdAt,
  };
};

const placeOf = (u: UserRow) => [u.city, u.region, u.country].filter(Boolean).join(', ');

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
    const t = setInterval(() => load(true), 20000); // keep presence/location fresh
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
      field: 'enabled', headerName: 'Account', width: 130,
      renderCell: (p) => <Chip size="small" label={p.value ? 'Active' : 'Deactivated'} color={p.value ? 'success' : 'error'} variant={p.value ? 'filled' : 'outlined'} sx={{ fontWeight: 700 }} />,
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
      field: 'actions', headerName: '', width: 70, sortable: false, filterable: false, align: 'center',
      renderCell: (p) => (
        <Tooltip title={p.row.lat != null ? 'Show on map' : 'No location shared'}>
          <span><IconButton size="small" disabled={p.row.lat == null} onClick={() => locate(p.row)}><MyLocationIcon fontSize="small" /></IconButton></span>
        </Tooltip>
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
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportCsv} disabled={!filtered.length}>Export CSV</Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => load()} disabled={loading}>Refresh</Button>
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
    </Box>
  );
};
