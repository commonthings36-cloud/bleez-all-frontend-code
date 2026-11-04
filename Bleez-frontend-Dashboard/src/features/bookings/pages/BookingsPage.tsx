import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Chip, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { apiClient } from '@/services/apiClient';

interface Booking {
  id: string;
  destination?: string;
  title?: string;
  travelerName?: string;
  price?: number;
  type?: string;
  status?: string;
  bookingDate?: string;
}

const statusColor = (status?: string): 'success' | 'warning' | 'error' | 'default' => {
  switch ((status || '').toUpperCase()) {
    case 'CONFIRMED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'CANCELLED':
    case 'FAILED':
      return 'error';
    default:
      return 'default';
  }
};

const columns: GridColDef<Booking>[] = [
  { field: 'id', headerName: 'Booking ID', width: 120 },
  { field: 'title', headerName: 'Details', flex: 1, minWidth: 280 },
  { field: 'destination', headerName: 'Destination', width: 170 },
  { field: 'travelerName', headerName: 'Traveler', width: 160 },
  { field: 'type', headerName: 'Type', width: 180, valueFormatter: (v: string) => (v || '').replace(/_/g, ' ') },
  {
    field: 'price',
    headerName: 'Price',
    width: 120,
    type: 'number',
    valueFormatter: (v: number) => (v == null ? '—' : v.toLocaleString(undefined, { minimumFractionDigits: 2 })),
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 130,
    renderCell: (p) => <Chip size="small" label={p.value || 'UNKNOWN'} color={statusColor(p.value)} sx={{ fontWeight: 700 }} />,
  },
  {
    field: 'bookingDate',
    headerName: 'Booked On',
    width: 170,
    valueFormatter: (v: string) => (v ? new Date(v).toLocaleString() : '—'),
  },
];

export const BookingsPage: React.FC = () => {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/admin/bookings/all');
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Could not load bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => [r.id, r.title, r.destination, r.travelerName, r.type, r.status].some((v) => (v || '').toLowerCase().includes(q)));
  }, [rows, query]);

  const totalValue = useMemo(() => rows.reduce((s, r) => s + (r.price || 0), 0), [rows]);
  const confirmed = rows.filter((r) => (r.status || '').toUpperCase() === 'CONFIRMED').length;

  return (
    <Box>
      <PageHeader
        title="Bookings"
        subtitle="Flight, hotel and tour reservations across all travelers."
        breadcrumbs={[{ label: 'Bookings' }]}
        action={
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load} disabled={loading}>
            Refresh
          </Button>
        }
      />

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        The backend endpoint <b>/api/admin/bookings/all</b> currently returns a fixed set of sample records rather than database bookings.
        This page will show live data automatically once that endpoint is connected to the booking store.
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={load}>Retry</Button>}>
          {error}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Bookings', value: rows.length.toLocaleString() },
          { label: 'Confirmed', value: confirmed.toLocaleString() },
          { label: 'Total value', value: totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 }) },
        ].map((k) => (
          <GlassCard key={k.label} sx={{ p: 2.5, flex: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
              {k.label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {loading ? '…' : k.value}
            </Typography>
          </GlassCard>
        ))}
      </Stack>

      <GlassCard sx={{ p: 2 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search by ID, traveler, destination, status…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ mb: 2, maxWidth: 420 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        {!loading && filtered.length === 0 ? (
          <EmptyState title="No bookings found" description={query ? 'No bookings match your search.' : 'There are no bookings to show yet.'} />
        ) : (
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <DataGrid
              rows={filtered}
              columns={columns}
              loading={loading}
              autoHeight
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              sx={{ border: 0, minWidth: 900 }}
            />
          </Box>
        )}
      </GlassCard>
    </Box>
  );
};
