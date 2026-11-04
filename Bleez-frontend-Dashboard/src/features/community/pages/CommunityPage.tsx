import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Avatar, Box, Button, Chip, IconButton, MenuItem, Select, Stack, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useSnackbar } from 'notistack';
import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { apiClient } from '@/services/apiClient';

interface Message {
  id: string;
  userId?: string;
  userName?: string;
  userPicture?: string;
  content?: string;
  timestamp?: string;
  type?: string;
}

interface OnlineUser {
  id?: string;
  name?: string;
  email?: string;
}

export const CommunityPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [messages, setMessages] = useState<Message[]>([]);
  const [online, setOnline] = useState<OnlineUser[]>([]);
  const [limit, setLimit] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Message | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [msgs, users] = await Promise.all([
        apiClient.get('/community/messages', { params: { limit } }),
        apiClient.get('/community/online-users'),
      ]);
      setMessages(Array.isArray(msgs.data) ? msgs.data : []);
      setOnline(Array.isArray(users.data) ? users.data : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Could not load community data.');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    load();
  }, [load]);

  const deleteOne = async () => {
    if (!toDelete) return;
    try {
      await apiClient.delete(`/community/messages/${toDelete.id}`);
      enqueueSnackbar('Message deleted', { variant: 'success' });
      setToDelete(null);
      load();
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message || 'Could not delete message', { variant: 'error' });
      setToDelete(null);
    }
  };

  const clearAll = async () => {
    try {
      await apiClient.delete('/community/messages/clear-all');
      enqueueSnackbar('All community messages deleted', { variant: 'success' });
      setConfirmClear(false);
      load();
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message || 'Could not clear messages', { variant: 'error' });
      setConfirmClear(false);
    }
  };

  const columns: GridColDef<Message>[] = [
    {
      field: 'userName',
      headerName: 'Author',
      width: 220,
      renderCell: (p) => (
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ height: '100%' }}>
          <Avatar src={p.row.userPicture} sx={{ width: 32, height: 32 }}>{(p.row.userName || '?').charAt(0).toUpperCase()}</Avatar>
          <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{p.row.userName || 'Unknown'}</Typography>
        </Stack>
      ),
    },
    { field: 'content', headerName: 'Message', flex: 1, minWidth: 320 },
    { field: 'type', headerName: 'Type', width: 110, renderCell: (p) => (p.value ? <Chip size="small" label={p.value} variant="outlined" /> : null) },
    { field: 'timestamp', headerName: 'Posted', width: 180, valueFormatter: (v: string) => (v ? new Date(v).toLocaleString() : '—') },
    {
      field: 'actions',
      headerName: '',
      width: 70,
      sortable: false,
      renderCell: (p) => (
        <Tooltip title="Delete message">
          <IconButton size="small" color="error" aria-label="Delete message" onClick={() => setToDelete(p.row)}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Community"
        subtitle="Moderate the traveler chat and see who is online."
        breadcrumbs={[{ label: 'Community' }]}
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load} disabled={loading}>Refresh</Button>
            <Button variant="contained" color="error" startIcon={<DeleteSweepIcon />} onClick={() => setConfirmClear(true)} disabled={messages.length === 0}>
              Clear all
            </Button>
          </Stack>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <GlassCard sx={{ p: 2.5, flex: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Messages loaded</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>{loading ? '…' : messages.length}</Typography>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">Show latest</Typography>
            <Select size="small" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
              {[50, 100, 250, 500].map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </Select>
          </Stack>
        </GlassCard>
        <GlassCard sx={{ p: 2.5, flex: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Online now</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>{loading ? '…' : online.length}</Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
            {online.slice(0, 12).map((u, i) => <Chip key={u.id || i} size="small" label={u.name || u.email || 'User'} />)}
          </Stack>
        </GlassCard>
      </Stack>

      <GlassCard sx={{ p: 2 }}>
        {!loading && messages.length === 0 ? (
          <EmptyState title="No messages" description="The community chat is empty." />
        ) : (
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <DataGrid
              rows={messages}
              columns={columns}
              loading={loading}
              autoHeight
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } }, sorting: { sortModel: [{ field: 'timestamp', sort: 'desc' }] } }}
              sx={{ border: 0, minWidth: 820 }}
            />
          </Box>
        )}
      </GlassCard>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this message?"
        message={`This permanently removes the message from ${toDelete?.userName || 'this user'}.`}
        confirmText="Delete"
        color="error"
        onConfirm={deleteOne}
        onClose={() => setToDelete(null)}
      />
      <ConfirmDialog
        open={confirmClear}
        title="Delete ALL community messages?"
        message="This removes every message for every user and cannot be undone."
        confirmText="Delete everything"
        color="error"
        onConfirm={clearAll}
        onClose={() => setConfirmClear(false)}
      />
    </Box>
  );
};
