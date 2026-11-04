import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Avatar, Box, Button, Chip, InputAdornment, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { useSnackbar } from 'notistack';
import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { apiClient } from '@/services/apiClient';
import { useAppSelector } from '@/store/hooks';

type BackendRole = 'USER' | 'ADMIN';

interface UserRow {
  id: string;
  name: string;
  email: string;
  picture?: string;
  role: BackendRole;
  enabled: boolean;
  online: boolean;
  authProvider?: string;
  country?: string;
  lastLogin?: string;
  createdAt?: string;
}

// Maps a raw backend User document to a row. The password hash is deliberately never read.
const toRow = (u: any): UserRow => ({
  id: u.id,
  name: u.name || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email,
  email: u.email,
  picture: u.picture,
  role: Array.isArray(u.roles) && u.roles.includes('ADMIN') ? 'ADMIN' : 'USER',
  enabled: u.enabled !== false,
  online: !!u.online,
  authProvider: u.authProvider,
  country: u.detectedCountry,
  lastLogin: u.lastLogin,
  createdAt: u.createdAt,
});

export const UsersPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const currentEmail = useAppSelector((s) => s.auth.user?.email);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState<{ user: UserRow; role: BackendRole } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
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
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? users.filter((u) => [u.name, u.email, u.role, u.country].some((v) => (v || '').toLowerCase().includes(q))) : users;
  }, [users, query]);

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

  const columns: GridColDef<UserRow>[] = [
    {
      field: 'name',
      headerName: 'User',
      flex: 1,
      minWidth: 280,
      renderCell: (p) => (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ height: '100%' }}>
          <Avatar src={p.row.picture} sx={{ width: 38, height: 38, bgcolor: 'primary.main' }}>{p.row.name.charAt(0).toUpperCase()}</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.3 }} noWrap>{p.row.name}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>{p.row.email}</Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 150,
      sortable: true,
      renderCell: (p) => (
        <Select
          size="small"
          variant="standard"
          value={p.row.role}
          disabled={p.row.email === currentEmail}
          onChange={(e) => setPending({ user: p.row, role: e.target.value as BackendRole })}
          inputProps={{ 'aria-label': `Role for ${p.row.name}` }}
        >
          <MenuItem value="USER">USER</MenuItem>
          <MenuItem value="ADMIN">ADMIN</MenuItem>
        </Select>
      ),
    },
    { field: 'enabled', headerName: 'Account', width: 120, renderCell: (p) => <Chip size="small" label={p.value ? 'Active' : 'Disabled'} color={p.value ? 'success' : 'default'} /> },
    { field: 'online', headerName: 'Presence', width: 120, renderCell: (p) => <Chip size="small" variant="outlined" label={p.value ? 'Online' : 'Offline'} color={p.value ? 'success' : 'default'} /> },
    { field: 'authProvider', headerName: 'Sign-in', width: 110 },
    { field: 'country', headerName: 'Country', width: 120 },
    { field: 'lastLogin', headerName: 'Last login', width: 180, valueFormatter: (v: string) => (v ? new Date(v).toLocaleString() : '—') },
    { field: 'createdAt', headerName: 'Joined', width: 130, valueFormatter: (v: string) => (v ? new Date(v).toLocaleDateString() : '—') },
  ];

  return (
    <Box>
      <PageHeader
        title="Users"
        subtitle="Everyone registered on the platform. Promote or demote administrators."
        breadcrumbs={[{ label: 'Users' }]}
        action={<Button variant="outlined" startIcon={<RefreshIcon />} onClick={load} disabled={loading}>Refresh</Button>}
      />
      {error && <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={load}>Retry</Button>}>{error}</Alert>}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total users', value: users.length },
          { label: 'Administrators', value: users.filter((u) => u.role === 'ADMIN').length },
          { label: 'Online now', value: users.filter((u) => u.online).length },
        ].map((k) => (
          <GlassCard key={k.label} sx={{ p: 2.5, flex: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>{k.label}</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{loading ? '…' : k.value.toLocaleString()}</Typography>
          </GlassCard>
        ))}
      </Stack>

      <GlassCard sx={{ p: 2 }}>
        <TextField
          size="small"
          placeholder="Search name, email, role, country…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ mb: 2, width: { xs: '100%', sm: 380 } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        {!loading && filtered.length === 0 ? (
          <EmptyState title="No users found" description={query ? 'Nothing matches your search.' : 'No users are registered yet.'} />
        ) : (
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <DataGrid
              rows={filtered}
              columns={columns}
              loading={loading}
              rowHeight={64}
              autoHeight
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              sx={{ border: 0, minWidth: 1000 }}
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
