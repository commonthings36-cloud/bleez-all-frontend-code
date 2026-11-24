import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  Avatar,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import RefreshIcon from '@mui/icons-material/Refresh';
import CampaignIcon from '@mui/icons-material/Campaign';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useSnackbar } from 'notistack';

import { PageHeader } from '@/components/PageHeader';
import { GlassCard } from '@/components/GlassCard';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DangerConfirmDialog } from '@/components/DangerConfirmDialog';
import { apiClient } from '@/services/apiClient';

export const NotificationsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteDialogItem, setDeleteDialogItem] = useState<any | null>(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);

  const handleDeleteItem = async () => {
    if (!deleteDialogItem) return;
    try {
      if (deleteDialogItem.category === 'SMTP_SOS') {
        await apiClient.delete(`/emergency/panic-events/${deleteDialogItem.id}`);
      } else {
        await apiClient.delete(`/intelligence/notifications/${deleteDialogItem.id}`);
      }
      enqueueSnackbar('Dispatch record deleted successfully.', { variant: 'success' });
      setDispatches((prev) => prev.filter((d) => d.id !== deleteDialogItem.id));
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
      setDispatches([]);
      setClearAllOpen(false);
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message || 'Failed to clear notifications', { variant: 'error' });
    }
  };

  const fetchNotifications = () => {
    setLoading(true);
    Promise.allSettled([
      apiClient.get('/emergency/panic-events'),
      apiClient.get('/alerts/all'),
      apiClient.get('/admin/campaigns'),
    ])
      .then(([panicRes, alertsRes, campaignsRes]) => {
        const panicItems =
          panicRes.status === 'fulfilled' && Array.isArray(panicRes.value.data)
            ? panicRes.value.data.map((ev: any) => ({
              id: ev.id,
              title: `Emergency SOS Email Dispatch — ${ev.senderName || 'Traveler'}`,
              subtitle: ev.senderEmail || '',
              message: ev.note || 'Emergency assistance signal dispatched to trusted contacts.',
              recipientsCount: ev.recipientCount ?? 0,
              contacts: ev.emergencyContacts || [],
              location:
                ev.locationLabel ||
                (ev.latitude != null && ev.longitude != null
                  ? `${ev.latitude}, ${ev.longitude}`
                  : null),
              createdAt: ev.createdAt,
              category: 'SMTP_SOS',
            }))
            : [];

        const alertItems =
          alertsRes.status === 'fulfilled'
            ? (Array.isArray(alertsRes.value.data)
              ? alertsRes.value.data
              : alertsRes.value.data?.alerts || []
            ).map((a: any, idx: number) => ({
              id: a.id || `alert-${idx}`,
              title: a.title || a.type || 'Travel Advisory Notification',
              subtitle: a.country || '',
              message: a.description || a.message || '',
              recipientsCount: 0,
              contacts: [],
              location: a.country || null,
              createdAt: a.timestamp || a.createdAt || null,
              category: 'ADVISORY',
            }))
            : [];

        const campaignItems =
          campaignsRes.status === 'fulfilled' && Array.isArray(campaignsRes.value.data)
            ? campaignsRes.value.data.map((c: any) => ({
              id: c.id,
              title: `Campaign Announcement — ${c.name || 'Untitled Campaign'}`,
              subtitle: `Audience: ${c.audienceScope || 'ALL_USERS'} · Status: ${c.status || 'DRAFT'}`,
              message:
                c.objective ||
                (c.messageTemplate ? `"${c.messageTemplate}"` : `Priority ${c.priority ?? 8}/10 campaign scheduled for traveler engagement.`),
              recipientsCount: c.metrics?.deliveredCount ?? c.metrics?.delivered_count ?? c.targetEstimate ?? 0,
              contacts: [],
              location: c.targetCountries?.length ? c.targetCountries.join(', ') : 'Global',
              createdAt: c.createdAt || c.updatedAt,
              category: 'CAMPAIGN',
              status: c.status,
            }))
            : [];

        const combined = [...panicItems, ...campaignItems, ...alertItems].sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });

        setDispatches(combined);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <Box>
      <PageHeader
        title="Notification Center & Broadcasts"
        subtitle="Real-time SMTP emergency email dispatches and system alert notifications."
        breadcrumbs={[{ label: 'Notification Center' }]}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchNotifications}
              sx={{ fontWeight: 700 }}
            >
              Refresh Dispatches
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteForeverIcon />}
              onClick={() => setClearAllOpen(true)}
              disabled={dispatches.length === 0}
              sx={{ fontWeight: 700 }}
            >
              Purge All Logs
            </Button>
          </Stack>
        }
      />

      <GlassCard sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Push Notification & SMTP Dispatch Log
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Live emergency contact emails and platform alerts delivered from backend
            </Typography>
          </Box>
          <Chip
            label={`${dispatches.length} Total Dispatches`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
        </Stack>

        {loading && dispatches.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : dispatches.length === 0 ? (
          <EmptyState
            title="No Notifications Dispatched Yet"
            description="Real-time SMTP emergency email dispatches and travel alerts will stream here."
          />
        ) : (
          <Stack spacing={2}>
            {dispatches.map((item) => (
              <GlassCard
                key={item.id}
                sx={{
                  p: 2.5,
                  borderColor:
                    item.category === 'SMTP_SOS'
                      ? 'error.main'
                      : item.category === 'CAMPAIGN'
                      ? 'primary.main'
                      : 'divider',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar
                      sx={{
                        bgcolor:
                          item.category === 'SMTP_SOS'
                            ? 'rgba(239,68,68,0.15)'
                            : item.category === 'CAMPAIGN'
                            ? 'rgba(124,58,237,0.15)'
                            : 'rgba(99,102,241,0.15)',
                        color:
                          item.category === 'SMTP_SOS'
                            ? '#EF4444'
                            : item.category === 'CAMPAIGN'
                            ? '#7C3AED'
                            : '#6366F1',
                      }}
                    >
                      {item.category === 'SMTP_SOS' ? (
                        <MarkEmailReadIcon />
                      ) : item.category === 'CAMPAIGN' ? (
                        <CampaignIcon />
                      ) : (
                        <WarningAmberIcon />
                      )}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        {item.title}
                      </Typography>
                      {item.subtitle && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {item.subtitle}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {item.message}
                      </Typography>
                      {Array.isArray(item.contacts) && item.contacts.length > 0 && (
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          Recipients: {item.contacts.map((c: any) => `${c.name || 'Contact'} (${c.email || c.phone || ''})`).join(', ')}
                        </Typography>
                      )}
                      {item.location && (
                        <Typography variant="caption" color="primary" display="block" sx={{ mt: 0.5, fontWeight: 600 }}>
                          Target Area: {item.location}
                        </Typography>
                      )}
                      {item.createdAt && (
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          Logged at: {new Date(item.createdAt).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                    <Chip
                      label={
                        item.category === 'SMTP_SOS'
                          ? `${item.recipientsCount} Email(s) Delivered`
                          : item.category === 'CAMPAIGN'
                          ? `CAMPAIGN · ${item.status || 'ACTIVE'}`
                          : 'SYSTEM ALERT'
                      }
                      color={
                        item.category === 'SMTP_SOS'
                          ? 'error'
                          : item.category === 'CAMPAIGN'
                          ? 'primary'
                          : 'warning'
                      }
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                    <Tooltip title="Delete Log">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialogItem(item)}
                        aria-label="Delete Log"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </GlassCard>
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
        message={`Are you sure you want to permanently clear all ${dispatches.length} notification and emergency dispatch records across the platform?`}
        expectedWord="DELETE"
        confirmText="Purge All Dispatches"
        onConfirm={handleClearAll}
        onClose={() => setClearAllOpen(false)}
      />
    </Box>
  );
};
