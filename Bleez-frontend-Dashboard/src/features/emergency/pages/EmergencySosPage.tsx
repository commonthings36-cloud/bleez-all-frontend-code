import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid2 as Grid,
  Typography,
  Stack,
  Chip,
  Button,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Link,
} from '@mui/material';
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

export const EmergencySosPage: React.FC = () => {
  const [panicEvents, setPanicEvents] = useState<PanicEventRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPanicEvents = () => {
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
    const interval = setInterval(fetchPanicEvents, 15000);
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

  return (
    <Box>
      <PageHeader
        title="Live Emergency SOS Console"
        subtitle="Real-time geotagged panic distress signals, traveler details, and emergency contact email dispatches."
        breadcrumbs={[{ label: 'Emergency SOS' }]}
        action={
          <Button
            variant="outlined"
            color="error"
            startIcon={<RefreshIcon />}
            onClick={fetchPanicEvents}
            sx={{ fontWeight: 700 }}
          >
            Refresh SOS Stream
          </Button>
        }
      />

      {/* KPI Summary Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <GlassCard sx={{ p: 2.5, borderColor: 'error.main' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  Total SOS Alerts
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'error.main', mt: 0.5 }}>
                  {totalAlerts}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Live panic triggers in MongoDB
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', width: 48, height: 48 }}>
                <WarningAmberIcon />
              </Avatar>
            </Stack>
          </GlassCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <GlassCard sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  Emergency Emails Sent
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#10B981', mt: 0.5 }}>
                  {totalEmailsDelivered}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Delivered to trusted contacts
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', width: 48, height: 48 }}>
                <MarkEmailReadIcon />
              </Avatar>
            </Stack>
          </GlassCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <GlassCard sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  Geotagged Signals
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#6366F1', mt: 0.5 }}>
                  {geotaggedCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  With GPS coordinates / location
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(99, 102, 241, 0.15)', color: '#6366F1', width: 48, height: 48 }}>
                <MyLocationIcon />
              </Avatar>
            </Stack>
          </GlassCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <GlassCard sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  SOS Media Evidence
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#F59E0B', mt: 0.5 }}>
                  {totalMediaFiles}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Captured S3 photos attached
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', width: 48, height: 48 }}>
                <PhotoCameraIcon />
              </Avatar>
            </Stack>
          </GlassCard>
        </Grid>
      </Grid>

      {/* SOS Distress Events Table */}
      <GlassCard sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Active SOS Panic Command Center
            </Typography>
            <Typography variant="body2" color="text.secondary">
              24/7 Geotagged distress signals triggered via mobile/web `/api/emergency/panic`
            </Typography>
          </Box>
          <Chip
            label={`${totalAlerts} Incident${totalAlerts === 1 ? '' : 's'} Recorded`}
            color={totalAlerts > 0 ? 'error' : 'default'}
            sx={{ fontWeight: 700 }}
          />
        </Stack>

        {loading && panicEvents.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress color="error" />
          </Box>
        ) : panicEvents.length === 0 ? (
          <EmptyState
            title="No SOS Panic Alerts Recorded"
            description="When a user triggers an SOS Panic Alert, their live GPS location, note, and notified emergency contacts will appear here immediately."
          />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Traveler (Sender)</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Distress Note & Media</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>GPS Location</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Emergency Contacts Notified</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Triggered At</TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {panicEvents.map((ev) => {
                  const mapsUrl =
                    ev.googleMapsUrl ||
                    (ev.latitude != null && ev.longitude != null
                      ? `https://maps.google.com/?q=${ev.latitude},${ev.longitude}`
                      : null);

                  return (
                    <TableRow key={ev.id} hover>
                      {/* Traveler Info */}
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            src={ev.senderPicture || undefined}
                            alt={ev.senderName || 'Traveler'}
                            sx={{ bgcolor: 'error.main', width: 40, height: 40, fontWeight: 700 }}
                          >
                            {(ev.senderName || 'T').charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                              {ev.senderName || 'Traveler'}
                            </Typography>
                            {ev.senderEmail && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                {ev.senderEmail}
                              </Typography>
                            )}
                            {ev.senderPhone && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                Tel: {ev.senderPhone}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* Distress Note & Media */}
                      <TableCell sx={{ maxWidth: 280 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {ev.note && ev.note.trim().length > 0
                            ? ev.note
                            : 'Emergency SOS Panic Button Triggered'}
                        </Typography>
                        {Array.isArray(ev.mediaUrls) && ev.mediaUrls.length > 0 && (
                          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                            {ev.mediaUrls.map((url, idx) => (
                              <Chip
                                key={idx}
                                icon={<PhotoCameraIcon />}
                                label={`Photo ${idx + 1}`}
                                size="small"
                                color="warning"
                                variant="outlined"
                                component="a"
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                clickable
                              />
                            ))}
                          </Stack>
                        )}
                      </TableCell>

                      {/* GPS Coordinates & Map Link */}
                      <TableCell>
                        {ev.locationLabel && (
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {ev.locationLabel}
                          </Typography>
                        )}
                        {ev.latitude != null && ev.longitude != null ? (
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {ev.latitude.toFixed(5)}, {ev.longitude.toFixed(5)}
                            </Typography>
                            {mapsUrl && (
                              <Link
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                underline="hover"
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  mt: 0.5,
                                }}
                              >
                                Open in Google Maps <OpenInNewIcon sx={{ fontSize: 13 }} />
                              </Link>
                            )}
                          </Box>
                        ) : (
                          !ev.locationLabel && (
                            <Typography variant="caption" color="text.secondary">
                              Coordinates not provided
                            </Typography>
                          )
                        )}
                      </TableCell>

                      {/* Emergency Contacts Notified */}
                      <TableCell>
                        <Chip
                          icon={<MarkEmailReadIcon />}
                          label={`${ev.recipientCount ?? 0} Email${ev.recipientCount === 1 ? '' : 's'} Sent`}
                          size="small"
                          color="success"
                          sx={{ fontWeight: 700, mb: 0.5 }}
                        />
                        {Array.isArray(ev.emergencyContacts) && ev.emergencyContacts.length > 0 && (
                          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                            {ev.emergencyContacts.map((c, idx) => (
                              <Typography key={idx} variant="caption" color="text.secondary" display="block">
                                • {c.name || 'Contact'}
                                {c.email ? ` (${c.email})` : ''}
                                {c.phone ? ` • ${c.phone}` : ''}
                              </Typography>
                            ))}
                          </Stack>
                        )}
                      </TableCell>

                      {/* Triggered Timestamp */}
                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <AccessTimeIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {formatTimestamp(ev.createdAt)}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* Status */}
                      <TableCell align="right">
                        <Chip
                          label={ev.status || 'SOS DISPATCHED'}
                          color="error"
                          size="small"
                          sx={{ fontWeight: 800 }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </GlassCard>
    </Box>
  );
};
