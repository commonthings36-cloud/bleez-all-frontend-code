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
  Tabs,
  Tab,
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
import PublicIcon from '@mui/icons-material/Public';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

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
  const [activeTab, setActiveTab] = useState<number>(0);

  // Destination Emergency Numbers State
  const [countryEmergency, setCountryEmergency] = useState<Record<string, any>>({});
  const [countryLoading, setCountryLoading] = useState<boolean>(false);
  const [countrySearch, setCountrySearch] = useState<string>('');

  const fetchCountryEmergency = () => {
    setCountryLoading(true);
    apiClient
      .get('/emergency/countries')
      .then((res) => {
        if (res.data && res.data.countries) {
          setCountryEmergency(res.data.countries);
        }
      })
      .catch((err) => {
        console.debug('Emergency countries fetch error:', err.message);
      })
      .finally(() => {
        setCountryLoading(false);
      });
  };

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
    fetchCountryEmergency();
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
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{p.row.senderName || 'Traveler'}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{p.row.senderEmail || 'No email'}</Typography>
            {p.row.senderPhone && <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>📞 {p.row.senderPhone}</Typography>}
          </Box>
        </Stack>
      ),
    },
    {
      field: 'note', headerName: 'Alert Note / Message', flex: 1, minWidth: 260,
      renderCell: (p) => {
        const hasMedia = Array.isArray(p.row.mediaUrls) && p.row.mediaUrls.length > 0;
        return (
          <Stack spacing={0.5} sx={{ py: 1, width: '100%' }}>
            <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.45, color: p.row.note ? 'text.primary' : 'text.secondary' }}>
              {p.row.note || 'Emergency SOS Panic Alert triggered'}
            </Typography>
            {hasMedia && (
              <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" sx={{ pt: 0.5 }}>
                {p.row.mediaUrls!.map((url, i) => (
                  <Chip
                    key={i}
                    icon={<PhotoCameraIcon sx={{ fontSize: 13 }} />}
                    label={`Evidence #${i + 1}`}
                    size="small"
                    component="a"
                    href={url}
                    target="_blank"
                    clickable
                    color="warning"
                    variant="outlined"
                    sx={{ fontSize: '0.72rem', height: 22, fontWeight: 700 }}
                  />
                ))}
              </Stack>
            )}
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

  const countryList = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    return Object.entries(countryEmergency)
      .filter(([code]) => code !== 'DEFAULT')
      .map(([code, info]) => ({ code, ...(info as any) }))
      .filter((item) => {
        if (!q) return true;
        return (
          item.code.toLowerCase().includes(q) ||
          (item.country || '').toLowerCase().includes(q) ||
          (item.police || '').includes(q)
        );
      })
      .sort((a, b) => (a.country || a.code).localeCompare(b.country || b.code));
  }, [countryEmergency, countrySearch]);

  return (
    <Box>
      <PageHeader
        title="Live Emergency SOS & Safety Console"
        subtitle="Real-time geotagged distress signals and verified destination emergency response numbers."
        breadcrumbs={[{ label: 'Emergency SOS' }]}
        action={
          <Stack direction="row" spacing={1.5}>
            {activeTab === 0 ? (
              <>
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportCsv} disabled={!rows.length}>
                  Export CSV
                </Button>
                <Button variant="outlined" color="error" startIcon={<RefreshIcon />} onClick={fetchPanicEvents} sx={{ fontWeight: 700 }}>
                  Refresh SOS Stream
                </Button>
              </>
            ) : (
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchCountryEmergency} sx={{ fontWeight: 700 }}>
                Refresh Directory
              </Button>
            )}
          </Stack>
        }
      />

      {/* Mode Tabs */}
      <GlassCard sx={{ p: 1, mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab
            icon={<WarningAmberIcon />}
            iconPosition="start"
            label={`SOS Distress Signals (${totalAlerts} Active)`}
            sx={{ fontWeight: 700, textTransform: 'none' }}
          />
          <Tab
            icon={<PublicIcon />}
            iconPosition="start"
            label={`Destination Emergency Numbers (${Object.keys(countryEmergency).filter((k) => k !== 'DEFAULT').length || 25} Countries)`}
            sx={{ fontWeight: 700, textTransform: 'none' }}
          />
        </Tabs>
      </GlassCard>

      {/* TAB 0: SOS PANIC EVENTS */}
      {activeTab === 0 && (
        <Box sx={{ animation: `${fadeUp} .4s ease-out` }}>
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

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' }, gap: 2 }}>
              <Box sx={{ height: 420, borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
                <SosMap points={points} focusId={focusId} mode={themeMode} />
              </Box>

              <Box sx={{ maxHeight: 420, overflowY: 'auto', pr: 0.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1 }}>
                  Recent incidents ({points.length})
                </Typography>
                <Stack spacing={1}>
                  {points.map((pt) => (
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
      )}

      {/* TAB 1: DESTINATION EMERGENCY NUMBERS DIRECTORY */}
      {activeTab === 1 && (
        <Box sx={{ animation: `${fadeUp} .4s ease-out` }}>
          <GlassCard sx={{ p: 2.5, mb: 3 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={2}
              sx={{ mb: 2.5 }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Global Destination Emergency Numbers Directory
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Verified emergency dispatch hotlines mapped for iOS & Android auto-resolution (Endpoint: <code>/api/emergency/numbers?country=&#123;code&#125;</code>)
                </Typography>
              </Box>
              <TextField
                size="small"
                placeholder="Search country name, code, police dial..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                sx={{ width: { xs: '100%', sm: 320 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                gap: 2,
              }}
            >
              {countryList.map((item) => (
                <GlassCard
                  key={item.code}
                  sx={{
                    p: 2.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '16px',
                    transition: 'all .2s',
                    '&:hover': { transform: 'translateY(-3px)', borderColor: 'primary.main', boxShadow: '0 8px 24px -8px rgba(99,102,241,0.2)' },
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      {item.country || item.code}
                    </Typography>
                    <Chip label={item.code} color="primary" size="small" sx={{ fontWeight: 800 }} />
                  </Stack>

                  <Stack spacing={1.2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocalPoliceIcon fontSize="small" sx={{ color: '#2563EB' }} />
                        <Typography variant="body2" color="text.secondary">Police:</Typography>
                      </Stack>
                      <Chip label={item.police || '112'} size="small" sx={{ fontWeight: 800, bgcolor: 'rgba(37,99,235,0.1)', color: '#2563EB' }} />
                    </Stack>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocalHospitalIcon fontSize="small" sx={{ color: '#10B981' }} />
                        <Typography variant="body2" color="text.secondary">Ambulance:</Typography>
                      </Stack>
                      <Chip label={item.ambulance || '112'} size="small" sx={{ fontWeight: 800, bgcolor: 'rgba(16,185,129,0.1)', color: '#10B981' }} />
                    </Stack>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocalFireDepartmentIcon fontSize="small" sx={{ color: '#F97316' }} />
                        <Typography variant="body2" color="text.secondary">Fire Dept:</Typography>
                      </Stack>
                      <Chip label={item.fire || '112'} size="small" sx={{ fontWeight: 800, bgcolor: 'rgba(249,115,22,0.1)', color: '#F97316' }} />
                    </Stack>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PhoneInTalkIcon fontSize="small" sx={{ color: '#8B5CF6' }} />
                        <Typography variant="body2" color="text.secondary">Tourist Helpline:</Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#8B5CF6' }}>
                        {item.tourist || 'N/A'}
                      </Typography>
                    </Stack>
                  </Stack>
                </GlassCard>
              ))}
            </Box>
          </GlassCard>
        </Box>
      )}
    </Box>
  );
};
