import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Chip, IconButton, InputAdornment, LinearProgress, Stack, Tab, Tabs, TextField, Tooltip,
  Typography, keyframes,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import HotelIcon from '@mui/icons-material/Hotel';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PaymentsIcon from '@mui/icons-material/Payments';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import { useSnackbar } from 'notistack';
import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { apiClient } from '@/services/apiClient';

/**
 * WHERE THE DATA HITS
 * Each booking kind has exactly one admin endpoint. Change a path here if the backend names it differently.
 * Every endpoint must return a JSON array (a `{ data: [] }` / `{ content: [] }` wrapper is also accepted).
 */
type Kind = 'flight' | 'hotel' | 'restaurant';

const KINDS: Record<Kind, { label: string; endpoint: string; color: string; icon: React.ReactElement<{ fontSize?: 'small' }>; placeLabel: string; detailLabel: string }> = {
  flight: {
    label: 'Flights', endpoint: '/admin/bookings/flights', color: '#2563EB', icon: <FlightTakeoffIcon />,
    placeLabel: 'Route', detailLabel: 'Flight',
  },
  hotel: {
    label: 'Hotels', endpoint: '/admin/bookings/hotels', color: '#7C3AED', icon: <HotelIcon />,
    placeLabel: 'City', detailLabel: 'Hotel',
  },
  restaurant: {
    label: 'Restaurants', endpoint: '/admin/bookings/restaurants', color: '#F97316', icon: <RestaurantIcon />,
    placeLabel: 'City', detailLabel: 'Restaurant',
  },
};
const KIND_ORDER: Kind[] = ['flight', 'hotel', 'restaurant'];

interface TravelBooking {
  id: string;
  kind: Kind;
  reference: string;
  title: string; // airline+flight no / hotel name / restaurant name
  place: string; // "DEL → BOM" / city
  detail: string; // second line: dates, guests, cuisine
  travelerName: string;
  travelerEmail: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  isPromo: boolean; // the ₹1 flight offer
}

const pick = (r: any, ...keys: string[]) => {
  for (const k of keys) if (r?.[k] !== undefined && r?.[k] !== null && r?.[k] !== '') return r[k];
  return undefined;
};

const toList = (data: any): any[] =>
  Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.content) ? data.content : [];

const fmtDate = (v?: string) => {
  if (!v) return '';
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
};

const normalize = (kind: Kind, r: any): TravelBooking => {
  const amount = Number(pick(r, 'amount', 'totalAmount', 'price', 'totalPrice', 'fare') ?? 0) || 0;
  const currency = String(pick(r, 'currency') || 'INR');
  let place = '';
  let title = '';
  let detail = '';
  if (kind === 'flight') {
    const from = pick(r, 'origin', 'from', 'source', 'departureCity', 'departureAirport');
    const to = pick(r, 'destination', 'to', 'arrivalCity', 'arrivalAirport');
    place = [from, to].filter(Boolean).join(' → ');
    title = pick(r, 'airline', 'airlineName', 'title') || 'Flight';
    const no = pick(r, 'flightNumber', 'flightNo');
    detail = [no, fmtDate(pick(r, 'departureDate', 'departureTime', 'travelDate'))].filter(Boolean).join(' · ');
  } else if (kind === 'hotel') {
    place = pick(r, 'city', 'destination', 'location') || '';
    title = pick(r, 'hotelName', 'name', 'title') || 'Hotel';
    const ci = fmtDate(pick(r, 'checkIn', 'check_in', 'checkInDate'));
    const co = fmtDate(pick(r, 'checkOut', 'check_out', 'checkOutDate'));
    const guests = pick(r, 'guests', 'adults');
    detail = [ci && co ? `${ci} – ${co}` : ci, guests ? `${guests} guests` : ''].filter(Boolean).join(' · ');
  } else {
    place = pick(r, 'city', 'destination', 'location') || '';
    title = pick(r, 'restaurantName', 'name', 'title') || 'Restaurant';
    const when = pick(r, 'reservationTime', 'bookingTime', 'date', 'reservationDate');
    const party = pick(r, 'partySize', 'guests', 'people');
    detail = [pick(r, 'cuisine'), when ? fmtDate(when) : '', party ? `Table for ${party}` : ''].filter(Boolean).join(' · ');
  }
  const id = String(pick(r, 'id', '_id', 'bookingId') ?? Math.random().toString(36).slice(2));
  return {
    id,
    kind,
    reference: String(pick(r, 'bookingReference', 'reference', 'pnr', 'confirmationCode') ?? id),
    title,
    place,
    detail,
    travelerName: pick(r, 'userName', 'travelerName', 'customerName', 'name_user') || '',
    travelerEmail: pick(r, 'userEmail', 'travelerEmail', 'email') || '',
    amount,
    currency,
    status: String(pick(r, 'status', 'bookingStatus') || 'PENDING').toUpperCase(),
    createdAt: String(pick(r, 'createdAt', 'bookingDate', 'created_at') || ''),
    isPromo: kind === 'flight' && (r?.promo === true || r?.isPromo === true || (currency === 'INR' && amount > 0 && amount <= 1)),
  };
};

const money = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : undefined, { style: 'currency', currency, maximumFractionDigits: amount < 10 ? 2 : 0 }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

const statusColor = (s: string) => (s.includes('CONFIRM') || s === 'PAID' || s === 'COMPLETED' ? '#16A34A' : s.includes('CANCEL') || s === 'FAILED' ? '#DC2626' : '#D97706');

const fadeUp = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}`;

interface KindState {
  rows: TravelBooking[];
  /** null = loaded ok, string = reason it could not be loaded (e.g. endpoint not live yet) */
  error: string | null;
}

export const TravelBookingsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [tab, setTab] = useState<Kind>('flight');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Record<Kind, KindState>>({
    flight: { rows: [], error: null },
    hotel: { rows: [], error: null },
    restaurant: { rows: [], error: null },
  });

  const load = useCallback(async () => {
    setLoading(true);
    const results = await Promise.allSettled(KIND_ORDER.map((k) => apiClient.get(KINDS[k].endpoint)));
    const next = {} as Record<Kind, KindState>;
    results.forEach((res, i) => {
      const k = KIND_ORDER[i];
      if (res.status === 'fulfilled') {
        next[k] = { rows: toList(res.value.data).map((r) => normalize(k, r)), error: null };
      } else {
        const status = (res.reason as any)?.response?.status;
        next[k] = {
          rows: [],
          error: status === 404 || status === 405 ? 'Endpoint is not live on the backend yet.' : (res.reason as any)?.response?.data?.message || 'Could not reach the server.',
        };
      }
    });
    setData(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const current = data[tab];
  const meta = KINDS[tab];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return current.rows;
    return current.rows.filter((r) => [r.reference, r.title, r.place, r.detail, r.travelerName, r.travelerEmail, r.status].some((v) => (v || '').toLowerCase().includes(q)));
  }, [current.rows, query]);

  const stats = (k: Kind) => {
    const rows = data[k].rows;
    const confirmed = rows.filter((r) => r.status.includes('CONFIRM') || r.status === 'PAID' || r.status === 'COMPLETED').length;
    const byCur = new Map<string, number>();
    rows.forEach((r) => byCur.set(r.currency, (byCur.get(r.currency) || 0) + r.amount));
    const revenue = Array.from(byCur.entries()).map(([c, v]) => money(v, c)).join(' + ') || '—';
    return { count: rows.length, confirmed, revenue };
  };

  const exportCsv = () => {
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const head = ['Reference', meta.detailLabel, meta.placeLabel, 'Details', 'Traveler', 'Email', 'Amount', 'Currency', 'Status', 'Created'];
    const body = filtered.map((b) => [b.reference, b.title, b.place, b.detail, b.travelerName, b.travelerEmail, b.amount, b.currency, b.status, b.createdAt]);
    const blob = new Blob([[head, ...body].map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${tab}-bookings.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const columns: GridColDef<TravelBooking>[] = [
    {
      field: 'title', headerName: meta.detailLabel, flex: 1.3, minWidth: 240,
      renderCell: (p) => (
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ height: '100%', minWidth: 0 }}>
          <Box sx={{ width: 38, height: 38, borderRadius: '11px', flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor: `${meta.color}1a`, color: meta.color }}>
            {React.cloneElement(meta.icon, { fontSize: 'small' })}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.4 }}>{p.row.title}</Typography>
            <Typography noWrap color="text.secondary" sx={{ fontSize: '0.78rem', lineHeight: 1.4 }}>{p.row.detail || '—'}</Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: 'place', headerName: meta.placeLabel, flex: 0.8, minWidth: 150,
      renderCell: (p) => <Typography noWrap sx={{ fontSize: '0.88rem', lineHeight: 1.4, fontWeight: 600 }}>{p.row.place || '—'}</Typography>,
    },
    {
      field: 'travelerName', headerName: 'Traveler', flex: 0.9, minWidth: 190,
      renderCell: (p) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography noWrap sx={{ fontWeight: 600, fontSize: '0.88rem', lineHeight: 1.4 }}>{p.row.travelerName || 'Guest'}</Typography>
          <Typography noWrap color="text.secondary" sx={{ fontSize: '0.76rem', lineHeight: 1.4 }}>{p.row.travelerEmail || '—'}</Typography>
        </Box>
      ),
    },
    {
      field: 'amount', headerName: 'Amount', width: 150, type: 'number', headerAlign: 'left', align: 'left',
      renderCell: (p) => (
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ height: '100%' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.4 }}>{money(p.row.amount, p.row.currency)}</Typography>
          {p.row.isPromo && <Chip size="small" label="₹1 deal" sx={{ height: 22, borderRadius: '6px', fontWeight: 800, fontSize: '0.68rem', bgcolor: '#FEF3C7', color: '#B45309' }} />}
        </Stack>
      ),
    },
    {
      field: 'status', headerName: 'Status', width: 140,
      renderCell: (p) => {
        const c = statusColor(p.row.status);
        return <Chip size="small" label={p.row.status} sx={{ alignSelf: 'center', height: 26, borderRadius: '8px', fontWeight: 700, fontSize: '0.72rem', bgcolor: `${c}1a`, color: c }} />;
      },
    },
    {
      field: 'reference', headerName: 'Reference', width: 170,
      renderCell: (p) => (
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ height: '100%' }}>
          <Typography noWrap sx={{ fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: 1.4 }}>{p.row.reference.slice(0, 12)}</Typography>
          <Tooltip title="Copy">
            <IconButton size="small" onClick={() => { navigator.clipboard?.writeText(p.row.reference); enqueueSnackbar('Reference copied', { variant: 'success' }); }}>
              <ContentCopyIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
    {
      field: 'createdAt', headerName: 'Booked on', width: 130,
      renderCell: (p) => <Typography noWrap sx={{ fontSize: '0.84rem', lineHeight: 1.4 }}>{fmtDate(p.row.createdAt) || '—'}</Typography>,
    },
  ];

  const totalAll = KIND_ORDER.reduce((n, k) => n + data[k].rows.length, 0);
  const liveCount = KIND_ORDER.filter((k) => !data[k].error).length;

  return (
    <Box>
      <PageHeader
        title="Travel Bookings"
        subtitle="Flights (incl. the ₹1 offer), hotels and restaurant reservations made through Bleez"
        breadcrumbs={[{ label: 'Customers' }, { label: 'Travel Bookings' }]}
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportCsv} disabled={!filtered.length}>Export CSV</Button>
            <Button variant="contained" startIcon={<RefreshIcon />} onClick={load} disabled={loading}>Refresh</Button>
          </Stack>
        }
      />

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* KPI row: one card per booking kind, all equal height */}
      <Box sx={{ display: 'grid', gap: 2, mb: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(4,1fr)' } }}>
        {KIND_ORDER.map((k, i) => {
          const m = KINDS[k];
          const s = stats(k);
          const on = tab === k;
          return (
            <GlassCard
              key={k}
              onClick={() => setTab(k)}
              sx={{
                p: 2.5, height: 132, cursor: 'pointer', position: 'relative', overflow: 'hidden',
                animation: `${fadeUp} .45s ease ${i * 0.07}s both`,
                outline: on ? `2px solid ${m.color}` : '2px solid transparent',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>{m.label}</Typography>
                  <Typography sx={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.25 }}>{data[k].error ? '—' : s.count}</Typography>
                </Box>
                <Box sx={{ width: 42, height: 42, borderRadius: '12px', display: 'grid', placeItems: 'center', bgcolor: `${m.color}1a`, color: m.color }}>{m.icon}</Box>
              </Stack>
              <Typography noWrap color="text.secondary" sx={{ fontSize: '0.8rem', mt: 0.5 }}>
                {data[k].error ? 'Waiting for backend' : `${s.confirmed} confirmed · ${s.revenue}`}
              </Typography>
            </GlassCard>
          );
        })}
        <GlassCard sx={{ p: 2.5, height: 132, animation: `${fadeUp} .45s ease .21s both` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography color="text.secondary" sx={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>All bookings</Typography>
              <Typography sx={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.25 }}>{totalAll}</Typography>
            </Box>
            <Box sx={{ width: 42, height: 42, borderRadius: '12px', display: 'grid', placeItems: 'center', bgcolor: '#16A34A1a', color: '#16A34A' }}><PaymentsIcon /></Box>
          </Stack>
          <Typography noWrap color="text.secondary" sx={{ fontSize: '0.8rem', mt: 0.5 }}>{liveCount} of 3 feeds connected</Typography>
        </GlassCard>
      </Box>

      <GlassCard sx={{ animation: `${fadeUp} .5s ease .25s both` }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent="space-between" sx={{ px: 2.5, pt: 1.5 }}>
          <Tabs value={tab} onChange={(_, v) => { setTab(v); setQuery(''); }} sx={{ minHeight: 44 }}>
            {KIND_ORDER.map((k) => (
              <Tab key={k} value={k} icon={React.cloneElement(KINDS[k].icon, { fontSize: 'small' })} iconPosition="start" label={KINDS[k].label} sx={{ minHeight: 44, fontWeight: 700, textTransform: 'none' }} />
            ))}
          </Tabs>
          <TextField
            size="small"
            placeholder={`Search ${meta.label.toLowerCase()}…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            sx={{ minWidth: { md: 280 } }}
          />
        </Stack>

        <Box sx={{ p: 2.5, pt: 1.5 }}>
          {current.error ? (
            <Box>
              <EmptyState
                icon={<CloudOffIcon />}
                title={`${meta.label} feed not connected`}
                description={current.error}
                actionLabel="Retry"
                onAction={load}
              />
              <Alert severity="info" icon={<ConfirmationNumberIcon />} sx={{ mt: 1, borderRadius: '14px' }}>
                This tab reads <b style={{ fontFamily: 'monospace' }}>GET {apiClient.defaults.baseURL}{meta.endpoint}</b>. As soon as the backend
                returns a JSON array there, the bookings appear here automatically.
              </Alert>
            </Box>
          ) : filtered.length === 0 && !loading ? (
            <EmptyState icon={<CheckCircleIcon />} title={`No ${meta.label.toLowerCase()} bookings yet`} description={query ? 'Nothing matches your search.' : 'New bookings will show up here the moment users make them.'} />
          ) : (
            <DataGrid
              rows={filtered}
              columns={columns}
              loading={loading}
              disableRowSelectionOnClick
              rowHeight={64}
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              autoHeight
              sx={{ border: 0 }}
            />
          )}
        </Box>
      </GlassCard>
    </Box>
  );
};
