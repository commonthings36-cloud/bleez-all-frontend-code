import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid2 as Grid,
  Typography,
  Stack,
  Chip,
  Button,
  CircularProgress,
  Avatar,
  Drawer,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import AndroidIcon from '@mui/icons-material/Android';
import LanguageIcon from '@mui/icons-material/Language';
import GroupIcon from '@mui/icons-material/Group';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ChatIcon from '@mui/icons-material/Chat';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MemoryIcon from '@mui/icons-material/Memory';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';

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
import { apiClient } from '@/services/apiClient';

export const UserwiseAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const fetchAnalytics = () => {
    setLoading(true);

    apiClient
      .get('/admin/userwise-analytics')
      .then((res) => {
        if (res.data) {
          setAnalytics(res.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRowClick = (params: any) => {
    setSelectedUser(params.row);
    setDrawerOpen(true);
  };

  const getPlatformChip = (platform: string) => {
    if (platform === 'MOBILE_APP_IOS') {
      return <Chip icon={<PhoneIphoneIcon fontSize="small" />} label="iOS App" color="secondary" size="small" sx={{ fontWeight: 800 }} />;
    } else if (platform === 'MOBILE_APP_ANDROID') {
      return <Chip icon={<AndroidIcon fontSize="small" />} label="Android App" color="success" size="small" sx={{ fontWeight: 800 }} />;
    }
    return <Chip icon={<LanguageIcon fontSize="small" />} label="Web App" color="info" size="small" sx={{ fontWeight: 800 }} />;
  };

  const columns: GridColDef[] = [
    {
      field: 'user',
      headerName: 'Traveler / User Details',
      width: 280,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ height: '100%', width: '100%', py: 0.5, cursor: 'pointer' }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.85rem', fontWeight: 800, flexShrink: 0 }}>
            {params.row.fullName ? params.row.fullName.charAt(0).toUpperCase() : 'T'}
          </Avatar>
          <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {params.row.fullName || 'Traveler'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {params.row.userEmail}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: 'primaryPlatform',
      headerName: 'Primary Platform',
      width: 170,
      renderCell: (params) => getPlatformChip(params.value),
    },
    {
      field: 'totalTripsPlanned',
      headerName: 'Trips Planned',
      width: 140,
      renderCell: (params) => (
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
          {params.value || 0} Trips
        </Typography>
      ),
    },
    {
      field: 'totalPdfsGenerated',
      headerName: 'PDFs Created',
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {params.value || 0} PDFs
        </Typography>
      ),
    },
    {
      field: 'totalChatMessages',
      headerName: 'AI Chat Messages',
      width: 160,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {params.value || 0} Msgs
        </Typography>
      ),
    },
    {
      field: 'totalWeatherLookups',
      headerName: 'Weather Lookups',
      width: 160,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {params.value || 0} Searches
        </Typography>
      ),
    },
    {
      field: 'totalExpensesLoggedUSD',
      headerName: 'Expenses ($)',
      width: 140,
      renderCell: (params) => (
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'success.main' }}>
          ${typeof params.value === 'number' ? params.value.toLocaleString() : params.value}
        </Typography>
      ),
    },
    {
      field: 'totalAiTokensUsed',
      headerName: 'AI Tokens & Cost',
      width: 170,
      renderCell: (params) => (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            {params.row.totalAiTokensUsed?.toLocaleString() || 0} Tokens
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Est. ${params.row.estimatedAiCostUSD ? params.row.estimatedAiCostUSD.toFixed(4) : '0.0000'}
          </Typography>
        </Box>
      ),
    },
  ];

  const totalTravelers = analytics?.totalTravelers ?? 0;
  const globalTrips = analytics?.globalTripsPlanned ?? 0;
  const globalExpenses = analytics?.globalExpensesUSD ?? 0;
  const globalTokens = analytics?.globalAiTokensUsed ?? 0;

  return (
    <Box>
      <PageHeader
        title="Cross-Platform & Userwise Telemetry Dashboard"
        subtitle="Monitor live traveler interactions across Mobile App (iOS / Android) and Web App, including userwise trip planning, PDF guides, AI chat, weather searches, and token spend."
        breadcrumbs={[{ label: 'User Telemetry' }]}
        action={
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchAnalytics} sx={{ fontWeight: 700 }}>
            Refresh Telemetry
          </Button>
        }
      />

      {/* 4 Executive KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <GlassCard sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  REGISTERED TRAVELERS
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5 }}>
                  {totalTravelers}
                </Typography>
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>
                  76% Mobile / 24% Web
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(124, 58, 237, 0.15)', color: '#8B5CF6', width: 48, height: 48 }}>
                <GroupIcon />
              </Avatar>
            </Stack>
          </GlassCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <GlassCard sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  CROSS-PLATFORM TRIPS
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5, color: 'primary.main' }}>
                  {globalTrips}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Mobile + Web Plans
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', width: 48, height: 48 }}>
                <FlightTakeoffIcon />
              </Avatar>
            </Stack>
          </GlassCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <GlassCard sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  TOTAL TRAVEL EXPENSES
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5, color: 'success.main' }}>
                  ${globalExpenses.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Logged by Travelers
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', width: 48, height: 48 }}>
                <AttachMoneyIcon />
              </Avatar>
            </Stack>
          </GlassCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <GlassCard sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                  GROSS AI TOKENS USED
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, my: 0.5, color: '#A855F7' }}>
                  {globalTokens.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  OpenAI & Gemini
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(168, 85, 247, 0.15)', color: '#A855F7', width: 48, height: 48 }}>
                <MemoryIcon />
              </Avatar>
            </Stack>
          </GlassCard>
        </Grid>
      </Grid>

      {/* Mobile App vs Web App Daily Activity Comparison Area Chart */}
      <GlassCard sx={{ p: 3, mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Mobile App vs Web App Active Telemetry
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Daily active user session comparison between Mobile App (iOS/Android) and Web Application
            </Typography>
          </Box>
          <Chip label="Live Cross-Platform Stream" color="secondary" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
        </Stack>

        <Box sx={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics?.dailyActivitySeries || []}>
              <defs>
                <linearGradient id="colorMobile" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorWeb" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <RechartsTooltip />
              <Area type="monotone" dataKey="mobileActivity" stroke="#EC4899" strokeWidth={2} fillOpacity={1} fill="url(#colorMobile)" name="Mobile App Sessions" />
              <Area type="monotone" dataKey="webActivity" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorWeb)" name="Web App Sessions" />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </GlassCard>

      {/* Userwise Detailed Telemetry DataGrid Table */}
      <GlassCard sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Traveler Activity & Telemetry Matrix (Userwise)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Click any traveler row to open their complete activity profile, feature usage timeline, and API logs
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 6 }}>
            <CircularProgress size={36} />
          </Box>
        ) : (
          <DataGrid
            rows={analytics?.userwiseMatrix || []}
            columns={columns}
            getRowId={(row) => row.userId || row.userEmail}
            rowHeight={68}
            onRowClick={handleRowClick}
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
              '& .MuiDataGrid-row': { cursor: 'pointer' },
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

      {/* User Profile Audit Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 380, p: 3, height: '100%', bgcolor: 'background.default' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Traveler Profile Audit
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {selectedUser && (
            <Box>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontWeight: 800, fontSize: '1.2rem' }}>
                  {selectedUser.fullName?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {selectedUser.fullName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedUser.userEmail}
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {getPlatformChip(selectedUser.primaryPlatform)}
                  </Box>
                </Box>
              </Stack>

              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 800, mb: 1, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                FEATURE FOOTPRINT MATRIX
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemIcon><FlightTakeoffIcon color="primary" /></ListItemIcon>
                  <ListItemText primary="Trips Planned" secondary={`${selectedUser.totalTripsPlanned || 0} Itineraries`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><PictureAsPdfIcon color="error" /></ListItemIcon>
                  <ListItemText primary="PDF Guides Created" secondary={`${selectedUser.totalPdfsGenerated || 0} PDFs`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><ChatIcon color="info" /></ListItemIcon>
                  <ListItemText primary="AI Chat Conversations" secondary={`${selectedUser.totalChatMessages || 0} Messages`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><WbSunnyIcon color="warning" /></ListItemIcon>
                  <ListItemText primary="Weather Lookups" secondary={`${selectedUser.totalWeatherLookups || 0} Queries`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><AttachMoneyIcon color="success" /></ListItemIcon>
                  <ListItemText primary="Total Expenses" secondary={`$${selectedUser.totalExpensesLoggedUSD?.toLocaleString() || 0}`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><MemoryIcon sx={{ color: '#A855F7' }} /></ListItemIcon>
                  <ListItemText primary="AI Tokens & Spend" secondary={`${selectedUser.totalAiTokensUsed?.toLocaleString() || 0} Tokens ($${selectedUser.estimatedAiCostUSD || '0.0000'})`} />
                </ListItem>
              </List>
            </Box>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};
