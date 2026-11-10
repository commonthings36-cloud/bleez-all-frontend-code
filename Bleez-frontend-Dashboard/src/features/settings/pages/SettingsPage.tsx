import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import PaymentIcon from '@mui/icons-material/Payment';
import EmailIcon from '@mui/icons-material/Email';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import { useSnackbar } from 'notistack';
import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { apiClient } from '@/services/apiClient';

interface SettingItem {
  key: string;
  category: string;
  label: string;
  description: string;
  isSecret: boolean;
  is_secret?: boolean;
  isConfigured: boolean;
  is_configured?: boolean;
  displayValue: string;
  display_value?: string;
  source: 'ENVIRONMENT_VARIABLE' | 'DATABASE_OVERRIDE';
  updatedAt?: string;
  updated_at?: string;
}

type CategoryType = 'AI' | 'TRAVEL' | 'BILLING' | 'COMMUNICATIONS' | 'STORAGE' | 'ROUTING';

const CATEGORIES: { id: CategoryType; label: string; icon: React.ReactElement }[] = [
  { id: 'AI', label: 'AI & Intelligence', icon: <SmartToyIcon fontSize="small" /> },
  { id: 'TRAVEL', label: 'Travel Providers', icon: <FlightTakeoffIcon fontSize="small" /> },
  { id: 'BILLING', label: 'Payments & Billing', icon: <PaymentIcon fontSize="small" /> },
  { id: 'COMMUNICATIONS', label: 'Email & SMS Auth', icon: <EmailIcon fontSize="small" /> },
  { id: 'STORAGE', label: 'Cloud & Storage', icon: <CloudQueueIcon fontSize="small" /> },
  { id: 'ROUTING', label: 'Provider Routing & Flags', icon: <AltRouteIcon fontSize="small" /> },
];

export const SettingsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState<CategoryType>('AI');
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<Record<string, SettingItem[]>>({});

  // Edit Dialog State
  const [editingSetting, setEditingSetting] = useState<SettingItem | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Connection Test States
  const [testingService, setTestingService] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { status: string; latencyMs: number; message: string }>>({});

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/settings');
      if (res.data && res.data.categories) {
        setCategories(res.data.categories);
      }
    } catch (err: any) {
      enqueueSnackbar('Could not load settings: ' + (err.message || 'Network error'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleOpenEdit = (item: SettingItem) => {
    setEditingSetting(item);
    setEditValue(item.isSecret ? '' : item.displayValue || item.display_value || '');
    setShowSecret(false);
  };

  const handleSaveSetting = async () => {
    if (!editingSetting) return;
    setSaving(true);
    try {
      const res = await apiClient.post('/admin/settings', {
        key: editingSetting.key,
        value: editValue,
      });

      if (res.data?.success) {
        enqueueSnackbar(res.data.message || 'Setting updated successfully', { variant: 'success' });
        setEditingSetting(null);
        await fetchSettings();
      } else {
        enqueueSnackbar(res.data?.message || 'Could not update setting', { variant: 'warning' });
      }
    } catch (err: any) {
      enqueueSnackbar(err.response?.data?.message || 'Update failed', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleBoolean = async (item: SettingItem, currentBool: boolean) => {
    const newVal = currentBool ? 'false' : 'true';
    try {
      const res = await apiClient.post('/admin/settings', {
        key: item.key,
        value: newVal,
      });
      if (res.data?.success) {
        enqueueSnackbar(`${item.label} set to ${newVal.toUpperCase()}`, { variant: 'info' });
        await fetchSettings();
      }
    } catch (err: any) {
      enqueueSnackbar('Toggle failed: ' + err.message, { variant: 'error' });
    }
  };

  const handleTestService = async (serviceName: string) => {
    setTestingService(serviceName);
    try {
      const res = await apiClient.post(`/admin/settings/test-connection/${serviceName}`);
      if (res.data) {
        const result = {
          status: res.data.status,
          latencyMs: res.data.latencyMs ?? res.data.latency_ms ?? 0,
          message: res.data.message || 'Completed',
        };
        setTestResults((prev) => ({ ...prev, [serviceName]: result }));

        if (res.data.status === 'CONNECTED') {
          enqueueSnackbar(`${serviceName.toUpperCase()} connected in ${result.latencyMs}ms`, { variant: 'success' });
        } else {
          enqueueSnackbar(`${serviceName.toUpperCase()}: ${result.message}`, { variant: 'warning' });
        }
      }
    } catch (err: any) {
      enqueueSnackbar('Connection test failed: ' + err.message, { variant: 'error' });
    } finally {
      setTestingService(null);
    }
  };

  const currentItems = categories[activeTab] || [];

  return (
    <Box>
      <PageHeader
        title="Platform & Integration Settings"
        subtitle="Configure AI engines, travel provider APIs, Stripe payments, SMTP mail, AWS cloud, and routing flags."
        breadcrumbs={[{ label: 'Platform' }, { label: 'Settings' }]}
        action={
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
            onClick={fetchSettings}
            disabled={loading}
            sx={{ fontWeight: 700 }}
          >
            Refresh
          </Button>
        }
      />

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* Category Tabs */}
      <GlassCard sx={{ p: 1, mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 48,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.88rem',
              gap: 1,
            },
          }}
        >
          {CATEGORIES.map((cat) => (
            <Tab
              key={cat.id}
              value={cat.id}
              label={cat.label}
              icon={cat.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </GlassCard>

      {/* Main Settings Grid */}
      <Box sx={{ display: 'grid', gap: 2.5 }}>
        {/* Banner with Security Assurance */}
        <GlassCard sx={{ p: 2, bgcolor: 'rgba(99, 102, 241, 0.04)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <LockIcon sx={{ color: '#6366F1', fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              All confidential API keys and credentials are cryptographically masked at rest. Changes are permanently audited in the{' '}
              <Typography component="span" sx={{ fontWeight: 800, color: '#6366F1' }}>
                Platform Security Audit Trail
              </Typography>
              .
            </Typography>
          </Stack>
        </GlassCard>

        {currentItems.length === 0 ? (
          <GlassCard sx={{ p: 6, textAlign: 'center' }}>
            <EmptyState title="No Settings Found" description="Select another category tab above." />
          </GlassCard>
        ) : (
          currentItems.map((item) => {
            const isSecret = Boolean(item.isSecret || item.is_secret);
            const isConfigured = Boolean(item.isConfigured || item.is_configured);
            const displayVal = item.displayValue || item.display_value || '';
            const isBoolean = displayVal === 'true' || displayVal === 'false';
            const isPrimaryProvider = item.key === 'app.providers.flights.primary';

            // Check if this item has an associated test service
            let testKey = '';
            if (item.key.includes('stripe')) testKey = 'stripe';
            else if (item.key.includes('duffel')) testKey = 'duffel';
            else if (item.key.includes('openai')) testKey = 'openai';
            else if (item.key.includes('gemini.api-key')) testKey = 'gemini';
            else if (item.key.includes('mail.host')) testKey = 'smtp';
            else if (item.key.includes('aws.s3.bucket')) testKey = 'aws';
            else if (item.key.includes('firebase')) testKey = 'firebase';

            const testResult = testKey ? testResults[testKey] : null;

            return (
              <GlassCard key={item.key} sx={{ p: 3 }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={2}
                >
                  {/* Left: Metadata & Description */}
                  <Box sx={{ maxWidth: { xs: '100%', sm: '55%' } }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        {item.label}
                      </Typography>
                      {isSecret && (
                        <Tooltip title="Masked credential">
                          <LockIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        </Tooltip>
                      )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem', mb: 1 }}>
                      {item.description}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Chip
                        size="small"
                        label={isConfigured ? 'Configured' : 'Missing / Unset'}
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          height: 20,
                          bgcolor: isConfigured ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          color: isConfigured ? '#10B981' : '#EF4444',
                        }}
                      />
                      <Chip
                        size="small"
                        label={item.source === 'DATABASE_OVERRIDE' ? 'Database Override' : 'OS Environment'}
                        sx={{
                          fontSize: '0.68rem',
                          height: 20,
                          bgcolor: item.source === 'DATABASE_OVERRIDE' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(0, 0, 0, 0.05)',
                          color: item.source === 'DATABASE_OVERRIDE' ? '#6366F1' : 'text.secondary',
                          fontWeight: 600,
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        {item.key}
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Right: Interactive Value or Controls */}
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    {isBoolean ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {displayVal === 'true' ? 'ENABLED' : 'DISABLED'}
                        </Typography>
                        <Switch
                          checked={displayVal === 'true'}
                          onChange={() => handleToggleBoolean(item, displayVal === 'true')}
                          color="primary"
                        />
                      </Stack>
                    ) : isPrimaryProvider ? (
                      <Select
                        size="small"
                        value={displayVal}
                        onChange={(e) => {
                          apiClient
                            .post('/admin/settings', { key: item.key, value: e.target.value })
                            .then(() => {
                              enqueueSnackbar(`Primary flight engine switched to ${e.target.value}`, { variant: 'success' });
                              fetchSettings();
                            });
                        }}
                        sx={{ fontWeight: 700, minWidth: 140 }}
                      >
                        <MenuItem value="DUFFEL">Duffel Engine</MenuItem>
                        <MenuItem value="GOOGLE">Google Flights</MenuItem>
                        <MenuItem value="AMADEUS">Amadeus GDS</MenuItem>
                      </Select>
                    ) : (
                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          bgcolor: 'rgba(0, 0, 0, 0.03)',
                          borderRadius: 2,
                          fontFamily: isSecret ? 'monospace' : 'inherit',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          maxWidth: { xs: 240, sm: 280 },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {displayVal || '—'}
                      </Box>
                    )}

                    {/* Test Connection Button (for active services) */}
                    {testKey && (
                      <Tooltip title={`Test ${testKey.toUpperCase()} connectivity`}>
                        <span>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={
                              testingService === testKey ? (
                                <CircularProgress size={14} />
                              ) : (
                                <NetworkCheckIcon fontSize="small" />
                              )
                            }
                            onClick={() => handleTestService(testKey)}
                            disabled={testingService === testKey}
                            sx={{ fontWeight: 700, textTransform: 'none', height: 36 }}
                          >
                            Test
                          </Button>
                        </span>
                      </Tooltip>
                    )}

                    {/* Edit Button (if not a pure switch) */}
                    {!isBoolean && !isPrimaryProvider && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<EditIcon fontSize="small" />}
                        onClick={() => handleOpenEdit(item)}
                        sx={{ fontWeight: 700, textTransform: 'none', height: 36 }}
                      >
                        Edit
                      </Button>
                    )}
                  </Stack>
                </Stack>

                {/* Show Test Results Banner if available */}
                {testResult && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: testResult.status === 'CONNECTED' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid',
                      borderColor: testResult.status === 'CONNECTED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      {testResult.status === 'CONNECTED' ? (
                        <CheckCircleIcon sx={{ fontSize: 18, color: '#10B981' }} />
                      ) : (
                        <ErrorOutlineIcon sx={{ fontSize: 18, color: '#F59E0B' }} />
                      )}
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                        {testResult.status} ({testResult.latencyMs}ms): {testResult.message}
                      </Typography>
                    </Stack>
                  </Box>
                )}
              </GlassCard>
            );
          })
        )}
      </Box>

      {/* Edit Credential / Setting Dialog */}
      <Dialog
        open={Boolean(editingSetting)}
        onClose={() => setEditingSetting(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Update {editingSetting?.label}</span>
          <IconButton size="small" onClick={() => setEditingSetting(null)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ py: 3 }}>
          {editingSetting && (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                {editingSetting.description}
              </Typography>
              <TextField
                autoFocus
                label={editingSetting.label}
                type={editingSetting.isSecret && !showSecret ? 'password' : 'text'}
                fullWidth
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={editingSetting.isSecret ? 'Enter new secret key...' : 'Enter new value...'}
                InputProps={{
                  endAdornment: editingSetting.isSecret ? (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowSecret((prev) => !prev)} edge="end">
                        {showSecret ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Setting Key: <Typography component="span" sx={{ fontFamily: 'monospace' }}>{editingSetting.key}</Typography>
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditingSetting(null)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSaveSetting}
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ fontWeight: 700 }}
          >
            Save Setting
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
