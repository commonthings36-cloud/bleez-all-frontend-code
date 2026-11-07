import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  Avatar,
  CircularProgress,
  Button,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import RefreshIcon from '@mui/icons-material/Refresh';

import { PageHeader } from '@/components/PageHeader';
import { GlassCard } from '@/components/GlassCard';
import { EmptyState } from '@/components/EmptyState';
import { apiClient } from '@/services/apiClient';

export const NotificationsPage: React.FC = () => {
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotifications = () => {
    setLoading(true);
    Promise.allSettled([
      apiClient.get('/emergency/panic-events'),
      apiClient.get('/alerts/all'),
    ])
      .then(([panicRes, alertsRes]) => {
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

        setDispatches([...panicItems, ...alertItems]);
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
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchNotifications}
            sx={{ fontWeight: 700 }}
          >
            Refresh Dispatches
          </Button>
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
                  borderColor: item.category === 'SMTP_SOS' ? 'error.main' : 'divider',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar
                      sx={{
                        bgcolor: item.category === 'SMTP_SOS' ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)',
                        color: item.category === 'SMTP_SOS' ? '#EF4444' : '#6366F1',
                      }}
                    >
                      {item.category === 'SMTP_SOS' ? <MarkEmailReadIcon /> : <WarningAmberIcon />}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        {item.title}
                      </Typography>
                      {item.subtitle && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Sender: {item.subtitle}
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
                      {item.createdAt && (
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          Dispatched at: {new Date(item.createdAt).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                  <Chip
                    label={
                      item.category === 'SMTP_SOS'
                        ? `${item.recipientsCount} Email(s) Delivered`
                        : 'SYSTEM ALERT'
                    }
                    color={item.category === 'SMTP_SOS' ? 'success' : 'warning'}
                    size="small"
                    sx={{ fontWeight: 700, flexShrink: 0 }}
                  />
                </Stack>
              </GlassCard>
            ))}
          </Stack>
        )}
      </GlassCard>
    </Box>
  );
};
