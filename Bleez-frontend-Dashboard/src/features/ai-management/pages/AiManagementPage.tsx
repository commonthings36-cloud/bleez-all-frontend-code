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
  CircularProgress,
  Avatar,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import RefreshIcon from '@mui/icons-material/Refresh';
import MemoryIcon from '@mui/icons-material/Memory';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { apiClient } from '@/services/apiClient';

const columns: GridColDef[] = [
  {
    field: 'user',
    headerName: 'Traveler / Requestor',
    width: 280,
    renderCell: (params) => (
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ height: '100%', width: '100%', py: 0.5 }}>
        <Avatar sx={{ width: 34, height: 34, bgcolor: params.row.provider === 'OPENAI' ? '#10A37F' : '#4285F4', fontSize: '0.85rem', fontWeight: 800, flexShrink: 0 }}>
          {params.row.provider === 'OPENAI' ? 'OA' : 'G'}
        </Avatar>
        <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {params.row.userEmail || '—'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {params.row.destination || 'Global Itinerary'} ({params.row.durationDays || 7} Days)
          </Typography>
        </Box>
      </Stack>
    ),
  },
  {
    field: 'provider',
    headerName: 'AI Provider',
    width: 140,
    renderCell: (params) => (
      <Chip
        label={params.value || 'OPENAI'}
        color={params.value === 'OPENAI' ? 'success' : 'primary'}
        size="small"
        sx={{ fontWeight: 800 }}
      />
    ),
  },
  {
    field: 'model',
    headerName: 'LLM Model',
    width: 160,
    renderCell: (params) => (
      <Chip label={params.value || 'gpt-4o-mini'} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
    ),
  },
  {
    field: 'requestType',
    headerName: 'Request Task',
    width: 180,
    renderCell: (params) => (
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
        {params.value || 'ITINERARY_GENERATION'}
      </Typography>
    ),
  },
  {
    field: 'promptTokens',
    headerName: 'Prompt Tokens',
    width: 130,
    renderCell: (params) => (
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {(params.value ?? 0).toLocaleString()}
      </Typography>
    ),
  },
  {
    field: 'completionTokens',
    headerName: 'Completion Tokens',
    width: 150,
    renderCell: (params) => (
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {(params.value ?? 0).toLocaleString()}
      </Typography>
    ),
  },
  {
    field: 'totalTokens',
    headerName: 'Total Tokens',
    width: 140,
    renderCell: (params) => (
      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
        {(params.value ?? 0).toLocaleString()}
      </Typography>
    ),
  },
  {
    field: 'estimatedCostUSD',
    headerName: 'Est. Cost',
    width: 130,
    renderCell: (params) => (
      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'success.main' }}>
        ${typeof params.value === 'number' ? params.value.toFixed(5) : params.value}
      </Typography>
    ),
  },
];

export const AiManagementPage: React.FC = () => {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAiTelemetry = () => {
    setLoading(true);

    apiClient
      .get('/admin/ai-telemetry')
      .then((res) => {
        if (res.data) {
          setTelemetry(res.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAiTelemetry();
  }, []);

  const totalTokens = telemetry?.totalTokensUsed ?? 0;
  const openAiCost = telemetry?.openAiCostUSD ?? 0.0;
  const geminiCost = telemetry?.geminiCostUSD ?? 0.0;
  const totalCost = telemetry?.totalCostUSD ?? 0.0;

  return (
    <Box>
      <PageHeader
        title="AI Token & Cost Telemetry Console"
        subtitle="Monitor OpenAI and Google Gemini token consumption, prompt efficiency, LLM API costs, and itinerary PDF generation logs."
        breadcrumbs={[{ label: 'AI Management' }]}
        action={
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchAiTelemetry} sx={{ fontWeight: 700 }}>
            Refresh Metrics
          </Button>
        }
      />

      {/* 4 KPI Statistics Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <GlassCard sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  TOTAL TOKENS CONSUMED
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5 }}>
                  {totalTokens.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>
                  ↗ Live API Stream
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(124, 58, 237, 0.15)', color: '#8B5CF6', width: 48, height: 48 }}>
                <MemoryIcon />
              </Avatar>
            </Stack>
          </GlassCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <GlassCard sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  OPENAI SPEND (USD)
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5, color: '#10A37F' }}>
                  ${openAiCost.toFixed(4)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {telemetry?.openAiTokens?.toLocaleString() || '4,400'} Tokens
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(16, 163, 127, 0.15)', color: '#10A37F', width: 48, height: 48 }}>
                <AutoAwesomeIcon />
              </Avatar>
            </Stack>
          </GlassCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <GlassCard sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  GEMINI SPEND (USD)
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5, color: '#4285F4' }}>
                  ${geminiCost.toFixed(4)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {telemetry?.geminiTokens?.toLocaleString() || '4,020'} Tokens
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(66, 133, 244, 0.15)', color: '#4285F4', width: 48, height: 48 }}>
                <SmartToyIcon />
              </Avatar>
            </Stack>
          </GlassCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <GlassCard sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  GROSS AI PLATFORM COST
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5, color: 'success.main' }}>
                  ${totalCost.toFixed(4)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Avg ~$0.0005 per itinerary
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', width: 48, height: 48 }}>
                <AttachMoneyIcon />
              </Avatar>
            </Stack>
          </GlassCard>
        </Grid>
      </Grid>

      {/* OpenAI vs Gemini Token Consumption Area Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <GlassCard sx={{ p: 3, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  OpenAI vs Gemini Token Usage
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Daily comparison of prompt & completion tokens consumed
                </Typography>
              </Box>
              <Chip label="Live LLM Telemetry" color="primary" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
            </Stack>

            <Box sx={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={telemetry?.dailySeries || []}>
                  <defs>
                    <linearGradient id="colorOpenAi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10A37F" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10A37F" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGemini" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4285F4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4285F4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="openAiTokens" stroke="#10A37F" strokeWidth={2} fillOpacity={1} fill="url(#colorOpenAi)" name="OpenAI Tokens" />
                  <Area type="monotone" dataKey="geminiTokens" stroke="#4285F4" strokeWidth={2} fillOpacity={1} fill="url(#colorGemini)" name="Gemini Tokens" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </GlassCard>
        </Grid>

        {/* LLM Model Cost Efficiency Table */}
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 3, height: '100%' }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Model Pricing Benchmarks
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Official API token rates per 1,000,000 tokens
              </Typography>
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Model</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>Input / 1M</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>Output / 1M</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow hover>
                  <TableCell sx={{ fontWeight: 700, color: '#10A37F' }}>gpt-4o-mini</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>$0.15</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>$0.60</TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ fontWeight: 700, color: '#4285F4' }}>gemini-1.5-flash</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>$0.075</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>$0.30</TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ fontWeight: 700, color: '#10A37F' }}>gpt-4o</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>$2.50</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>$10.00</TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ fontWeight: 700, color: '#4285F4' }}>gemini-1.5-pro</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>$1.25</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>$5.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </GlassCard>
        </Grid>
      </Grid>

      {/* Live AI Itinerary & PDF Request Log Stream */}
      <GlassCard sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Live AI Prompt & Token Request Audit Logs
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Real-time stream of itinerary generations and PDF creations with exact token usage and cost per call
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 6 }}>
            <CircularProgress size={36} />
          </Box>
        ) : (
          <DataGrid
            rows={telemetry?.recentAiLogs || []}
            columns={columns}
            rowHeight={68}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            autoHeight
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                display: 'flex',
                alignItems: 'center',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              },
              '& .MuiDataGrid-columnHeaders': {
                borderColor: 'rgba(255, 255, 255, 0.08)',
                bgcolor: 'rgba(0, 0, 0, 0.02)',
              },
            }}
          />
        )}
      </GlassCard>
    </Box>
  );
};
