import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, FormControlLabel, List, ListItem, ListItemText, Pagination, Stack, Switch, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DoneIcon from '@mui/icons-material/Done';
import { useSnackbar } from 'notistack';
import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { apiClient } from '@/services/apiClient';

interface NotificationItem {
  id: string;
  title?: string;
  message?: string;
  category?: string;
  severity?: string;
  read?: boolean;
  createdAt?: string;
}

const PAGE_SIZE = 20;

const severityColor = (s?: string): 'error' | 'warning' | 'info' | 'default' => {
  switch ((s || '').toLowerCase()) {
    case 'critical':
    case 'high':
      return 'error';
    case 'medium':
    case 'warning':
      return 'warning';
    case 'low':
    case 'info':
      return 'info';
    default:
      return 'default';
  }
};

export const NotificationsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/intelligence/notifications', { params: { page, pageSize: PAGE_SIZE, unreadOnly } });
      setItems(res.data?.items ?? []);
      setTotalItems(res.data?.total_items ?? 0);
      setTotalPages(Math.max(1, res.data?.total_pages ?? 1));
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Could not load notifications.');
    } finally {
      setLoading(false);
    }
  }, [page, unreadOnly]);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (id: string) => {
    try {
      await apiClient.patch(`/intelligence/notifications/${id}/read`);
      setItems((prev) => (unreadOnly ? prev.filter((n) => n.id !== id) : prev.map((n) => (n.id === id ? { ...n, read: true } : n))));
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message || 'Could not mark as read', { variant: 'error' });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Notifications"
        subtitle="Alerts generated for your account by the intelligence engine."
        breadcrumbs={[{ label: 'Notifications' }]}
        action={<Button variant="outlined" startIcon={<RefreshIcon />} onClick={load} disabled={loading}>Refresh</Button>}
      />
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <GlassCard sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 1, pb: 1 }}>
          <Typography variant="body2" color="text.secondary">{totalItems} notification{totalItems === 1 ? '' : 's'}</Typography>
          <FormControlLabel
            control={<Switch checked={unreadOnly} onChange={(e) => { setPage(1); setUnreadOnly(e.target.checked); }} />}
            label="Unread only"
          />
        </Stack>
        {!loading && items.length === 0 ? (
          <EmptyState title="You're all caught up" description={unreadOnly ? 'No unread notifications.' : 'No notifications yet.'} />
        ) : (
          <List disablePadding>
            {items.map((n) => (
              <ListItem
                key={n.id}
                divider
                secondaryAction={!n.read && (
                  <Button size="small" startIcon={<DoneIcon />} onClick={() => markRead(n.id)}>Mark read</Button>
                )}
                sx={{ opacity: n.read ? 0.6 : 1, pr: { xs: 2, sm: 18 }, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}
              >
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography sx={{ fontWeight: n.read ? 500 : 800 }}>{n.title || 'Notification'}</Typography>
                      {n.severity && <Chip size="small" label={n.severity} color={severityColor(n.severity)} />}
                      {n.category && <Chip size="small" variant="outlined" label={n.category} />}
                    </Stack>
                  }
                  secondary={`${n.message || ''}${n.createdAt ? `  ·  ${new Date(n.createdAt).toLocaleString()}` : ''}`}
                />
              </ListItem>
            ))}
          </List>
        )}
        {totalPages > 1 && (
          <Stack alignItems="center" sx={{ pt: 2 }}>
            <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
          </Stack>
        )}
      </GlassCard>
    </Box>
  );
};
