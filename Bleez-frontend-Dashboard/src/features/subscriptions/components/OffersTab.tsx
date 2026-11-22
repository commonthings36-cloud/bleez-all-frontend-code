import React, { useMemo, useState } from 'react';
import {
  Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, Stack, TextField,
  ToggleButton, ToggleButtonGroup, Tooltip, Typography, keyframes,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import RedeemIcon from '@mui/icons-material/Redeem';
import BoltIcon from '@mui/icons-material/Bolt';
import SearchIcon from '@mui/icons-material/Search';
import BlockIcon from '@mui/icons-material/Block';
import { useSnackbar } from 'notistack';
import { GlassCard } from '@/components/GlassCard';
import { EmptyState } from '@/components/EmptyState';
import { subscriptionService } from '../services/subscription.service';

interface Props {
  history: any[];
  summary: any;
  onGrant: () => void;
  onChanged: () => void;
}

const fadeUp = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}`;
const initials = (s?: string) => (s || '?').split(/[\s@.]/).filter(Boolean).slice(0, 2).map((x) => x[0]?.toUpperCase()).join('') || '?';
const fmt = (v?: string) => (v ? new Date(v).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

/** Pick icon/colour from the offer text/type so new backend offer types still render sensibly. */
const offerStyle = (r: any) => {
  const t = `${r.offerType || ''} ${r.offerTitle || ''}`.toLowerCase();
  if (t.includes('plan') || t.includes('upgrade') || t.includes('business') || t.includes('explorer')) return { color: '#F59E0B', icon: <WorkspacePremiumIcon fontSize="small" /> };
  if (t.includes('reset')) return { color: '#0EA5E9', icon: <RestartAltIcon fontSize="small" /> };
  return { color: '#7C3AED', icon: <AutoAwesomeIcon fontSize="small" /> };
};

const isActive = (r: any) => String(r.status || '').toUpperCase() === 'ACTIVE';

export const OffersTab: React.FC<Props> = ({ history, summary, onGrant, onChanged }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('all');
  const [query, setQuery] = useState('');
  const [revoking, setRevoking] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);

  const activeCount = history.filter(isActive).length;
  const kpis = [
    { label: 'Offers granted', value: summary?.totalOffersGranted ?? history.length, sub: 'All time', color: '#7C3AED', icon: <RedeemIcon /> },
    { label: 'Active now', value: summary?.activeOffersCount ?? activeCount, sub: 'Still running', color: '#16A34A', icon: <BoltIcon /> },
    { label: 'Extra trips given', value: `+${summary?.totalExtraGenerationsDistributed ?? 0}`, sub: 'Bonus AI generations', color: '#F59E0B', icon: <AutoAwesomeIcon /> },
    { label: 'Plan upgrades', value: summary?.planUpgradesCount ?? 0, sub: 'Free Explorer / Business', color: '#0EA5E9', icon: <WorkspacePremiumIcon /> },
  ];

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return history
      .filter((r) => (filter === 'all' ? true : filter === 'active' ? isActive(r) : !isActive(r)))
      .filter((r) => !q || [r.userName, r.userEmail, r.offerTitle, r.reason, r.adminEmail].some((v) => String(v || '').toLowerCase().includes(q)))
      .map((r, i) => ({ ...r, _id: r.id || `row-${i}` }));
  }, [history, filter, query]);

  const revoke = async () => {
    if (!revoking) return;
    setBusy(true);
    try {
      await subscriptionService.revokeOffer(revoking.id);
      enqueueSnackbar('Offer revoked', { variant: 'info' });
      setRevoking(null);
      onChanged();
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message || 'Failed to revoke offer', { variant: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'userName', headerName: 'User', flex: 1, minWidth: 190,
      renderCell: (p) => (
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ height: '100%', minWidth: 0 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: '0.8rem', fontWeight: 800 }}>{initials(p.row.userName || p.row.userEmail)}</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.4 }}>{p.row.userName || 'User'}</Typography>
            <Typography noWrap color="text.secondary" sx={{ fontSize: '0.76rem', lineHeight: 1.4 }}>{p.row.userEmail || '—'}</Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: 'offerTitle', headerName: 'Offer', flex: 1.2, minWidth: 210,
      renderCell: (p) => {
        const s = offerStyle(p.row);
        return (
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ height: '100%', minWidth: 0 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '10px', flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor: `${s.color}1a`, color: s.color }}>{s.icon}</Box>
            <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.86rem', lineHeight: 1.4 }}>{p.row.offerTitle || 'Offer'}</Typography>
          </Stack>
        );
      },
    },
    { field: 'reason', headerName: 'Note', flex: 0.8, minWidth: 120, renderCell: (p) => <Typography noWrap color={p.row.reason ? 'text.primary' : 'text.secondary'} sx={{ fontSize: '0.84rem', lineHeight: 1.4 }}>{p.row.reason || '—'}</Typography> },
    { field: 'adminEmail', headerName: 'Granted by', width: 150, renderCell: (p) => <Typography noWrap sx={{ fontSize: '0.84rem', lineHeight: 1.4 }}>{p.row.adminEmail || 'admin@bleez.ai'}</Typography> },
    { field: 'grantedAt', headerName: 'Date', width: 115, renderCell: (p) => <Typography noWrap sx={{ fontSize: '0.84rem', lineHeight: 1.4 }}>{fmt(p.row.grantedAt)}</Typography> },
    {
      field: 'status', headerName: 'Status', width: 105,
      renderCell: (p) => {
        const on = isActive(p.row);
        const c = on ? '#16A34A' : '#64748B';
        return <Chip size="small" label={on ? 'Active' : String(p.row.status || 'Ended').toLowerCase().replace(/^./, (x) => x.toUpperCase())} sx={{ alignSelf: 'center', height: 26, borderRadius: '8px', fontWeight: 700, fontSize: '0.72rem', bgcolor: `${c}1a`, color: c }} />;
      },
    },
    {
      field: 'actions', headerName: '', width: 100, sortable: false,
      renderCell: (p) =>
        isActive(p.row) ? (
          <Tooltip title="Take this offer back">
            <Button size="small" color="error" startIcon={<BlockIcon />} onClick={() => setRevoking(p.row)} sx={{ alignSelf: 'center', fontWeight: 700 }}>Revoke</Button>
          </Tooltip>
        ) : null,
    },
  ];

  return (
    <Box sx={{ p: 2.5 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.5} sx={{ mb: 2.5 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Offers, perks & quota grants</Typography>
          <Typography variant="body2" color="text.secondary">Bonus trips, free upgrades and usage resets given to users by the team</Typography>
        </Box>
        <Button variant="contained" startIcon={<CardGiftcardIcon />} onClick={onGrant} sx={{ fontWeight: 800 }}>Grant new offer</Button>
      </Stack>

      <Box sx={{ display: 'grid', gap: 2, mb: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(4,1fr)' } }}>
        {kpis.map((k, i) => (
          <GlassCard key={k.label} sx={{ p: 2.25, height: 118, animation: `${fadeUp} .4s ease ${i * 0.06}s both` }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>{k.label}</Typography>
                <Typography sx={{ fontSize: '1.9rem', fontWeight: 800, lineHeight: 1.3, color: k.color }}>{k.value}</Typography>
              </Box>
              <Box sx={{ width: 40, height: 40, borderRadius: '12px', display: 'grid', placeItems: 'center', bgcolor: `${k.color}1a`, color: k.color }}>{k.icon}</Box>
            </Stack>
            <Typography noWrap color="text.secondary" sx={{ fontSize: '0.78rem' }}>{k.sub}</Typography>
          </GlassCard>
        ))}
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" sx={{ mb: 1.5 }}>
        <ToggleButtonGroup size="small" exclusive value={filter} onChange={(_, v) => v && setFilter(v)}>
          <ToggleButton value="all" sx={{ px: 2, fontWeight: 700, textTransform: 'none' }}>All ({history.length})</ToggleButton>
          <ToggleButton value="active" sx={{ px: 2, fontWeight: 700, textTransform: 'none' }}>Active ({activeCount})</ToggleButton>
          <ToggleButton value="ended" sx={{ px: 2, fontWeight: 700, textTransform: 'none' }}>Ended ({history.length - activeCount})</ToggleButton>
        </ToggleButtonGroup>
        <TextField
          size="small" placeholder="Search user, offer or note…" value={query} onChange={(e) => setQuery(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} sx={{ minWidth: { md: 300 } }}
        />
      </Stack>

      {rows.length === 0 ? (
        <EmptyState
          icon={<CardGiftcardIcon />}
          title={history.length ? 'No offers match' : 'No offers granted yet'}
          description={history.length ? 'Try a different filter or search.' : 'Reward a loyal user with bonus trips or a free upgrade.'}
          actionLabel={history.length ? undefined : 'Grant first offer'}
          onAction={history.length ? undefined : onGrant}
        />
      ) : (
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(r) => r._id}
            rowHeight={64}
            autoHeight
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            sx={{ border: 0, minWidth: 980, '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' } }}
          />
        </Box>
      )}

      <Dialog open={Boolean(revoking)} onClose={() => !busy && setRevoking(null)} PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Revoke this offer?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            <b>{revoking?.offerTitle}</b> will be taken back from <b>{revoking?.userName || revoking?.userEmail}</b>. This can’t be undone, but you can grant a new offer anytime.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRevoking(null)} disabled={busy}>Keep it</Button>
          <Button color="error" variant="contained" onClick={revoke} disabled={busy}>{busy ? 'Revoking…' : 'Revoke offer'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
