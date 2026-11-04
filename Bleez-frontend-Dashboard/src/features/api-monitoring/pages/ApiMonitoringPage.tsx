import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid2 as Grid,
  Typography,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  ButtonGroup,
  IconButton,
  Tooltip,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TimelineIcon from '@mui/icons-material/Timeline';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import SpeedIcon from '@mui/icons-material/Speed';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { apiClient } from '@/services/apiClient';

const TIME_RANGES = [
  '1 hour',
  '6 hours',
  '12 hours',
  '1 day',
  '2 days',
  '4 days',
  '7 days',
  '14 days',
  '30 days',
];

export const ApiMonitoringPage: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<string>('30 days');
  const [loading, setLoading] = useState<boolean>(false);
  const [chartSeries, setChartSeries] = useState<any[]>([]);
  const [googleApis, setGoogleApis] = useState<any[]>([]);
  const [firebaseData, setFirebaseData] = useState<any>(null);
  const [awsData, setAwsData] = useState<any>(null);
  const [cloudFrontData, setCloudFrontData] = useState<any>(null);

  const fetchInternalApiMetrics = (range: string) => {
    setLoading(true);
    setSelectedRange(range);

    apiClient
      .get(`/admin/internal-api-metrics?range=${encodeURIComponent(range)}`)
      .then((res) => {
        if (res.data) {
          if (res.data.series) setChartSeries(res.data.series);
          if (res.data.apis) setGoogleApis(res.data.apis);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log('Internal API Metrics fetch notice:', err.message);
        setLoading(false);
      });
  };

  const fetchFirebaseTelemetry = () => {
    apiClient
      .get('/admin/firebase-telemetry')
      .then((res) => {
        if (res.data) {
          setFirebaseData(res.data);
        }
      })
      .catch(() => {});
  };

  const fetchAwsTelemetry = () => {
    apiClient
      .get('/admin/aws-telemetry')
      .then((res) => {
        if (res.data) {
          setAwsData(res.data);
        }
      })
      .catch(() => {});
  };

  const fetchCloudFrontTelemetry = () => {
    apiClient
      .get('/admin/aws-cloudfront-metrics')
      .then((res) => {
        if (res.data) {
          setCloudFrontData(res.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchInternalApiMetrics('30 days');
    fetchFirebaseTelemetry();
    fetchAwsTelemetry();
    fetchCloudFrontTelemetry();
  }, []);

  return (
    <Box>
      <PageHeader
        title="APIs & Services Console"
        subtitle="Self-hosted internal API telemetry, traffic spikes, error rates, and median latency metrics backed by 30-day MongoDB TTL logs."
        breadcrumbs={[{ label: 'APIs & Services' }]}
        action={
          <Button
            variant="contained"
            startIcon={<TimelineIcon />}
            sx={{ fontWeight: 700 }}
          >
            + Enable APIs and services
          </Button>
        }
      />

      {/* Time Range Selector Bar */}
      <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        spacing={1}
        sx={{ mb: 3 }}
      >
        {loading && <CircularProgress size={20} sx={{ mr: 1 }} />}
        <ButtonGroup size="small" variant="outlined">
          {TIME_RANGES.map((range) => (
            <Button
              key={range}
              onClick={() => fetchInternalApiMetrics(range)}
              variant={selectedRange === range ? 'contained' : 'outlined'}
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                px: 1.5,
                textTransform: 'none',
              }}
            >
              {selectedRange === range ? `✓ ${range}` : range}
            </Button>
          ))}
        </ButtonGroup>
      </Stack>

      {/* Telemetry Widgets Grid: Firebase & AWS S3 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Firebase Realtime Database Telemetry */}
        {firebaseData && (
          <Grid size={{ xs: 12, md: 6 }}>
            <GlassCard sx={{ p: 3, height: '100%' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CloudQueueIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Firebase Realtime Database
                  </Typography>
                </Stack>
                <Chip label="ONLINE" color="success" size="small" sx={{ fontWeight: 700 }} />
              </Stack>

              <Grid container spacing={2}>
                <Grid size={{ xs: 4 }}>
                  <Box sx={{ p: 1.5, borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', bgcolor: 'background.paper' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      CONNECTIONS
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, my: 0.5 }}>
                      {firebaseData.connections} / 200K
                    </Typography>
                    <LinearProgress variant="determinate" value={0.01} color="primary" sx={{ height: 4, borderRadius: 2 }} />
                  </Box>
                </Grid>

                <Grid size={{ xs: 4 }}>
                  <Box sx={{ p: 1.5, borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', bgcolor: 'background.paper' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      STORAGE
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, my: 0.5 }}>
                      {firebaseData.storageKb} KB
                    </Typography>
                    <LinearProgress variant="determinate" value={0.1} color="warning" sx={{ height: 4, borderRadius: 2 }} />
                  </Box>
                </Grid>

                <Grid size={{ xs: 4 }}>
                  <Box sx={{ p: 1.5, borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', bgcolor: 'background.paper' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      DOWNLOADS
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, my: 0.5 }}>
                      {firebaseData.downloadsKb} KB
                    </Typography>
                    <LinearProgress variant="determinate" value={0.25} color="info" sx={{ height: 4, borderRadius: 2 }} />
                  </Box>
                </Grid>
              </Grid>
            </GlassCard>
          </Grid>
        )}

        {/* AWS S3 & CloudFront Storage Telemetry */}
        {awsData && (
          <Grid size={{ xs: 12, md: 6 }}>
            <GlassCard sx={{ p: 3, height: '100%' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <FolderZipIcon sx={{ color: '#F59E0B' }} />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    AWS S3 Media Assets
                  </Typography>
                </Stack>
                <Chip label="ONLINE" color="success" size="small" sx={{ fontWeight: 700 }} />
              </Stack>

              <Grid container spacing={2}>
                <Grid size={{ xs: 4 }}>
                  <Box sx={{ p: 1.5, borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', bgcolor: 'background.paper' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      MEDIA ASSETS
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, my: 0.5 }}>
                      {awsData.totalObjects} files
                    </Typography>
                    <LinearProgress variant="determinate" value={0.15} color="warning" sx={{ height: 4, borderRadius: 2 }} />
                  </Box>
                </Grid>

                <Grid size={{ xs: 4 }}>
                  <Box sx={{ p: 1.5, borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', bgcolor: 'background.paper' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      STORAGE SIZE
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, my: 0.5 }}>
                      {awsData.storageMb} MB
                    </Typography>
                    <LinearProgress variant="determinate" value={0.3} color="primary" sx={{ height: 4, borderRadius: 2 }} />
                  </Box>
                </Grid>

                <Grid size={{ xs: 4 }}>
                  <Box sx={{ p: 1.5, borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', bgcolor: 'background.paper' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      PING LATENCY
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, my: 0.5 }}>
                      {awsData.latencyMs} ms
                    </Typography>
                    <LinearProgress variant="determinate" value={0.08} color="success" sx={{ height: 4, borderRadius: 2 }} />
                  </Box>
                </Grid>
              </Grid>
            </GlassCard>
          </Grid>
        )}
      </Grid>

      {/* Amazon CloudFront 6 Operational Metrics Panel */}
      {cloudFrontData && (
        <GlassCard sx={{ p: 3, mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <SpeedIcon color="secondary" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Amazon CloudFront CDN Telemetry
              </Typography>
            </Stack>
            <Chip label={`Distribution: ${cloudFrontData.distributionId}`} color="info" size="small" sx={{ fontWeight: 700 }} />
          </Stack>

          <Grid container spacing={2}>
            {/* Metric 1: Requests */}
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', bgcolor: 'background.paper' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  REQUESTS
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, my: 0.5 }}>
                  {cloudFrontData.requests?.toLocaleString()}
                </Typography>
                <LinearProgress variant="determinate" value={0.35} color="primary" sx={{ height: 4, borderRadius: 2 }} />
              </Box>
            </Grid>

            {/* Metric 2: Total Error Rate */}
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', bgcolor: 'background.paper' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  TOTAL ERROR RATE
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, my: 0.5, color: cloudFrontData.totalErrorRate > 1 ? 'error.main' : 'text.primary' }}>
                  {cloudFrontData.totalErrorRate}%
                </Typography>
                <LinearProgress variant="determinate" value={cloudFrontData.totalErrorRate} color="warning" sx={{ height: 4, borderRadius: 2 }} />
              </Box>
            </Grid>

            {/* Metric 3: Bytes Downloaded */}
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', bgcolor: 'background.paper' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  BYTES DOWNLOADED
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, my: 0.5 }}>
                  {cloudFrontData.bytesDownloaded} MB
                </Typography>
                <LinearProgress variant="determinate" value={0.4} color="info" sx={{ height: 4, borderRadius: 2 }} />
              </Box>
            </Grid>

            {/* Metric 4: Bytes Uploaded */}
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', bgcolor: 'background.paper' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  BYTES UPLOADED
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, my: 0.5 }}>
                  {cloudFrontData.bytesUploaded} MB
                </Typography>
                <LinearProgress variant="determinate" value={0.15} color="secondary" sx={{ height: 4, borderRadius: 2 }} />
              </Box>
            </Grid>

            {/* Metric 5: 4xx Error Rate */}
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', bgcolor: 'background.paper' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  4XX ERROR RATE
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, my: 0.5 }}>
                  {cloudFrontData.errorRate4xx}%
                </Typography>
                <LinearProgress variant="determinate" value={cloudFrontData.errorRate4xx} color="warning" sx={{ height: 4, borderRadius: 2 }} />
              </Box>
            </Grid>

            {/* Metric 6: 5xx Error Rate */}
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', bgcolor: 'background.paper' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  5XX ERROR RATE
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, my: 0.5, color: cloudFrontData.errorRate5xx > 0 ? 'error.main' : 'success.main' }}>
                  {cloudFrontData.errorRate5xx}%
                </Typography>
                <LinearProgress variant="determinate" value={cloudFrontData.errorRate5xx} color="error" sx={{ height: 4, borderRadius: 2 }} />
              </Box>
            </Grid>
          </Grid>
        </GlassCard>
      )}

      {/* 3 Core Analytics Charts Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Chart 1: Traffic (Requests/sec) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2.5, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Traffic
              </Typography>
              <IconButton size="small">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Requests / sec (UTC+5:30) • {selectedRange}
            </Typography>

            <Box sx={{ width: '100%', height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartSeries}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} />
                  <YAxis stroke="#94A3B8" fontSize={10} domain={[0, 0.3]} />
                  <RechartsTooltip />
                  <Line
                    type="monotone"
                    dataKey="traffic"
                    stroke="#A855F7"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#A855F7' }}
                    name="Traffic (req/s)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </GlassCard>
        </Grid>

        {/* Chart 2: Errors (%) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2.5, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Errors
              </Typography>
              <IconButton size="small">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Error percentage (%) • {selectedRange}
            </Typography>

            <Box sx={{ width: '100%', height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartSeries}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} />
                  <YAxis stroke="#94A3B8" fontSize={10} domain={[0, 100]} />
                  <RechartsTooltip />
                  <Line
                    type="monotone"
                    dataKey="errors"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#EF4444' }}
                    name="Errors (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </GlassCard>
        </Grid>

        {/* Chart 3: Median Latency (ms) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2.5, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Median latency
              </Typography>
              <IconButton size="small">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Latency (milliseconds) • {selectedRange}
            </Typography>

            <Box sx={{ width: '100%', height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartSeries}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} />
                  <YAxis stroke="#94A3B8" fontSize={10} />
                  <RechartsTooltip />
                  <Line
                    type="monotone"
                    dataKey="latency"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#10B981' }}
                    name="Median Latency (ms)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </GlassCard>
        </Grid>
      </Grid>

      {/* Enabled Google APIs & Services Table */}
      <GlassCard sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <FilterListIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              Filter ({selectedRange})
            </Typography>
          </Stack>
          <Tooltip title="Help & Google Console Metrics Guide">
            <IconButton size="small">
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 800 }} align="right">
                <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
                  <ArrowDownwardIcon fontSize="small" sx={{ fontSize: 14 }} />
                  <span>Requests</span>
                </Stack>
              </TableCell>
              <TableCell sx={{ fontWeight: 800 }} align="right">
                Errors (%)
              </TableCell>
              <TableCell sx={{ fontWeight: 800 }} align="right">
                Latency, median (ms)
              </TableCell>
              <TableCell sx={{ fontWeight: 800 }} align="right">
                Latency, 95% (ms)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {googleApis.map((api, i) => (
              <TableRow key={i} hover>
                <TableCell sx={{ fontWeight: 700, color: 'primary.main', cursor: 'pointer' }}>
                  {api.name}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>
                  {typeof api.requests === 'number' ? api.requests.toLocaleString() : api.requests}
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={typeof api.errorsPct === 'number' ? `${api.errorsPct}%` : api.errorsPct}
                    size="small"
                    color={typeof api.errorsPct === 'number' && api.errorsPct > 0 ? 'warning' : 'default'}
                    variant={typeof api.errorsPct === 'number' && api.errorsPct > 0 ? 'filled' : 'outlined'}
                    sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                  />
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  {typeof api.medianLatencyMs === 'number' ? `${api.medianLatencyMs} ms` : api.medianLatencyMs}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  {typeof api.p95LatencyMs === 'number' ? `${api.p95LatencyMs} ms` : api.p95LatencyMs}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </GlassCard>
    </Box>
  );
};
