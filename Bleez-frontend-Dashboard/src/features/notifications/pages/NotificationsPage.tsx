import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box, Button, Chip, CircularProgress, IconButton, InputAdornment, Stack, TextField, ToggleButton, ToggleButtonGroup,
  Tooltip, Typography, keyframes,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import RefreshIcon from '@mui/icons-material/Refresh';
import CampaignIcon from '@mui/icons-material/Campaign';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import { PageHeader } from '@/components/PageHeader';
import { GlassCard } from '@/components/GlassCard';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DangerConfirmDialog } from '@/components/DangerConfirmDialog';
import { apiClient } from '@/services/apiClient';

type Kind = 'CAMPAIGN' | 'SMTP_SOS' | 'ADVISORY';
type Filter = 'ALL' | Kind;

interface Dispatch {
  id: string;
  kind: Kind;
  title: string;
  subtitle?: string;
  message?: string;
  recipients: number;
  contacts: any[];
  location?: string | null;
  createdAt?: string | null;
  status?: string;
}

const KIND: Record<Kind, { label: string; color: string; grad: string; icon: React.ReactElement }> = {
  CAMPAIGN: { label: 'Campaign', color: '#7C3AED', grad: 'linear-gradient(135deg,#7C3AED,#6366F1)', icon: <CampaignIcon /> },
  SMTP_SOS: { label: 'Emergency SOS', color: '#EF4444', grad: 'linear-gradient(135deg,#EF4444,#F97316)', icon: <MarkEmailReadIcon /> },
  ADVISORY: { label: 'Travel advisory', color: '#F59E0B', grad: 'linear-gradient(135deg,#F59E0B,#FBBF24)', icon: <WarningAmberIcon /> },
};

const fadeUp = keyframes`from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}`;

const timeAgo = (iso?: string | null) => {
  if (!iso) return '';
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} d ago`;
  return new Date(iso).toLocaleDateString();
};

const dayLabel = (iso?: string | null) => {
  if (!iso) return 'Undated';
  const d = new Date(iso);
  const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((start(new Date()) - start(d)) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return 'This week';
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
};

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const [deleteDialogItem, setDeleteDialogItem] = useState<Dispatch | null>(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);

  const handleDeleteItem = async () => {
    if (!deleteDialogItem) return;
    try {
      if (deleteDialogItem.kind === 'SMTP_SOS') {
        await apiClient.delete(`/emergency/panic-events/${deleteDialogItem.id}`);
      } else {
        await apiClient.delete(`/intelligence/notifications/${deleteDialogItem.id}`);
      }
      enqueueSnackbar('Dispatch record deleted successfully.', { variant: 'success' });
      setItems((prev) => prev.filter((d) => !(d.id === deleteDialogItem.id && d.kind === deleteDialogItem.kind)));
      setDeleteDialogItem(null);
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message || 'Failed to delete dispatch log', { variant: 'error' });
    }
  };

  const handleClearAll = async () => {
    try {
      await Promise.allSettled([
        apiClient.delete('/emergency/panic-events/all'),
        apiClient.delete('/intelligence/notifications/all'),
      ]);
      enqueueSnackbar('All dispatch and notification logs cleared.', { variant: 'success' });
      setItems([]);
      setClearAllOpen(false);
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message || 'Failed to clear notifications', { variant: 'error' });
    }
  };

  const load = useCallback(() => {
    setLoading(true);
    Promise.allSettled([
      apiClient.get('/emergency/panic-events'),
      apiClient.get('/alerts/all'),
      apiClient.get('/admin/campaigns'),
    ])
      .then(([panicRes, alertsRes, campaignsRes]) => {
        const sos: Dispatch[] =
          panicRes.status === 'fulfilled' && Array.isArray(panicRes.value.data)
            ? panicRes.value.data.map((ev: any) => ({
                id: String(ev.id),
                kind: 'SMTP_SOS' as Kind,
                title: `SOS from ${ev.senderName || 'Traveler'}`,
                subtitle: ev.senderEmail || '',
                message: ev.note || 'Emergency assistance signal dispatched to trusted contacts.',
                recipients: Number(ev.recipientCount ?? 0),
                contacts: ev.emergencyContacts || [],
                location: ev.locationLabel || (ev.latitude != null && ev.longitude != null ? `${ev.latitude}, ${ev.longitude}` : null),
                createdAt: ev.createdAt,
              }))
            : [];

        const advisories: Dispatch[] =
          alertsRes.status === 'fulfilled'
            ? (Array.isArray(alertsRes.value.data) ? alertsRes.value.data : alertsRes.value.data?.alerts || []).map((a: any, i: number) => ({
                id: String(a.id || `alert-${i}`),
                kind: 'ADVISORY' as Kind,
                title: a.title || a.type || 'Travel advisory',
                subtitle: a.country || '',
                message: a.description || a.message || '',
                recipients: 0,
                contacts: [],
                location: a.country || null,
                createdAt: a.timestamp || a.createdAt || null,
              }))
            : [];

        const campaigns: Dispatch[] =
          campaignsRes.status === 'fulfilled' && Array.isArray(campaignsRes.value.data)
            ? campaignsRes.value.data.map((c: any) => ({
                id: String(c.id),
                kind: 'CAMPAIGN' as Kind,
                title: c.name || 'Untitled campaign',
                subtitle: `${String(c.audienceScope || 'ALL_USERS').replace(/_/g, ' ').toLowerCase()} · priority ${c.priority ?? 8}/10`,
                message: c.objective || (c.messageTemplate ? `“${c.messageTemplate}”` : 'Campaign announcement for travellers.'),
                recipients: Number(c.metrics?.deliveredCount ?? c.metrics?.delivered_count ?? c.targetEstimate ?? 0),
                contacts: [],
                location: c.targetCountries?.length ? c.targetCountries.join(', ') : 'Global',
                createdAt: c.createdAt || c.updatedAt,
                status: c.status,
              }))
            : [];

        setItems(
          [...sos, ...campaigns, ...advisories].sort(
            (a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0)
          )
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const count = (k: Kind) => items.filter((i) => i.kind === k).length;
  const delivered = items.filter((i) => i.kind === 'CAMPAIGN').reduce((n, i) => n + i.recipients, 0);

  const kpis = [
    { label: 'All notifications', value: items.length, color: '#6366F1', icon: <NotificationsActiveIcon />, f: 'ALL' as Filter },
    { label: 'Campaigns', value: count('CAMPAIGN'), color: KIND.CAMPAIGN.color, icon: KIND.CAMPAIGN.icon, f: 'CAMPAIGN' as Filter },
    { label: 'Emergency SOS', value: count('SMTP_SOS'), color: KIND.SMTP_SOS.color, icon: KIND.SMTP_SOS.icon, f: 'SMTP_SOS' as Filter },
    { label: 'Advisories', value: count('ADVISORY'), color: KIND.ADVISORY.color, icon: KIND.ADVISORY.icon, f: 'ADVISORY' as Filter },
  ];

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => (filter === 'ALL' || i.kind === filter) && (!q || [i.title, i.subtitle, i.message, i.location].some((v) => (v || '').toLowerCase().includes(q))));
  }, [items, filter, query]);

  const groups = useMemo(() => {
    const m = new Map<string, Dispatch[]>();
    shown.forEach((i) => { const k = dayLabel(i.createdAt); m.set(k, [...(m.get(k) || []), i]); });
    return Array.from(m.entries());
  }, [shown]);

  return (
    <Box>
      <PageHeader
        title="Notification Center"
        subtitle="Campaign broadcasts, emergency SOS dispatches and travel advisories in one timeline."
        breadcrumbs={[{ label: 'Notification Center' }]}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<CampaignIcon />} onClick={() => navigate('/campaigns')} sx={{ fontWeight: 700 }}>Open campaigns</Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load} disabled={loading} sx={{ fontWeight: 700 }}>Refresh</Button>
            <Button variant="contained" color="error" startIcon={<DeleteForeverIcon />} onClick={() => setClearAllOpen(true)} disabled={items.length === 0} sx={{ fontWeight: 700 }}>Purge All Logs</Button>
          </Stack>
        }
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        {kpis.map((k, i) => {
          const on = filter === k.f && k.f !== 'ALL';
          return (
            <GlassCard
              key={k.label}
              onClick={() => setFilter(k.f)}
              sx={{
                p: 2, height: 112, cursor: 'pointer', position: 'relative', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                animation: `${fadeUp} .5s ${i * 0.07}s ease-out both`,
                borderColor: on ? k.color : undefined,
                '&::before': { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: k.color },
                '&:hover': { transform: 'translateY(-4px)', borderColor: k.color },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', pt: 0.5 }}>{k.label}</Typography>
                <Box sx={{ width: 36, height: 36, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: `linear-gradient(135deg, ${k.color}, ${k.color}bb)`, '& svg': { fontSize: 20 } }}>{k.icon}</Box>
              </Stack>
              <Typography sx={{ fontWeight: 800, fontSize: '1.8rem', lineHeight: 1, letterSpacing: '-0.02em' }}>{loading ? '…' : k.value.toLocaleString()}</Typography>
            </GlassCard>
          );
        })}
      </Box>

      <GlassCard sx={{ p: 2.5, animation: `${fadeUp} .6s .3s ease-out both` }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }} sx={{ mb: 2.5 }}>
          <TextField
            size="small" placeholder="Search title, message or location…" value={query} onChange={(e) => setQuery(e.target.value)}
            sx={{ width: { xs: '100%', md: 320 } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
          <ToggleButtonGroup size="small" exclusive value={filter} onChange={(_e: React.MouseEvent<HTMLElement>, v: Filter | null) => v && setFilter(v)} color="primary">
            <ToggleButton value="ALL" sx={{ px: 2, fontWeight: 700 }}>All</ToggleButton>
            <ToggleButton value="CAMPAIGN" sx={{ px: 2, fontWeight: 700 }}>Campaigns</ToggleButton>
            <ToggleButton value="SMTP_SOS" sx={{ px: 2, fontWeight: 700 }}>SOS</ToggleButton>
            <ToggleButton value="ADVISORY" sx={{ px: 2, fontWeight: 700 }}>Advisories</ToggleButton>
          </ToggleButtonGroup>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {shown.length} shown{delivered > 0 ? ` · ${delivered.toLocaleString()} campaign deliveries` : ''}
          </Typography>
        </Stack>

        {loading && items.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : shown.length === 0 ? (
          <EmptyState title="Nothing here yet" description={items.length ? 'No notification matches the current filter.' : 'Campaign broadcasts, SOS dispatches and advisories will stream here.'} />
        ) : (
          <Stack spacing={3}>
            {groups.map(([day, list]) => (
              <Box key={day}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary' }}>{day}</Typography>
                  <Box sx={{ flexGrow: 1, height: '1px', bgcolor: 'divider' }} />
                </Stack>
                <Stack spacing={1.5}>
                  {list.map((n) => {
                    const k = KIND[n.kind];
                    return (
                      <Box
                        key={`${n.kind}-${n.id}`}
                        onClick={n.kind === 'CAMPAIGN' ? () => navigate('/campaigns') : undefined}
                        sx={{
                          display: 'flex', gap: 2, p: 2, borderRadius: '14px', border: '1px solid', borderColor: 'divider',
                          borderLeft: `4px solid ${k.color}`, cursor: n.kind === 'CAMPAIGN' ? 'pointer' : 'default', transition: 'all .2s',
                          '&:hover': { transform: 'translateX(4px)', bgcolor: 'action.hover' },
                        }}
                      >
                        <Box sx={{ width: 44, height: 44, flexShrink: 0, borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: k.grad, boxShadow: `0 8px 18px -8px ${k.color}` }}>{k.icon}</Box>
                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography noWrap sx={{ fontWeight: 800, fontSize: '0.98rem', lineHeight: 1.3 }}>{n.title}</Typography>
                              {n.subtitle && <Typography noWrap variant="caption" color="text.secondary">{n.subtitle}</Typography>}
                            </Box>
                            <Chip
                              size="small"
                              label={n.kind === 'CAMPAIGN' ? `${k.label}${n.status ? ` · ${n.status}` : ''}` : k.label}
                              sx={{ flexShrink: 0, height: 24, fontWeight: 800, fontSize: '0.68rem', color: k.color, bgcolor: `${k.color}1f`, border: `1px solid ${k.color}55` }}
                            />
                            <Tooltip title="Delete Log">
                              <IconButton
                                size="small"
                                color="error"
                                aria-label="Delete Log"
                                onClick={(e) => { e.stopPropagation(); setDeleteDialogItem(n); }}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                          {n.message && (
                            <Typography variant="body2" sx={{ mt: 0.75, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.message}</Typography>
                          )}
                          <Stack direction="row" flexWrap="wrap" useFlexGap spacing={2} sx={{ mt: 1.25, color: 'text.secondary' }}>
                            {n.location && (
                              <Stack direction="row" spacing={0.5} alignItems="center"><PlaceOutlinedIcon sx={{ fontSize: 15 }} /><Typography variant="caption" sx={{ fontWeight: 600 }}>{n.location}</Typography></Stack>
                            )}
                            {n.recipients > 0 && (
                              <Stack direction="row" spacing={0.5} alignItems="center"><GroupsOutlinedIcon sx={{ fontSize: 15 }} /><Typography variant="caption" sx={{ fontWeight: 600 }}>{n.recipients.toLocaleString()} {n.kind === 'SMTP_SOS' ? 'email(s) delivered' : 'delivered'}</Typography></Stack>
                            )}
                            {n.createdAt && (
                              <Stack direction="row" spacing={0.5} alignItems="center" title={new Date(n.createdAt).toLocaleString()}><ScheduleIcon sx={{ fontSize: 15 }} /><Typography variant="caption" sx={{ fontWeight: 600 }}>{timeAgo(n.createdAt)}</Typography></Stack>
                            )}
                          </Stack>
                          {n.contacts.length > 0 && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.75 }} noWrap>
                              To: {n.contacts.map((c: any) => c.name || c.email || c.phone).filter(Boolean).join(', ')}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </GlassCard>

      {/* Delete Single Confirm */}
      <ConfirmDialog
        open={Boolean(deleteDialogItem)}
        title="Delete Notification Log?"
        message={deleteDialogItem ? `Are you sure you want to delete dispatch record "${deleteDialogItem.title}"?` : ''}
        confirmText="Delete Log"
        onConfirm={handleDeleteItem}
        onClose={() => setDeleteDialogItem(null)}
      />

      {/* Clear All Logs Danger Confirm */}
      <DangerConfirmDialog
        open={clearAllOpen}
        title="Purge All Notification Dispatches?"
        message={`Are you sure you want to permanently clear all ${items.length} notification and emergency dispatch records across the platform?`}
        expectedWord="DELETE"
        confirmText="Purge All Dispatches"
        onConfirm={handleClearAll}
        onClose={() => setClearAllOpen(false)}
      />
    </Box>
  );
};
