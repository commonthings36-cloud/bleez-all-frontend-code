import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Avatar, Box, Button, Chip, Divider, Drawer, IconButton, InputAdornment, LinearProgress, MenuItem, Select,
  Stack, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography, keyframes, useMediaQuery, useTheme,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CancelIcon from '@mui/icons-material/Cancel';
import PaymentsIcon from '@mui/icons-material/Payments';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import HotelIcon from '@mui/icons-material/Hotel';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TrainIcon from '@mui/icons-material/Train';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { useSnackbar } from 'notistack';
import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { apiClient } from '@/services/apiClient';

interface Booking {
  id: string;
  destination?: string;
  title?: string;
  travelerName?: string;
  travelerEmail?: string;
  reference?: string;
  vendor?: string;
  price?: number;
  type?: string;
  status?: string;
  bookingDate?: string;
}

// The live API and the sample endpoint use different field names; map both onto one shape.
const normalize = (r: any): Booking => {
  const title = r.title || r.name;
  return {
    id: String(r.id ?? r.bookingReference ?? ''),
    title,
    // Some records only carry the place in `title` (e.g. "Paris") — use it as the destination too.
    destination: r.destination || r.city || r.location || r.place || title,
    travelerName: r.travelerName || r.userName || r.fullName || r.user?.name,
    travelerEmail: r.travelerEmail || r.userEmail || r.user?.email,
    reference: r.bookingReference || r.reference,
    vendor: r.vendor || r.provider,
    price: typeof r.price === 'number' ? r.price : typeof r.amount === 'number' ? r.amount : r.totalAmount,
    type: r.type || r.bookingType || r.category,
    status: r.status,
    bookingDate: r.bookingDate || r.createdAt || r.date,
  };
};

type StatusGroup = 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'OTHER';
type StatusFilter = 'all' | StatusGroup;

const fadeUp = keyframes`from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}`;

const statusGroup = (status?: string): StatusGroup => {
  switch ((status || '').toUpperCase()) {
    case 'CONFIRMED':
    case 'COMPLETED':
      return 'CONFIRMED';
    case 'PENDING':
    case 'PROCESSING':
      return 'PENDING';
    case 'CANCELLED':
    case 'CANCELED':
    case 'FAILED':
    case 'REFUNDED':
      return 'CANCELLED';
    default:
      return 'OTHER';
  }
};

const STATUS_COLOR: Record<StatusGroup, string> = {
  CONFIRMED: '#10B981',
  PENDING: '#F59E0B',
  CANCELLED: '#EF4444',
  OTHER: '#94A3B8',
};

const prettyType = (t?: string) =>
  (t || 'Other')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

/** Icon + colour by the kind of booking, matched on keywords so new backend types still look right. */
const typeStyle = (t?: string): { icon: React.ReactElement; color: string } => {
  const k = (t || '').toUpperCase();
  if (k.includes('FLIGHT') || k.includes('AIR')) return { icon: <FlightTakeoffIcon />, color: '#6366F1' };
  if (k.includes('HOTEL') || k.includes('STAY') || k.includes('RESORT')) return { icon: <HotelIcon />, color: '#EC4899' };
  if (k.includes('CAR') || k.includes('CAB') || k.includes('TRANSFER') || k.includes('BUS')) return { icon: <DirectionsCarIcon />, color: '#06B6D4' };
  if (k.includes('TRAIN') || k.includes('RAIL')) return { icon: <TrainIcon />, color: '#F59E0B' };
  if (k.includes('TOUR') || k.includes('PACKAGE') || k.includes('ACTIVITY')) return { icon: <TravelExploreIcon />, color: '#10B981' };
  return { icon: <ConfirmationNumberIcon />, color: '#8B5CF6' };
};

const money = (v?: number) => (v == null ? '—' : v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

const timeAgo = (iso?: string) => {
  if (!iso) return '';
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} d ago`;
  return '';
};

const StatusBadge: React.FC<{ status?: string; size?: 'small' | 'medium' }> = ({ status, size = 'small' }) => {
  const c = STATUS_COLOR[statusGroup(status)];
  return (
    <Chip
      size={size}
      label={(status || 'UNKNOWN').replace(/_/g, ' ')}
      icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c, ml: '8px !important' }} />}
      sx={{ fontWeight: 700, bgcolor: `${c}1f`, color: c, border: `1px solid ${c}55`, '& .MuiChip-label': { px: 1 } }}
    />
  );
};

const TypeTile: React.FC<{ type?: string; size?: number }> = ({ type, size = 40 }) => {
  const s = typeStyle(type);
  return (
    <Box
      sx={{
        width: size, height: size, borderRadius: '12px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', background: `linear-gradient(135deg, ${s.color}, ${s.color}bb)`, boxShadow: `0 8px 18px -10px ${s.color}`,
        '& svg': { fontSize: size * 0.5 },
      }}
    >
      {s.icon}
    </Box>
  );
};

export const BookingsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { enqueueSnackbar } = useSnackbar();

  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [mobileCount, setMobileCount] = useState(10);

  // filters
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [type, setType] = useState('all');
  const [destination, setDestination] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/admin/bookings/all');
      setRows((Array.isArray(res.data) ? res.data : []).map(normalize));
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Could not load bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const types = useMemo(() => Array.from(new Set(rows.map((r) => r.type).filter(Boolean) as string[])).sort(), [rows]);
  const destinations = useMemo(() => Array.from(new Set(rows.map((r) => r.destination).filter(Boolean) as string[])).sort(), [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== 'all' && statusGroup(r.status) !== status) return false;
      if (type !== 'all' && r.type !== type) return false;
      if (destination !== 'all' && r.destination !== destination) return false;
      if (!q) return true;
      return [r.id, r.reference, r.title, r.destination, r.travelerName, r.travelerEmail, r.vendor, r.type, r.status].some((v) => (v || '').toLowerCase().includes(q));
    });
  }, [rows, query, status, type, destination]);

  const filtersActive = status !== 'all' || type !== 'all' || destination !== 'all' || !!query;
  const clearFilters = () => { setQuery(''); setStatus('all'); setType('all'); setDestination('all'); setMobileCount(10); };

  const counts = useMemo(() => {
    const by = (g: StatusGroup) => rows.filter((r) => statusGroup(r.status) === g);
    const confirmed = by('CONFIRMED');
    return {
      total: rows.length,
      confirmed: confirmed.length,
      pending: by('PENDING').length,
      cancelled: by('CANCELLED').length,
      value: confirmed.reduce((s, r) => s + (r.price || 0), 0),
    };
  }, [rows]);

  const byType = useMemo(() => {
    const m = new Map<string, { count: number; value: number }>();
    rows.forEach((r) => {
      const k = r.type || 'OTHER';
      const cur = m.get(k) || { count: 0, value: 0 };
      cur.count += 1;
      cur.value += r.price || 0;
      m.set(k, cur);
    });
    return Array.from(m.entries()).map(([k, v]) => ({ type: k, ...v })).sort((a, b) => b.count - a.count);
  }, [rows]);

  const exportCsv = () => {
    const head = ['Booking ID', 'Details', 'Destination', 'Traveler', 'Type', 'Price', 'Status', 'Booked on'];
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const data = filtered.map((b) => [b.id, b.title, b.destination, b.travelerName, b.type, b.price, b.status, b.bookingDate]);
    const blob = new Blob([[head, ...data].map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bleez-bookings.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const copyId = (id: string) => {
    navigator.clipboard?.writeText(id).then(
      () => enqueueSnackbar('Booking ID copied', { variant: 'success' }),
      () => enqueueSnackbar('Could not copy', { variant: 'error' }),
    );
  };

  const columns: GridColDef<Booking>[] = [
    {
      field: 'title', headerName: 'Booking', flex: 1, minWidth: 300,
      renderCell: (p) => (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, width: '100%' }}>
          <TypeTile type={p.row.type} size={38} />
          <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.4 }}>{p.row.title || prettyType(p.row.type)}</Typography>
            <Typography noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.4, color: 'text.secondary' }}>
              #{(p.row.reference || p.row.id).slice(0, 13)}{p.row.vendor ? ` · ${p.row.vendor}` : ''}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: 'travelerName', headerName: 'Traveler', width: 220,
      renderCell: (p) => {
        const name = p.row.travelerName || p.row.travelerEmail;
        return name ? (
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
            <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontSize: '0.8rem' }}>{name.charAt(0).toUpperCase()}</Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.35 }}>{p.row.travelerName || p.row.travelerEmail}</Typography>
              {p.row.travelerName && p.row.travelerEmail && <Typography noWrap sx={{ fontSize: '0.72rem', color: 'text.secondary', lineHeight: 1.3 }}>{p.row.travelerEmail}</Typography>}
            </Box>
          </Stack>
        ) : <Typography sx={{ fontSize: '0.85rem', color: 'text.disabled' }}>Not available</Typography>;
      },
    },
    {
      field: 'destination', headerName: 'Place', width: 200,
      renderCell: (p) => (
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
          <PlaceOutlinedIcon sx={{ fontSize: 18, color: '#EF4444', flexShrink: 0 }} />
          <Typography noWrap sx={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.4 }}>{p.row.destination || '—'}</Typography>
        </Stack>
      ),
    },
    {
      field: 'type', headerName: 'Type', width: 150,
      renderCell: (p) => {
        const c = typeStyle(p.row.type).color;
        return <Chip size="small" label={prettyType(p.row.type)} sx={{ fontWeight: 700, bgcolor: `${c}1a`, color: c }} />;
      },
    },
    {
      field: 'price', headerName: 'Price', width: 130, type: 'number',
      renderCell: (p) => <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>{money(p.row.price)}</Typography>,
    },
    { field: 'status', headerName: 'Status', width: 150, renderCell: (p) => <StatusBadge status={p.row.status} /> },
    {
      field: 'bookingDate', headerName: 'Booked on', width: 200,
      renderCell: (p) => {
        const d = p.row.bookingDate ? new Date(p.row.bookingDate) : null;
        const ago = timeAgo(p.row.bookingDate);
        return (
          <Box>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.4 }}>{d ? d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.4 }}>{d ? d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : ''}{ago ? ` · ${ago}` : ''}</Typography>
          </Box>
        );
      },
    },
  ];

  const kpis: { label: string; value: string; icon: React.ReactElement; color: string; filter: StatusFilter | null; on: boolean }[] = [
    { label: 'All bookings', value: counts.total.toLocaleString(), icon: <ConfirmationNumberIcon />, color: '#6366F1', filter: 'all', on: false },
    { label: 'Confirmed', value: counts.confirmed.toLocaleString(), icon: <CheckCircleIcon />, color: '#10B981', filter: 'CONFIRMED', on: status === 'CONFIRMED' },
    { label: 'Pending', value: counts.pending.toLocaleString(), icon: <HourglassTopIcon />, color: '#F59E0B', filter: 'PENDING', on: status === 'PENDING' },
    { label: 'Cancelled / failed', value: counts.cancelled.toLocaleString(), icon: <CancelIcon />, color: '#EF4444', filter: 'CANCELLED', on: status === 'CANCELLED' },
    { label: 'Confirmed value', value: money(counts.value), icon: <PaymentsIcon />, color: '#06B6D4', filter: null, on: false },
  ];

  const maxType = Math.max(1, ...byType.map((t) => t.count));

  return (
    <Box>
      <PageHeader
        title="Bookings"
        subtitle="Flights, hotels and tours reserved by travelers. Click a booking to see all its details."
        breadcrumbs={[{ label: 'Bookings' }]}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportCsv} disabled={!filtered.length}>Export CSV</Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load} disabled={loading}>Refresh</Button>
          </Stack>
        }
      />

      <Alert severity="info" variant="outlined" sx={{ mb: 3, borderRadius: 3, alignItems: 'center' }}>
        <b>Sample data.</b> The endpoint <code>/api/admin/bookings/all</code> currently returns a fixed set of sample records. This page shows live bookings automatically once it is connected to the booking store.
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={load}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {/* KPI cards double as quick status filters */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, 1fr)' }, gap: 2, mb: 3 }}>
        {kpis.map((k, i) => (
          <GlassCard
            key={k.label}
            onClick={k.filter ? () => { clearFilters(); if (k.filter !== 'all') setStatus(k.filter as StatusFilter); } : undefined}
            sx={{
              p: 2, position: 'relative', overflow: 'hidden', cursor: k.filter ? 'pointer' : 'default',
              animation: `${fadeUp} .5s ${i * 0.07}s ease-out both`,
              gridColumn: { xs: i === 4 ? 'span 2' : 'auto', md: 'auto' },
              borderColor: k.on ? k.color : undefined,
              boxShadow: k.on ? `0 10px 26px -10px ${k.color}88` : undefined,
              '&:hover': k.filter ? { transform: 'translateY(-4px)', borderColor: k.color } : undefined,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</Typography>
                <Typography variant="h4" noWrap sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>{loading ? '…' : k.value}</Typography>
              </Box>
              <Box sx={{ width: 44, height: 44, borderRadius: '13px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: `linear-gradient(135deg, ${k.color}, ${k.color}bb)`, boxShadow: `0 8px 18px -8px ${k.color}` }}>{k.icon}</Box>
            </Stack>
          </GlassCard>
        ))}
      </Box>

      {/* What is being booked */}
      {byType.length > 0 && (
        <GlassCard sx={{ p: 2.5, mb: 3, animation: `${fadeUp} .6s .3s ease-out both` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>What travelers book</Typography>
            <Typography variant="body2" color="text.secondary">Click a type to filter</Typography>
          </Stack>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, columnGap: 4, rowGap: 1.5 }}>
            {byType.map((t) => {
              const c = typeStyle(t.type).color;
              const on = type === t.type;
              return (
                <Box
                  key={t.type}
                  onClick={() => setType(on ? 'all' : t.type)}
                  sx={{ cursor: 'pointer', p: 1, borderRadius: '12px', border: '1px solid', borderColor: on ? c : 'transparent', transition: 'all .2s', '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <TypeTile type={t.type} size={34} />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{prettyType(t.type)}</Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', fontWeight: 600 }}>{t.count} · {money(t.value)}</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={(t.count / maxType) * 100} sx={{ mt: 0.75, height: 7, borderRadius: 4, bgcolor: `${c}22`, '& .MuiLinearProgress-bar': { bgcolor: c, borderRadius: 4 } }} />
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Box>
        </GlassCard>
      )}

      {/* Filters + list */}
      <GlassCard sx={{ p: 2, animation: `${fadeUp} .6s .4s ease-out both` }}>
        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            size="small" placeholder="Search ID, traveler, destination…" value={query} onChange={(e) => { setQuery(e.target.value); setMobileCount(10); }}
            sx={{ width: { xs: '100%', sm: 300 } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
          <ToggleButtonGroup size="small" exclusive value={status} onChange={(_, v) => v && setStatus(v)} color="primary" sx={{ flexWrap: 'wrap' }}>
            <ToggleButton value="all" sx={{ px: 2, fontWeight: 700 }}>All</ToggleButton>
            <ToggleButton value="CONFIRMED" sx={{ px: 2, fontWeight: 700 }}>Confirmed</ToggleButton>
            <ToggleButton value="PENDING" sx={{ px: 2, fontWeight: 700 }}>Pending</ToggleButton>
            <ToggleButton value="CANCELLED" sx={{ px: 2, fontWeight: 700 }}>Cancelled</ToggleButton>
          </ToggleButtonGroup>
          <Select size="small" value={type} onChange={(e) => setType(e.target.value)} sx={{ minWidth: 150 }}>
            <MenuItem value="all">All types</MenuItem>
            {types.map((t) => <MenuItem key={t} value={t}>{prettyType(t)}</MenuItem>)}
          </Select>
          <Select size="small" value={destination} onChange={(e) => setDestination(e.target.value)} sx={{ minWidth: 170 }}>
            <MenuItem value="all">All destinations</MenuItem>
            {destinations.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </Select>
          {filtersActive && <Button size="small" startIcon={<FilterAltOffIcon />} onClick={clearFilters}>Clear</Button>}
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Showing {filtered.length} of {rows.length}</Typography>
        </Stack>

        {!loading && filtered.length === 0 ? (
          <EmptyState
            icon={<ConfirmationNumberIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5 }} />}
            title="No bookings found"
            description={filtersActive ? 'Nothing matches the current filters.' : 'There are no bookings to show yet.'}
            actionLabel={filtersActive ? 'Clear filters' : undefined}
            onAction={filtersActive ? clearFilters : undefined}
          />
        ) : isMobile ? (
          <Stack spacing={1.5}>
            {filtered.slice(0, mobileCount).map((b) => (
              <Box
                key={b.id}
                onClick={() => setSelected(b)}
                sx={{ p: 1.5, borderRadius: '14px', border: '1px solid', borderColor: 'divider', cursor: 'pointer', transition: 'all .2s', '&:active': { transform: 'scale(.99)' } }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <TypeTile type={b.type} size={42} />
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography noWrap sx={{ fontWeight: 800, fontSize: '0.92rem' }}>{b.title || prettyType(b.type)}</Typography>
                    <Typography noWrap variant="caption" color="text.secondary">{b.travelerName || '—'} · {b.destination || '—'}</Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 800 }}>{money(b.price)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.25 }}>
                  <StatusBadge status={b.status} />
                  <Typography variant="caption" color="text.secondary">{b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : ''}</Typography>
                </Stack>
              </Box>
            ))}
            {filtered.length > mobileCount && <Button onClick={() => setMobileCount((c) => c + 10)}>Show more ({filtered.length - mobileCount} left)</Button>}
          </Stack>
        ) : (
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <DataGrid
              rows={filtered}
              columns={columns}
              loading={loading}
              rowHeight={64}
              autoHeight
              disableRowSelectionOnClick
              onRowClick={(p) => setSelected(p.row as Booking)}
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } }, sorting: { sortModel: [{ field: 'bookingDate', sort: 'desc' }] } }}
              sx={{
                border: 0, minWidth: 1100,
                '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 800 },
                '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center', lineHeight: 1.4 },
                '& .MuiDataGrid-row': { cursor: 'pointer' },
              }}
            />
          </Box>
        )}
      </GlassCard>

      {/* Booking details */}
      <Drawer anchor="right" open={!!selected} onClose={() => setSelected(null)} PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, p: 3 } }}>
        {selected && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: '0.08em' }}>Booking details</Typography>
              <IconButton onClick={() => setSelected(null)} aria-label="Close"><CloseIcon /></IconButton>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <TypeTile type={selected.type} size={56} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.25 }}>{selected.title || prettyType(selected.type)}</Typography>
                <Box sx={{ mt: 0.75 }}><StatusBadge status={selected.status} size="medium" /></Box>
              </Box>
            </Stack>
            <GlassCard sx={{ p: 2, mb: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>{money(selected.price)}</Typography>
            </GlassCard>
            <Stack divider={<Divider flexItem />} spacing={1.5}>
              {[
                { label: 'Traveler', value: selected.travelerName },
                { label: 'Email', value: selected.travelerEmail },
                { label: 'Vendor', value: selected.vendor },
                { label: 'Reference', value: selected.reference },
                { label: 'Place', value: selected.destination },
                { label: 'Type', value: prettyType(selected.type) },
                { label: 'Booked on', value: selected.bookingDate ? new Date(selected.bookingDate).toLocaleString() : undefined },
              ].map((f) => (
                <Stack key={f.label} direction="row" justifyContent="space-between" spacing={2}>
                  <Typography color="text.secondary" sx={{ fontWeight: 600 }}>{f.label}</Typography>
                  <Typography sx={{ fontWeight: 700, textAlign: 'right' }}>{f.value || '—'}</Typography>
                </Stack>
              ))}
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                <Typography color="text.secondary" sx={{ fontWeight: 600 }}>Booking ID</Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography sx={{ fontWeight: 700, fontFamily: 'monospace' }}>{selected.id}</Typography>
                  <Tooltip title="Copy ID"><IconButton size="small" onClick={() => copyId(selected.id)}><ContentCopyIcon fontSize="small" /></IconButton></Tooltip>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};
