import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  Button,
  Avatar,
  Link,
  IconButton,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  keyframes,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import { PageHeader } from '@/components/PageHeader';
import { GlassCard } from '@/components/GlassCard';
import { EmptyState } from '@/components/EmptyState';
import { apiClient } from '@/services/apiClient';
import { useAppSelector } from '@/store/hooks';
import { SosMap, SosPoint } from '../components/SosMap';

interface EmergencyContactInfo {
  name?: string;
  email?: string;
  phone?: string;
}

interface PanicEventRecord {
  id: string;
  senderId?: string;
  senderName?: string;
  senderEmail?: string;
  senderPhone?: string;
  senderPicture?: string;
  recipientCount?: number;
  recipientIds?: string[];
  emergencyContacts?: EmergencyContactInfo[];
  latitude?: number | null;
  longitude?: number | null;
  locationLabel?: string | null;
  googleMapsUrl?: string | null;
  note?: string | null;
  mediaUrls?: string[];
  createdAt?: string | null;
  status?: string;
}

const fadeUp = keyframes`from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}`;
const pulse = keyframes`0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.5)}50%{box-shadow:0 0 0 7px rgba(239,68,68,0)}`;

export const EmergencySosPage: React.FC = () => {
  const [panicEvents, setPanicEvents] = useState<PanicEventRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPanicEvents = () => {
    if (document.hidden) return;
    setLoading(true);
    apiClient
      .get('/emergency/panic-events')
      .then((res) => {
        if (Array.isArray(res.data)) {
          setPanicEvents(res.data);
        }
      })
      .catch((err) => {
        console.debug('Emergency SOS fetch error:', err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPanicEvents();
    const interval = setInterval(fetchPanicEvents, 45000);
    return () => clearInterval(interval);
  }, []);

  const totalAlerts = panicEvents.length;
  const totalEmailsDelivered = panicEvents.reduce(
    (sum, ev) => sum + (typeof ev.recipientCount === 'number' ? ev.recipientCount : 0),
    0
  );
  const geotaggedCount = panicEvents.filter(
    (ev) => (ev.latitude != null && ev.longitude != null) || Boolean(ev.locationLabel)
  ).length;
  const totalMediaFiles = panicEvents.reduce(
    (sum, ev) => sum + (Array.isArray(ev.mediaUrls) ? ev.mediaUrls.length : 0),
    0
  );

  const formatTimestamp = (raw?: string | null) => {
    if (!raw) return '—';
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleString();
  };

  const themeMode = useAppSelector((st) => st.theme.mode);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'geo' | 'media'>('all');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return panicEvents.filter((ev) => {
      if (filter === 'geo' && !(ev.latitude != null && ev.longitude != null)) return false;
      if (filter === 'media' && !(Array.isArray(ev.mediaUrls) && ev.mediaUrls.length)) return false;
      if (!q) return true;
      return [ev.senderName, ev.senderEmail, ev.senderPhone, ev.note, ev.locationLabel, ...(ev.emergencyContacts || []).flatMap((c) => [c.name, c.email, c.phone])]
        .some((v) => (v || '').toLowerCase().includes(q));
    });
  }, [panicEvents, query, filter]);

  const points: SosPoint[] = useMemo(() => {
    const geo = panicEvents.filter((ev) => ev.latitude != null && ev.longitude != null);
    const newest = [...geo].sort((a, b) => +new Date(b.createdAt || 0) - +new Date(a.createdAt || 0)).slice(0, 3).map((e) => e.id);
    return geo.map((ev) => ({
      id: ev.id,
      name: ev.senderName || 'Traveler',
      note: ev.note?.trim() || 'Emergency SOS Panic Button Triggered',
      place: ev.locationLabel || `${ev.latitude!.toFixed(4)}, ${ev.longitude!.toFixed(4)}`,
      time: formatTimestamp(ev.createdAt),
      lat: ev.latitude!,
      lng: ev.longitude!,
      mapsUrl: ev.googleMapsUrl || `https://maps.google.com/?q=${ev.latitude},${ev.longitude}`,
      latest: newest.includes(ev.id),
      ts: +new Date(ev.createdAt || 0),
    }));
  }, [panicEvents]);

  const focus = (id: string) => {
    setFocusId(null);
    setTimeout(() => setFocusId(id), 0);
  };
  const locate = (id: string) => {
    focus(id);
    document.getElementById('sos-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const mapsOf = (ev: PanicEventRecord) =>
    ev.googleMapsUrl || (ev.latitude != null && ev.longitude != null ? `https://maps.google.com/?q=${ev.latitude},${ev.longitude}` : null);

  const exportCsv = () => {
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const head = ['Name', 'Email', 'Phone', 'Note', 'Location', 'Latitude', 'Longitude', 'Maps link', 'Emails sent', 'Contacts', 'Triggered at', 'Status'];
    const data = rows.map((ev) => [ev.senderName, ev.senderEmail, ev.senderPhone, ev.note, ev.locationLabel, ev.latitude, ev.longitude, mapsOf(ev),
      ev.recipientCount, (ev.emergencyContacts || []).map((c) => `${c.name || ''} <${c.email || ''}> ${c.phone || ''}`).join(' | '), ev.createdAt, ev.status || 'SOS DISPATCHED']);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([[head, ...data].map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv' }));
    a.download = 'bleez-sos-incidents.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const lines = (items: (string | undefined)[]) => (
    <Stack spacing={0.4} sx={{ py: 1 }}>
      {items.length === 0 ? <Typography variant="body2" color="text.disabled">—</Typography> : items.map((t, i) => <Typography key={i} variant="body2" sx={{ lineHeight: 1.4 }}>{t || '—'}</Typography>)}
    </Stack>
  );

  const columns: GridColDef<PanicEventRecord>[] = [
    {
      field: 'senderName', headerName: 'Traveler', width: 210,
      renderCell: (p) => (
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ py: 1 }}>
          <Avatar src={p.row.senderPicture || undefined} sx={{ bgcolor: 'error.main', width: 34, height: 34, fontSize: '0.9rem', fontWeight: 700 }}>
            {(p.row.senderName || 'T').charAt(0).toUpperCase()}
          </Avatar>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.row.senderName || 'Traveler'}</Typography>
        </Stack>
      ),
    },
    { field: 'senderEmail', headerName: 'Email', width: 230, valueFormatter: (v: string) => v || '—' },
    { field: 'senderPhone', headerName: 'Phone', width: 150, valueFormatter: (v: string) => v || '—' },
    {
      field: 'note', headerName: 'Distress note', width: 250,
      renderCell: (p) => <Typography variant="body2" sx={{ py: 1, fontWeight: 600 }}>{p.row.note?.trim() || 'Emergency SOS Panic Button Triggered'}</Typography>,
    },
    {
      field: 'mediaUrls', headerName: 'Media', width: 150, sortable: false,
      renderCell: (p) => {
        const m = p.row.mediaUrls || [];
        return m.length === 0 ? <Typography variant="body2" color="text.disabled">No media</Typography> : (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ py: 1 }}>
            {m.map((u, i) => <Chip key={i} icon={<PhotoCameraIcon />} label={`Photo ${i + 1}`} size="small" color="warning" variant="outlined" component="a" href={u} target="_blank" rel="noopener noreferrer" clickable />)}
          </Stack>
        );
      },
    },
    {
      field: 'locationLabel', headerName: 'Location', width: 250,
      renderCell: (p) => <Typography variant="body2" sx={{ py: 1, fontWeight: 600 }}>{p.row.locationLabel || <Box component="span" sx={{ color: 'text.disabled', fontWeight: 400 }}>Not provided</Box>}</Typography>,
    },
    {
      field: 'coords', headerName: 'GPS coordinates', width: 170, sortable: false,
      valueGetter: (_v, r) => (r.latitude != null && r.longitude != null ? `${r.latitude.toFixed(5)}, ${r.longitude.toFixed(5)}` : ''),
      renderCell: (p) => (p.value ? <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{p.value as string}</Typography> : <Typography variant="body2" color="text.disabled">—</Typography>),
    },
    {
      field: 'map', headerName: 'Map', width: 150, sortable: false,
      renderCell: (p) => {
        const u = mapsOf(p.row);
        return u ? (
          <Link href={u} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: '0.82rem', fontWeight: 700 }}>
            Open in Maps <OpenInNewIcon sx={{ fontSize: 14 }} />
          </Link>
        ) : <Typography variant="body2" color="text.disabled">—</Typography>;
      },
    },
    {
      field: 'locate', headerName: 'On map', width: 90, sortable: false, align: 'center', headerAlign: 'center',
      renderCell: (p) => (
        <IconButton size="small" color="error" disabled={p.row.latitude == null || p.row.longitude == null} onClick={() => locate(p.row.id)} aria-label="Show on map">
          <MyLocationIcon fontSize="small" />
        </IconButton>
      ),
    },
    {
      field: 'recipientCount', headerName: 'Emails sent', width: 130,
      renderCell: (p) => <Chip icon={<MarkEmailReadIcon />} size="small" color={p.row.recipientCount ? 'success' : 'default'} label={p.row.recipientCount ?? 0} sx={{ fontWeight: 700 }} />,
    },
    { field: 'cName', headerName: 'Contact name', width: 190, sortable: false, renderCell: (p) => lines((p.row.emergencyContacts || []).map((c) => c.name || 'Contact')) },
    { field: 'cEmail', headerName: 'Contact email', width: 250, sortable: false, renderCell: (p) => lines((p.row.emergencyContacts || []).map((c) => c.email)) },
    { field: 'cPhone', headerName: 'Contact phone', width: 160, sortable: false, renderCell: (p) => lines((p.row.emergencyContacts || []).map((c) => c.phone)) },
    {
      field: 'createdAt', headerName: 'Date', width: 120,
      valueFormatter: (v: string) => (v && !isNaN(new Date(v).getTime()) ? new Date(v).toLocaleDateString() : '—'),
    },
    {
      field: 'time', headerName: 'Time', width: 120,
      valueGetter: (_v, r) => (r.createdAt && !isNaN(new Date(r.createdAt).getTime()) ? new Date(r.createdAt).toLocaleTimeString() : '—'),
    },
    {
      field: 'status', headerName: 'Status', width: 150,
      renderCell: (p) => <Chip label={p.row.status || 'SOS DISPATCHED'} color="error" size="small" sx={{ fontWeight: 800 }} />,
    },
  ];

  const kpis = [
    { label: 'Total SOS Alerts', value: totalAlerts, sub: 'Live panic triggers', color: '#EF4444', icon: <WarningAmberIcon />, hot: totalAlerts > 0 },
    { label: 'Emergency Emails Sent', value: totalEmailsDelivered, sub: 'Delivered to trusted contacts', color: '#10B981', icon: <MarkEmailReadIcon /> },
    { label: 'Geotagged Signals', value: geotaggedCount, sub: 'With GPS / location', color: '#6366F1', icon: <MyLocationIcon /> },
    { label: 'SOS Media Evidence', value: totalMediaFiles, sub: 'Photos attached', color: '#F59E0B', icon: <PhotoCameraIcon /> },
  ];

  return (
    <Box>
      <PageHeader
        title="Live Emergency SOS Console"
        subtitle="Real-time geotagged panic distress signals, traveler details, and emergency contact email dispatches."
        breadcrumbs={[{ label: 'Emergency SOS' }]}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportCsv} disabled={!rows.length}>Export CSV</Button>
            <Button variant="outlined" color="error" startIcon={<RefreshIcon />} onClick={fetchPanicEvents} sx={{ fontWeight: 700 }}>Refresh SOS Stream</Button>
          </Stack>
        }
      />

      {/* 4 equal KPI cards in one row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2.5, mb: 3.5 }}>
        {kpis.map((k, i) => (
          <GlassCard
            key={k.label}
            sx={{
              p: 2.5, height: 128, display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden',
              animation: `${fadeUp} .5s ${i * 0.08}s ease-out both`,
              borderColor: k.hot ? k.color : undefined,
              '&:hover': { transform: 'translateY(-4px)', borderColor: k.color, boxShadow: `0 14px 30px -12px ${k.color}77` },
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ width: '100%' }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>{k.label}</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: k.color, lineHeight: 1.25, letterSpacing: '-0.02em' }}>{k.value}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{k.sub}</Typography>
              </Box>
              <Box sx={{ width: 50, height: 50, borderRadius: '15px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: `linear-gradient(135deg, ${k.color}, ${k.color}bb)`, boxShadow: `0 10px 20px -8px ${k.color}`, animation: k.hot ? `${pulse} 2s infinite` : 'none' }}>
                {k.icon}
              </Box>
            </Stack>
          </GlassCard>
        ))}
      </Box>

      {/* SOS map */}
      <GlassCard id="sos-map" sx={{ p: 2.5, mb: 3.5, animation: `${fadeUp} .6s .3s ease-out both` }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>SOS Incident Map</Typography>
            <Typography variant="body2" color="text.secondary">
              <Box component="span" sx={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', bgcolor: '#EF4444', mr: 0.75 }} />
              Pulsing red = most recent alerts · lighter red = earlier incidents
            </Typography>
          </Box>
          <Chip label={`${points.length} on map`} size="small" sx={{ fontWeight: 700 }} />
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 320px' }, gap: 2 }}>
          <SosMap points={points} mode={themeMode} focusId={focusId} height={440} />
          <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: 440 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', mb: 1 }}>Incidents</Typography>
            <Stack spacing={1} sx={{ overflowY: 'auto', pr: 0.5 }}>
              {points.length === 0 && <Typography variant="body2" color="text.secondary">No geotagged incidents yet.</Typography>}
              {[...points].sort((a, b) => (b.ts || 0) - (a.ts || 0)).map((pt) => (
                <Box
                  key={pt.id}
                  onClick={() => focus(pt.id)}
                  sx={{ p: 1.25, borderRadius: '12px', cursor: 'pointer', border: '1px solid', borderColor: 'divider', borderLeft: '3px solid #EF4444', transition: 'all .2s', '&:hover': { transform: 'translateX(4px)', bgcolor: 'action.hover' } }}
                >
                  <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{pt.name}</Typography>
                  <Typography noWrap variant="caption" color="text.secondary" sx={{ display: 'block' }}>📍 {pt.place}</Typography>
                  <Typography variant="caption" color="text.secondary">🕒 {pt.time}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </GlassCard>

      <GlassCard sx={{ p: 2.5, animation: `${fadeUp} .6s .35s ease-out both` }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 2.5 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Active SOS Panic Command Center</Typography>
            <Typography variant="body2" color="text.secondary">24/7 geotagged distress signals triggered from the mobile and web apps</Typography>
          </Box>
          <Chip label={`${totalAlerts} Incident${totalAlerts === 1 ? '' : 's'} Recorded`} color={totalAlerts > 0 ? 'error' : 'default'} sx={{ fontWeight: 700 }} />
        </Stack>

        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            size="small" placeholder="Search traveler, note, location, contact…" value={query} onChange={(e) => setQuery(e.target.value)}
            sx={{ width: { xs: '100%', sm: 340 } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
          <ToggleButtonGroup size="small" exclusive value={filter} onChange={(_, v) => v && setFilter(v)} color="error">
            <ToggleButton value="all" sx={{ px: 2, fontWeight: 700 }}>All</ToggleButton>
            <ToggleButton value="geo" sx={{ px: 2, fontWeight: 700 }}>With GPS</ToggleButton>
            <ToggleButton value="media" sx={{ px: 2, fontWeight: 700 }}>With media</ToggleButton>
          </ToggleButtonGroup>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Showing {rows.length} of {totalAlerts}</Typography>
        </Stack>

        {!loading && rows.length === 0 ? (
          <EmptyState
            title={panicEvents.length === 0 ? 'No SOS Panic Alerts Recorded' : 'No incidents match your filters'}
            description={panicEvents.length === 0 ? 'When a user triggers an SOS Panic Alert, their live GPS location, note, and notified emergency contacts will appear here immediately.' : 'Try clearing the search or filter.'}
          />
        ) : (
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading && panicEvents.length === 0}
              getRowHeight={() => 'auto'}
              autoHeight
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } }, sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] } }}
              sx={{
                border: 0, minWidth: 1100,
                '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 800 },
                '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center', whiteSpace: 'normal' },
                '& .MuiDataGrid-row:hover': { bgcolor: 'rgba(239,68,68,.05)' },
              }}
            />
          </Box>
        )}
      </GlassCard>
    </Box>
  );
};
