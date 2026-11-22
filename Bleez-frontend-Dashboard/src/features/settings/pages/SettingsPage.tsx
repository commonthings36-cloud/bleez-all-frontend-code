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
  keyframes,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TuneIcon from '@mui/icons-material/Tune';
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

  const fadeUp = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}`;
  const isConf = (i: SettingItem) => Boolean(i.isConfigured || i.is_configured);
  const all = Object.values(categories).flat();
  const configured = all.filter(isConf).length;
  const overrides = all.filter((i) => i.source === 'DATABASE_OVERRIDE').length;
  const kpis = [
    { label: 'Total settings', value: all.length, sub: 'Across all categories', color: '#7C3AED', icon: <TuneIcon /> },
    { label: 'Configured', value: configured, sub: all.length ? `${Math.round((configured / all.length) * 100)}% ready` : '—', color: '#16A34A', icon: <CheckCircleIcon /> },
    { label: 'Missing / unset', value: all.length - configured, sub: 'Need a value', color: all.length - configured > 0 ? '#F59E0B' : '#16A34A', icon: <ErrorOutlineIcon /> },
    { label: 'Dashboard overrides', value: overrides, sub: 'Changed from this panel', color: '#0EA5E9', icon: <EditIcon /> },
  ];

  const catColor: Record<string, string> = { AI: '#7C3AED', TRAVEL: '#0EA5E9', BILLING: '#F59E0B', COMMUNICATIONS: '#EC4899', STORAGE: '#14B8A6', ROUTING: '#6366F1' };
  const accent = catColor[activeTab] || '#7C3AED';
  const activeCat = CATEGORIES.find((c) => c.id === activeTab)!;

  return (
    <Box>
      <PageHeader
        title="Settings & Integrations"
        subtitle="API keys, providers and feature switches that power Bleez. Secrets stay masked."
        breadcrumbs={[{ label: 'Platform' }, { label: 'Settings' }]}
        action={
          <Button variant="contained" startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />} onClick={fetchSettings} disabled={loading} sx={{ fontWeight: 700 }}>
            Refresh
          </Button>
        }
      />

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      <Box sx={{ display: 'grid', gap: 2, mb: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' } }}>
        {kpis.map((k, i) => (
          <GlassCard key={k.label} sx={{ p: 2.5, height: 120, animation: `${fadeUp} .45s ease ${i * 0.07}s both` }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography color="text.secondary" sx={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>{k.label}</Typography>
                <Typography sx={{ fontSize: '1.9rem', fontWeight: 800, lineHeight: 1.3, color: k.color }}>{k.value}</Typography>
              </Box>
              <Box sx={{ width: 42, height: 42, borderRadius: '12px', display: 'grid', placeItems: 'center', bgcolor: `${k.color}1a`, color: k.color }}>{k.icon}</Box>
            </Stack>
            <Typography noWrap color="text.secondary" sx={{ fontSize: '0.8rem' }}>{k.sub}</Typography>
          </GlassCard>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '270px 1fr' }, alignItems: 'start' }}>
        {/* Category list */}
        <GlassCard sx={{ p: 1.25, position: { md: 'sticky' }, top: { md: 90 } }}>
          <Stack spacing={0.5}>
            {CATEGORIES.map((cat) => {
              const items = categories[cat.id] || [];
              const done = items.filter(isConf).length;
              const on = activeTab === cat.id;
              const c = catColor[cat.id];
              const pct = items.length ? Math.round((done / items.length) * 100) : 0;
              return (
                <Box
                  key={cat.id} role="button" tabIndex={0} onClick={() => setActiveTab(cat.id)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActiveTab(cat.id)}
                  sx={{ p: 1.5, borderRadius: '12px', cursor: 'pointer', border: '1px solid', borderColor: on ? c : 'transparent', bgcolor: on ? `${c}14` : 'transparent', transition: 'all .2s', '&:hover': { bgcolor: `${c}10` } }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box sx={{ width: 34, height: 34, borderRadius: '10px', flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor: `${c}1f`, color: c }}>{cat.icon}</Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.3 }}>{cat.label}</Typography>
                      <Typography color="text.secondary" sx={{ fontSize: '0.72rem' }}>{done}/{items.length} configured</Typography>
                    </Box>
                  </Stack>
                  <LinearProgress variant="determinate" value={pct} sx={{ mt: 1, height: 4, borderRadius: 2, bgcolor: `${c}22`, '& .MuiLinearProgress-bar': { bgcolor: c, borderRadius: 2 } }} />
                </Box>
              );
            })}
          </Stack>
        </GlassCard>

        {/* Settings for the chosen category */}
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: '13px', display: 'grid', placeItems: 'center', bgcolor: `${accent}1f`, color: accent }}>{activeCat.icon}</Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', lineHeight: 1.3 }}>{activeCat.label}</Typography>
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: 'text.secondary' }}>
                <LockIcon sx={{ fontSize: 14 }} />
                <Typography sx={{ fontSize: '0.78rem' }}>Secrets are masked. Every change is written to the Audit Logs.</Typography>
              </Stack>
            </Box>
          </Stack>

          {currentItems.length === 0 ? (
            <GlassCard sx={{ p: 4 }}>
              <EmptyState title="Nothing to configure here" description={loading ? 'Loading settings…' : 'Pick another category on the left.'} />
            </GlassCard>
          ) : (
            <Stack spacing={1.75}>
              {currentItems.map((item, idx) => {
                const isSecret = Boolean(item.isSecret || item.is_secret);
                const isConfigured = isConf(item);
                const displayVal = item.displayValue || item.display_value || '';
                const isBoolean = displayVal === 'true' || displayVal === 'false';
                const isPrimaryProvider = item.key === 'app.providers.flights.primary';

                let testKey = '';
                if (item.key.includes('stripe')) testKey = 'stripe';
                else if (item.key.includes('duffel')) testKey = 'duffel';
                else if (item.key.includes('openai')) testKey = 'openai';
                else if (item.key.includes('gemini.api-key')) testKey = 'gemini';
                else if (item.key.includes('mail.host')) testKey = 'smtp';
                else if (item.key.includes('aws.s3.bucket')) testKey = 'aws';
                else if (item.key.includes('firebase')) testKey = 'firebase';
                const testResult = testKey ? testResults[testKey] : null;
                const stateColor = isConfigured ? '#16A34A' : '#EF4444';

                return (
                  <GlassCard key={item.key} sx={{ p: 2.5, animation: `${fadeUp} .4s ease ${idx * 0.04}s both`, borderLeft: `4px solid ${stateColor}` }}>
                    <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }} spacing={2}>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>{item.label}</Typography>
                          {isSecret && <Tooltip title="Masked credential"><LockIcon sx={{ fontSize: 15, color: 'text.secondary' }} /></Tooltip>}
                        </Stack>
                        <Typography color="text.secondary" sx={{ fontSize: '0.84rem', lineHeight: 1.5, mb: 1 }}>{item.description}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                          <Chip size="small" label={isConfigured ? 'Configured' : 'Not set'} sx={{ height: 24, borderRadius: '7px', fontWeight: 700, fontSize: '0.7rem', bgcolor: `${stateColor}1a`, color: stateColor }} />
                          <Chip size="small" label={item.source === 'DATABASE_OVERRIDE' ? 'Set from dashboard' : 'From server environment'} sx={{ height: 24, borderRadius: '7px', fontWeight: 600, fontSize: '0.7rem', bgcolor: item.source === 'DATABASE_OVERRIDE' ? 'rgba(99,102,241,.14)' : 'action.hover', color: item.source === 'DATABASE_OVERRIDE' ? '#6366F1' : 'text.secondary' }} />
                          <Typography color="text.secondary" sx={{ fontSize: '0.72rem', fontFamily: 'monospace' }}>{item.key}</Typography>
                        </Stack>
                      </Box>

                      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flexShrink: 0, flexWrap: 'wrap', rowGap: 1 }}>
                        {isBoolean ? (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: displayVal === 'true' ? '#16A34A' : 'text.secondary' }}>{displayVal === 'true' ? 'ON' : 'OFF'}</Typography>
                            <Switch checked={displayVal === 'true'} onChange={() => handleToggleBoolean(item, displayVal === 'true')} color="primary" />
                          </Stack>
                        ) : isPrimaryProvider ? (
                          <Select
                            size="small" value={displayVal}
                            onChange={(e) => {
                              apiClient.post('/admin/settings', { key: item.key, value: e.target.value }).then(() => {
                                enqueueSnackbar(`Primary flight engine switched to ${e.target.value}`, { variant: 'success' });
                                fetchSettings();
                              });
                            }}
                            sx={{ fontWeight: 700, minWidth: 160 }}
                          >
                            <MenuItem value="DUFFEL">Duffel Engine</MenuItem>
                            <MenuItem value="GOOGLE">Google Flights</MenuItem>
                            <MenuItem value="AMADEUS">Amadeus GDS</MenuItem>
                          </Select>
                        ) : (
                          <Box sx={{ px: 1.75, height: 38, display: 'flex', alignItems: 'center', borderRadius: '10px', bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,.05)' : 'rgba(15,23,42,.05)'), fontFamily: isSecret ? 'monospace' : 'inherit', fontSize: '0.84rem', fontWeight: 600, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {displayVal || '—'}
                          </Box>
                        )}

                        {testKey && (
                          <Tooltip title={`Test ${testKey.toUpperCase()} connection`}>
                            <span>
                              <Button size="small" variant="outlined" startIcon={testingService === testKey ? <CircularProgress size={14} /> : <NetworkCheckIcon fontSize="small" />} onClick={() => handleTestService(testKey)} disabled={testingService === testKey} sx={{ fontWeight: 700, textTransform: 'none', height: 38 }}>
                                Test
                              </Button>
                            </span>
                          </Tooltip>
                        )}
                        {!isBoolean && !isPrimaryProvider && (
                          <Button size="small" variant="contained" startIcon={<EditIcon fontSize="small" />} onClick={() => handleOpenEdit(item)} sx={{ fontWeight: 700, textTransform: 'none', height: 38 }}>
                            {isConfigured ? 'Change' : 'Set'}
                          </Button>
                        )}
                      </Stack>
                    </Stack>

                    {testResult && (
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.75, p: 1.25, borderRadius: '10px', bgcolor: testResult.status === 'CONNECTED' ? 'rgba(22,163,74,.1)' : 'rgba(245,158,11,.1)' }}>
                        {testResult.status === 'CONNECTED' ? <CheckCircleIcon sx={{ fontSize: 18, color: '#16A34A' }} /> : <ErrorOutlineIcon sx={{ fontSize: 18, color: '#F59E0B' }} />}
                        <Typography sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{testResult.status} · {testResult.latencyMs}ms · {testResult.message}</Typography>
                      </Stack>
                    )}
                  </GlassCard>
                );
              })}
            </Stack>
          )}
        </Box>
      </Box>

      {/* Edit dialog */}
      <Dialog open={Boolean(editingSetting)} onClose={() => !saving && setEditingSetting(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}>
        <Box sx={{ position: 'relative', p: 3, color: '#fff', background: `linear-gradient(120deg, #4C1D95, ${accent})` }}>
          <Box sx={{ position: 'absolute', right: -30, top: -40, width: 140, height: 140, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.1)' }} />
          <IconButton size="small" onClick={() => setEditingSetting(null)} disabled={saving} sx={{ position: 'absolute', top: 10, right: 10, color: '#fff' }} aria-label="close"><CloseIcon fontSize="small" /></IconButton>
          <Typography sx={{ opacity: 0.85, fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase' }}>Update setting</Typography>
          <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.3, position: 'relative' }}>{editingSetting?.label}</Typography>
        </Box>
        <DialogContent sx={{ pt: 3 }}>
          {editingSetting && (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">{editingSetting.description}</Typography>
              <TextField
                autoFocus label={editingSetting.label} fullWidth value={editValue} onChange={(e) => setEditValue(e.target.value)}
                type={editingSetting.isSecret && !showSecret ? 'password' : 'text'}
                placeholder={editingSetting.isSecret ? 'Paste the new secret…' : 'Enter the new value…'}
                InputProps={{
                  endAdornment: editingSetting.isSecret ? (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowSecret((prev) => !prev)} edge="end">{showSecret ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}</IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
              <Typography variant="caption" color="text.secondary">Key: <span style={{ fontFamily: 'monospace' }}>{editingSetting.key}</span></Typography>
              {editingSetting.isSecret && <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 1.25, borderRadius: '10px', bgcolor: 'rgba(245,158,11,.1)' }}><LockIcon sx={{ fontSize: 16, color: '#F59E0B' }} /><Typography sx={{ fontSize: '0.78rem' }}>The old value is never shown. Saving replaces it.</Typography></Stack>}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setEditingSetting(null)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSaveSetting} variant="contained" disabled={saving || !editValue.trim()} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null} sx={{ fontWeight: 800 }}>
            Save setting
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
