import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Grid,
  Chip,
  Tabs,
  Tab,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip,
  Divider,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Add,
  Edit,
  ContentCopy,
  Archive,
  CheckCircle,
  PhoneIphone,
  Shop,
  MonetizationOn,
  Tune,
  Speed,
  People,
  Receipt,
  AutoAwesome,
  Shield,
  Flight,
  Star,
  Refresh,
  Close,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import {
  SubscriptionPlan,
  FeatureRegistryItem,
  UsageMetricRegistryItem,
  UserSubscription,
  BillingTransaction,
  SubscriptionAnalytics,
} from '../types/subscription.types';
import { subscriptionService } from '../services/subscription.service';

const STEPS = [
  'Plan Identity',
  'Pricing Matrix',
  'Store Products',
  'Feature Matrix',
  'Quota Limits',
  'Watermark & Branding',
  'Live Simulator Review',
];

export const SubscriptionManagementPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [features, setFeatures] = useState<FeatureRegistryItem[]>([]);
  const [metrics, setMetrics] = useState<UsageMetricRegistryItem[]>([]);
  const [subscribers, setSubscribers] = useState<UserSubscription[]>([]);
  const [transactions, setTransactions] = useState<BillingTransaction[]>([]);
  const [analytics, setAnalytics] = useState<SubscriptionAnalytics | null>(null);

  // Dialog State
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [editingPlan, setEditingPlan] = useState<Partial<SubscriptionPlan>>({});

  // Feature Registry Dialog
  const [featureDialogOpen, setFeatureDialogOpen] = useState(false);
  const [newFeature, setNewFeature] = useState<Partial<FeatureRegistryItem>>({
    defaultValue: false,
    clientVisible: true,
    category: 'CORE_GENERATION',
  });

  // Metric Registry Dialog
  const [metricDialogOpen, setMetricDialogOpen] = useState(false);
  const [newMetric, setNewMetric] = useState<Partial<UsageMetricRegistryItem>>({
    defaultPeriod: 'MONTHLY',
    overagePolicy: 'HARD_BLOCK',
    supportsRollover: false,
  });

  // Simulator State
  const [simulatedPlan, setSimulatedPlan] = useState<SubscriptionPlan | null>(null);
  const [simBillingCycle, setSimBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansData, featsData, metricsData, subsData, txData, statsData] = await Promise.all([
        subscriptionService.getAllPlans(),
        subscriptionService.getAllFeatures(),
        subscriptionService.getAllMetrics(),
        subscriptionService.getAllSubscribers(),
        subscriptionService.getAllTransactions(),
        subscriptionService.getAnalytics(),
      ]);

      setPlans(plansData);
      setFeatures(featsData);
      setMetrics(metricsData);
      setSubscribers(subsData);
      setTransactions(txData);
      setAnalytics(statsData);

      if (plansData.length > 0 && !simulatedPlan) {
        setSimulatedPlan(plansData[0]);
      }
    } catch (err: any) {
      console.error('Failed to load subscription data:', err);
      enqueueSnackbar('Loaded default subscription configuration baseline', { variant: 'info' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreatePlan = () => {
    setEditingPlan({
      code: '',
      name: '',
      tagline: '',
      description: '',
      audience: 'CONSUMER',
      planType: 'PAID_RECURRING',
      status: 'ACTIVE',
      displayOrder: plans.length + 1,
      popularFlag: false,
      recommendedFlag: false,
      visibility: 'PUBLIC',
      targetCountries: ['ALL'],
      badgeText: '',
      themeGradient: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
      pricingMatrix: {
        USD: { monthly: 4.99, yearly: 49.99, trialDays: 7 },
        EUR: { monthly: 4.49, yearly: 44.99, trialDays: 7 },
      },
      storeProductMapping: {
        ios: { monthlyProductId: '', yearlyProductId: '', isValidated: true },
        android: { productId: '', monthlyBasePlanId: '', yearlyBasePlanId: '', isValidated: true },
      },
      features: features.map((f) => ({
        featureCode: f.code,
        enabled: f.defaultValue,
        highlightText: f.name,
      })),
      usageLimits: metrics.map((m) => ({
        limitCode: m.code,
        limitValue: m.code === 'AI_GENERATIONS' ? 100 : 50,
        period: (m.defaultPeriod as any) || 'MONTHLY',
        isUnlimited: false,
      })),
      marketingBullets: ['Fast AI Trip Generations', 'Personalized Travel Plans'],
      migrationPolicy: 'GRANDFATHER_EXISTING',
    });
    setActiveStep(0);
    setPlanDialogOpen(true);
  };

  const handleOpenEditPlan = (plan: SubscriptionPlan) => {
    const rawMatrix = (plan as any).pricing_matrix || plan.pricingMatrix || {};
    const usdRaw = rawMatrix.USD || {};
    const monthly = usdRaw.monthly ?? 2.99;
    const yearly = usdRaw.yearly ?? 29.99;
    const trialDays = usdRaw.trialDays ?? usdRaw.trial_days ?? 7;

    const normalizedMatrix = {
      ...rawMatrix,
      USD: {
        monthly,
        yearly,
        trialDays,
        trial_days: trialDays,
      },
    };

    const rawFeatures = (plan as any).features || [];
    const normalizedFeatures = rawFeatures.map((f: any) => ({
      ...f,
      featureCode: f.featureCode || f.feature_code,
      feature_code: f.featureCode || f.feature_code,
      enabled: !!f.enabled,
      highlightText: f.highlightText || f.highlight_text || '',
      highlight_text: f.highlightText || f.highlight_text || '',
    }));

    const rawLimits = (plan as any).usage_limits || plan.usageLimits || [];
    const normalizedLimits = rawLimits.map((l: any) => ({
      ...l,
      limitCode: l.limitCode || l.limit_code,
      limit_code: l.limitCode || l.limit_code,
      limitValue: l.limitValue ?? l.limit_value ?? 100,
      limit_value: l.limitValue ?? l.limit_value ?? 100,
      period: l.period || 'MONTHLY',
      isUnlimited: l.isUnlimited ?? l.unlimited ?? false,
      unlimited: l.isUnlimited ?? l.unlimited ?? false,
    }));

    setEditingPlan({
      ...plan,
      pricingMatrix: normalizedMatrix,
      pricing_matrix: normalizedMatrix,
      features: normalizedFeatures,
      usageLimits: normalizedLimits,
      usage_limits: normalizedLimits,
    } as any);
    setActiveStep(0);
    setPlanDialogOpen(true);
  };

  const handleClonePlan = async (plan: SubscriptionPlan) => {
    try {
      await subscriptionService.clonePlan(plan.id!, `${plan.code}_PROMO`, `${plan.name} (Copy)`);
      enqueueSnackbar(`Successfully cloned ${plan.name}`, { variant: 'success' });
      loadData();
    } catch (err: any) {
      enqueueSnackbar('Failed to clone plan', { variant: 'error' });
    }
  };

  const handleArchivePlan = async (plan: SubscriptionPlan) => {
    try {
      await subscriptionService.archivePlan(plan.id!);
      enqueueSnackbar(`Archived plan ${plan.name}`, { variant: 'success' });
      loadData();
    } catch (err: any) {
      enqueueSnackbar('Failed to archive plan', { variant: 'error' });
    }
  };

  const handleSavePlan = async () => {
    try {
      const rawMatrix = editingPlan.pricingMatrix || (editingPlan as any).pricing_matrix || {};
      const usdRaw = rawMatrix.USD || {};
      const monthly = usdRaw.monthly ?? 2.99;
      const yearly = usdRaw.yearly ?? 29.99;
      const trialDays = usdRaw.trialDays ?? usdRaw.trial_days ?? 7;

      const finalMatrix = {
        ...rawMatrix,
        USD: {
          monthly,
          yearly,
          trialDays,
          trial_days: trialDays,
        },
      };

      const finalFeatures = (editingPlan.features || []).map((f: any) => ({
        featureCode: f.featureCode || f.feature_code,
        feature_code: f.featureCode || f.feature_code,
        enabled: !!f.enabled,
        highlightText: f.highlightText || f.highlight_text || '',
        highlight_text: f.highlightText || f.highlight_text || '',
      }));

      const finalLimits = (editingPlan.usageLimits || (editingPlan as any).usage_limits || []).map((l: any) => ({
        limitCode: l.limitCode || l.limit_code,
        limit_code: l.limitCode || l.limit_code,
        limitValue: l.limitValue ?? l.limit_value ?? 100,
        limit_value: l.limitValue ?? l.limit_value ?? 100,
        period: l.period || 'MONTHLY',
        isUnlimited: l.isUnlimited ?? l.unlimited ?? false,
        unlimited: l.isUnlimited ?? l.unlimited ?? false,
      }));

      const payload = {
        ...editingPlan,
        pricingMatrix: finalMatrix,
        pricing_matrix: finalMatrix,
        features: finalFeatures,
        usageLimits: finalLimits,
        usage_limits: finalLimits,
      };

      if (editingPlan.id) {
        await subscriptionService.updatePlan(editingPlan.id, payload as SubscriptionPlan);
        enqueueSnackbar('Plan updated successfully (version incremented)', { variant: 'success' });
      } else {
        await subscriptionService.createPlan(payload as SubscriptionPlan);
        enqueueSnackbar('New plan created successfully', { variant: 'success' });
      }
      setPlanDialogOpen(false);
      loadData();
    } catch (err: any) {
      enqueueSnackbar('Failed to save plan: ' + err.message, { variant: 'error' });
    }
  };

  const handleSaveFeature = async () => {
    if (!newFeature.code || !newFeature.name) return;
    try {
      await subscriptionService.registerFeature(newFeature as FeatureRegistryItem);
      enqueueSnackbar('New feature registered in catalog', { variant: 'success' });
      setFeatureDialogOpen(false);
      loadData();
    } catch (err: any) {
      enqueueSnackbar('Failed to register feature', { variant: 'error' });
    }
  };

  const handleSaveMetric = async () => {
    if (!newMetric.code || !newMetric.name || !newMetric.unit) return;
    try {
      await subscriptionService.registerMetric(newMetric as UsageMetricRegistryItem);
      enqueueSnackbar('New metric quota registered', { variant: 'success' });
      setMetricDialogOpen(false);
      loadData();
    } catch (err: any) {
      enqueueSnackbar('Failed to register metric', { variant: 'error' });
    }
  };

  // Plan DataGrid Columns
  const planColumns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Plan & Code',
      width: 260,
      minWidth: 200,
      renderCell: (params) => (
        <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ py: 1 }}>
          <Box
            sx={{
              minWidth: 38,
              width: 38,
              height: 38,
              mt: 0.3,
              borderRadius: '10px',
              background: params.row.theme_gradient || params.row.themeGradient || 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.85rem',
              flexShrink: 0,
            }}
          >
            {(params.row.code || '??').substring(0, 2)}
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.3 }}>
              {params.row.name || '—'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
              Code: <strong>{params.row.code || '—'}</strong> (v{params.row.version || 1})
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: 'audience',
      headerName: 'Audience / Type',
      width: 170,
      renderCell: (params) => (
        <Stack direction="column" spacing={0.5} justifyContent="center" sx={{ height: '100%' }}>
          <Chip
            label={params.value || 'CONSUMER'}
            size="small"
            color={params.value === 'B2B' ? 'warning' : 'primary'}
            sx={{ fontWeight: 800 }}
          />
          <Typography variant="caption" color="text.secondary">
            {params.row.planType || 'PAID_RECURRING'}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'pricing',
      headerName: 'USD Pricing',
      width: 180,
      renderCell: (params) => {
        // Backend returns snake_case: pricing_matrix; fallback to camelCase for safety
        const matrix = params.row.pricing_matrix || params.row.pricingMatrix;
        const usd = matrix?.USD;
        const monthly = usd?.monthly ?? 0;
        const yearly = usd?.yearly ?? 0;
        const trialDays = usd?.trial_days ?? usd?.trialDays ?? 0;
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: monthly === 0 ? 'text.secondary' : 'success.main' }}>
              ${monthly} / mo
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ${yearly} / yr ({trialDays}d trial)
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'usage_limits',
      headerName: 'AI Generation Quota',
      width: 200,
      renderCell: (params) => {
        // Backend returns snake_case: usage_limits with limit_code / limit_value
        const limits = params.row.usage_limits || params.row.usageLimits || [];
        const aiLimit = limits.find(
          (l: any) => (l.limit_code || l.limitCode) === 'AI_GENERATIONS'
        );
        const value = aiLimit?.limit_value ?? aiLimit?.limitValue;
        const period = aiLimit?.period;
        const isUnlimited = aiLimit?.unlimited ?? aiLimit?.isUnlimited;
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            <Chip
              icon={<AutoAwesome fontSize="small" />}
              label={
                aiLimit
                  ? isUnlimited
                    ? 'Unlimited'
                    : `${value?.toLocaleString()} ${period === 'LIFETIME' ? 'Lifetime' : '/ mo'}`
                  : 'Unlimited'
              }
              size="small"
              variant="outlined"
              color="info"
              sx={{ fontWeight: 700 }}
            />
          </Box>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value || 'ACTIVE'}
          size="small"
          color={params.value === 'ACTIVE' ? 'success' : params.value === 'DRAFT' ? 'warning' : 'default'}
          sx={{ fontWeight: 800 }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 170,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ height: '100%' }}>
          <Tooltip title="Edit Plan (Creates new version)">
            <IconButton size="small" color="primary" onClick={() => handleOpenEditPlan(params.row)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clone Plan into New Draft">
            <IconButton size="small" color="secondary" onClick={() => handleClonePlan(params.row)}>
              <ContentCopy fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Archive Plan">
            <IconButton size="small" color="error" onClick={() => handleArchivePlan(params.row)}>
              <Archive fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader
        title="Subscription & Monetization Studio"
        subtitle="100% configuration-driven subscription plans, dynamic feature catalog, resource quotas, and in-app purchase mappings"
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleOpenCreatePlan}
            sx={{ fontWeight: 800, borderRadius: '10px' }}
          >
            Create Custom Plan
          </Button>
        }
      />

      {/* Analytics KPI Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <GlassCard sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  ESTIMATED MRR
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'success.main', mt: 0.5 }}>
                  ${analytics?.estimatedMRR || 0}
                </Typography>
              </Box>
              <MonetizationOn sx={{ fontSize: 36, color: 'success.main', opacity: 0.8 }} />
            </Stack>
          </GlassCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <GlassCard sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  ACTIVE SUBSCRIBERS
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.5 }}>
                  {analytics?.activeSubscribers || 0}
                </Typography>
              </Box>
              <People sx={{ fontSize: 36, color: 'primary.main', opacity: 0.8 }} />
            </Stack>
          </GlassCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <GlassCard sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  EXPLORER USERS
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', mt: 0.5 }}>
                  {analytics?.explorerSubscribers || 0}
                </Typography>
              </Box>
              <Flight sx={{ fontSize: 36, color: 'primary.main', opacity: 0.8 }} />
            </Stack>
          </GlassCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <GlassCard sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  BUSINESS ACCOUNTS
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'warning.main', mt: 0.5 }}>
                  {analytics?.businessSubscribers || 0}
                </Typography>
              </Box>
              <Shield sx={{ fontSize: 36, color: 'warning.main', opacity: 0.8 }} />
            </Stack>
          </GlassCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <GlassCard sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  FREE STARTERS
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.secondary', mt: 0.5 }}>
                  {analytics?.freeUsers || 0}
                </Typography>
              </Box>
              <AutoAwesome sx={{ fontSize: 36, color: 'text.secondary', opacity: 0.8 }} />
            </Stack>
          </GlassCard>
        </Grid>
      </Grid>

      {/* Tabs */}
      <GlassCard sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab icon={<Tune fontSize="small" />} iconPosition="start" label={`Subscription Plans (${plans.length})`} />
          <Tab icon={<Speed fontSize="small" />} iconPosition="start" label="Live Paywall Simulator" />
          <Tab icon={<Star fontSize="small" />} iconPosition="start" label={`Feature Catalog (${features.length})`} />
          <Tab icon={<AutoAwesome fontSize="small" />} iconPosition="start" label={`Metric Quotas (${metrics.length})`} />
          <Tab icon={<People fontSize="small" />} iconPosition="start" label={`Subscribers (${subscribers.length})`} />
          <Tab icon={<Receipt fontSize="small" />} iconPosition="start" label={`Store Transactions (${transactions.length})`} />
        </Tabs>

        {loading && <LinearProgress />}

        {/* Tab 0: Plans DataGrid */}
        {activeTab === 0 && (
          <Box sx={{ width: '100%', p: 2 }}>
            <DataGrid
              rows={plans}
              columns={planColumns}
              getRowId={(row) => row.id || row.code}
              getRowHeight={() => 'auto'}
              pageSizeOptions={[5, 10, 20]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              disableRowSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell': {
                  py: 1.5,
                  alignItems: 'center',
                },
              }}
            />
          </Box>
        )}

        {/* Tab 1: Live Paywall Simulator */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Simulator Controls
                </Typography>
                <TextField
                  select
                  fullWidth
                  label="Select Plan to Preview"
                  value={simulatedPlan?.code || ''}
                  onChange={(e) => {
                    const found = plans.find((p) => p.code === e.target.value);
                    if (found) setSimulatedPlan(found);
                  }}
                  sx={{ mb: 2 }}
                >
                  {plans.map((p) => (
                    <MenuItem key={p.code} value={p.code}>
                      {p.name} ({p.code})
                    </MenuItem>
                  ))}
                </TextField>

                <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                  <Button
                    variant={simBillingCycle === 'monthly' ? 'contained' : 'outlined'}
                    onClick={() => setSimBillingCycle('monthly')}
                    sx={{ flexGrow: 1 }}
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={simBillingCycle === 'yearly' ? 'contained' : 'outlined'}
                    onClick={() => setSimBillingCycle('yearly')}
                    sx={{ flexGrow: 1 }}
                  >
                    Annual (Save ~20%)
                  </Button>
                </Stack>

                <Alert severity="info" sx={{ mb: 2 }}>
                  This interactive paywall preview matches what is rendered in the iOS StoreKit paywall sheet, Android Play Store dialog, and Web paywall modal.
                </Alert>
              </Grid>

              {/* Paywall Preview Card */}
              <Grid item xs={12} md={8}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 700 }}>
                  CLIENT PAYWALL PREVIEW:
                </Typography>
                {simulatedPlan && (
                  <Card
                    sx={{
                      maxWidth: 480,
                      mx: 'auto',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <Box
                      sx={{
                        p: 3,
                        background: simulatedPlan.themeGradient || 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                        color: '#fff',
                        textAlign: 'center',
                      }}
                    >
                      {simulatedPlan.badgeText && (
                        <Chip
                          label={simulatedPlan.badgeText}
                          size="small"
                          sx={{ bgcolor: '#fff', color: '#000', fontWeight: 900, mb: 1 }}
                        />
                      )}
                      <Typography variant="h4" sx={{ fontWeight: 900 }}>
                        {simulatedPlan.name}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ opacity: 0.9, mt: 0.5 }}>
                        {simulatedPlan.tagline || simulatedPlan.description}
                      </Typography>

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="h3" sx={{ fontWeight: 900 }}>
                          $
                          {(() => {
                            const matrix = simulatedPlan.pricingMatrix;
                            const usd = matrix?.USD;
                            return simBillingCycle === 'monthly' ? (usd?.monthly ?? 0) : (usd?.yearly ?? 0);
                          })()}
                          <Typography component="span" variant="h6" sx={{ fontWeight: 600 }}>
                            /{simBillingCycle === 'monthly' ? 'mo' : 'yr'}
                          </Typography>
                        </Typography>
                        {(() => {
                          const matrix = simulatedPlan.pricingMatrix;
                          const trialDays = matrix?.USD?.trialDays;
                          return trialDays ? (
                            <Typography variant="caption" sx={{ opacity: 0.9 }}>
                              Includes {trialDays}-Day Free Trial
                            </Typography>
                          ) : null;
                        })()}
                      </Box>
                    </Box>

                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                        WHAT'S INCLUDED:
                      </Typography>
                      <Stack spacing={1.5}>
                        {(simulatedPlan.marketingBullets || []).map((bullet: string, idx: number) => (
                          <Stack key={idx} direction="row" spacing={1.5} alignItems="center">
                            <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {bullet}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>

                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        sx={{
                          mt: 3,
                          py: 1.5,
                          borderRadius: '12px',
                          fontWeight: 900,
                          background: simulatedPlan.themeGradient || 'primary.main',
                        }}
                      >
                        {simulatedPlan.pricingMatrix?.USD?.trialDays
                          ? `Start ${simulatedPlan.pricingMatrix.USD.trialDays}-Day Free Trial`
                          : `Subscribe to ${simulatedPlan.name}`}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 2: Feature Catalog */}
        {activeTab === 2 && (
          <Box sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Dynamic Feature Registry
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => setFeatureDialogOpen(true)}
                sx={{ fontWeight: 800 }}
              >
                Register New Feature
              </Button>
            </Stack>
            <Grid container spacing={2}>
              {features.map((f) => (
                <Grid item xs={12} sm={6} md={4} key={f.code}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          {f.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Key: <strong>{f.code}</strong>
                        </Typography>
                      </Box>
                      <Chip label={f.category} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.8rem' }}>
                      {f.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Tab 3: Metric Quotas */}
        {activeTab === 3 && (
          <Box sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Dynamic Usage Metric Quotas
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => setMetricDialogOpen(true)}
                sx={{ fontWeight: 800 }}
              >
                Define New Metric
              </Button>
            </Stack>
            <Grid container spacing={2}>
              {metrics.map((m) => (
                <Grid item xs={12} sm={6} md={3} key={m.code}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {m.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Key: <strong>{m.code}</strong>
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                      <Chip label={`Unit: ${m.unit}`} size="small" color="primary" variant="outlined" />
                      <Chip label={m.defaultPeriod} size="small" />
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Tab 4: Subscribers */}
        {activeTab === 4 && (
          <Box sx={{ height: 450, width: '100%', p: 2 }}>
            <DataGrid
              rows={subscribers}
              columns={[
                { field: 'userId', headerName: 'User ID', width: 220 },
                { field: 'planCode', headerName: 'Plan', width: 140 },
                { field: 'platform', headerName: 'Platform / Store', width: 180 },
                {
                  field: 'status',
                  headerName: 'Subscription Status',
                  width: 140,
                  renderCell: (params) => (
                    <Chip label={params.value} color="success" size="small" sx={{ fontWeight: 800 }} />
                  ),
                },
                { field: 'currentPeriodEndsAt', headerName: 'Renews / Expires At', width: 220 },
              ]}
              getRowId={(row) => row.id}
              pageSizeOptions={[5, 10]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            />
          </Box>
        )}

        {/* Tab 5: Transactions */}
        {activeTab === 5 && (
          <Box sx={{ height: 450, width: '100%', p: 2 }}>
            <DataGrid
              rows={transactions}
              columns={[
                { field: 'transactionId', headerName: 'Transaction ID', width: 220 },
                { field: 'userId', headerName: 'User ID', width: 180 },
                { field: 'provider', headerName: 'Store Provider', width: 140 },
                {
                  field: 'amount',
                  headerName: 'Amount',
                  width: 120,
                  renderCell: (params) => `$${params.value} USD`,
                },
                { field: 'transactionType', headerName: 'Type', width: 160 },
                {
                  field: 'status',
                  headerName: 'Status',
                  width: 120,
                  renderCell: (params) => (
                    <Chip label={params.value} color="success" size="small" sx={{ fontWeight: 800 }} />
                  ),
                },
              ]}
              getRowId={(row) => row.id}
              pageSizeOptions={[5, 10]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            />
          </Box>
        )}
      </GlassCard>

      {/* Multi-Step Plan Builder Dialog */}
      <Dialog
        open={planDialogOpen}
        onClose={() => setPlanDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', minHeight: 600 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {editingPlan.id ? `Edit Plan: ${editingPlan.name}` : 'Create Custom Subscription Plan'}
          </Typography>
          <IconButton onClick={() => setPlanDialogOpen(false)} size="small" aria-label="close">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step 0: Plan Identity */}
          {activeStep === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Internal Code (e.g. PRO, VIP)"
                  value={editingPlan.code || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, code: e.target.value.toUpperCase() })}
                  disabled={!!editingPlan.id}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Plan Name"
                  value={editingPlan.name || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Target Audience"
                  value={editingPlan.audience || 'CONSUMER'}
                  onChange={(e) => setEditingPlan({ ...editingPlan, audience: e.target.value as any })}
                >
                  <MenuItem value="CONSUMER">Consumer / Individual</MenuItem>
                  <MenuItem value="B2B">B2B Organization / Agency</MenuItem>
                  <MenuItem value="PARTNER">Partner</MenuItem>
                  <MenuItem value="PROMOTIONAL">Promotional / Seasonal</MenuItem>
                  <MenuItem value="CUSTOM">Custom Enterprise</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Display Badge Text (e.g. POPULAR, BEST VALUE)"
                  value={editingPlan.badgeText || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, badgeText: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tagline / Marketing Subtitle"
                  value={editingPlan.tagline || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, tagline: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Full Description"
                  value={editingPlan.description || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                />
              </Grid>
            </Grid>
          )}

          {/* Step 1: Pricing Matrix */}
          {activeStep === 1 && (() => {
            const matrix = editingPlan.pricingMatrix || (editingPlan as any).pricing_matrix || {};
            const usd = matrix.USD || {};
            const curMonthly = usd.monthly ?? 2.99;
            const curYearly = usd.yearly ?? 29.99;
            const curTrial = usd.trialDays ?? usd.trial_days ?? 7;

            const updatePriceDetail = (newMonthly: number, newYearly: number, newTrialDays: number) => {
              const updatedUSD = {
                ...usd,
                monthly: newMonthly,
                yearly: newYearly,
                trialDays: newTrialDays,
                trial_days: newTrialDays,
              };
              const updatedMatrix = {
                ...matrix,
                USD: updatedUSD,
              };
              setEditingPlan({
                ...editingPlan,
                pricingMatrix: updatedMatrix,
                pricing_matrix: updatedMatrix,
              } as any);
            };

            return (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="USD Monthly Price ($)"
                    value={curMonthly}
                    onChange={(e) => updatePriceDetail(parseFloat(e.target.value) || 0, curYearly, curTrial)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="USD Yearly Price ($)"
                    value={curYearly}
                    onChange={(e) => updatePriceDetail(curMonthly, parseFloat(e.target.value) || 0, curTrial)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Free Trial Period (Days)"
                    value={curTrial}
                    onChange={(e) => updatePriceDetail(curMonthly, curYearly, parseInt(e.target.value) || 0)}
                  />
                </Grid>
              </Grid>
            );
          })()}

          {/* Step 2: Store Products */}
          {activeStep === 2 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Alert severity="info">
                  Map store in-app purchase product IDs configured in Apple App Store Connect and Google Play Console.
                </Alert>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="iOS Monthly Product ID"
                  placeholder="com.aitravelglobe.plan.monthly"
                  value={editingPlan.storeProductMapping?.ios?.monthlyProductId || ''}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      storeProductMapping: {
                        ...editingPlan.storeProductMapping,
                        ios: {
                          ...editingPlan.storeProductMapping?.ios,
                          monthlyProductId: e.target.value,
                        },
                      },
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Android Subscription ID"
                  placeholder="plan_subscription"
                  value={editingPlan.storeProductMapping?.android?.productId || ''}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      storeProductMapping: {
                        ...editingPlan.storeProductMapping,
                        android: {
                          ...editingPlan.storeProductMapping?.android,
                          productId: e.target.value,
                        },
                      },
                    })
                  }
                />
              </Grid>
            </Grid>
          )}

          {/* Step 3: Feature Matrix */}
          {activeStep === 3 && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>
                TOGGLE INCLUDED FEATURES:
              </Typography>
              <Grid container spacing={1.5}>
                {features.map((feat) => {
                  const planFeats = editingPlan.features || (editingPlan as any).features || [];
                  const planFeat = planFeats.find((f: any) => (f.featureCode || f.feature_code) === feat.code);
                  const isChecked = planFeat ? planFeat.enabled : false;
                  return (
                    <Grid item xs={12} sm={6} key={feat.code}>
                      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '10px' }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={isChecked}
                              onChange={(e) => {
                                const nextFeats = planFeats.filter(
                                  (f: any) => (f.featureCode || f.feature_code) !== feat.code
                                );
                                nextFeats.push({
                                  featureCode: feat.code,
                                  feature_code: feat.code,
                                  enabled: e.target.checked,
                                  highlightText: feat.name,
                                  highlight_text: feat.name,
                                });
                                setEditingPlan({ ...editingPlan, features: nextFeats });
                              }}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {feat.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {feat.category}
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

          {/* Step 4: Quota Limits */}
          {activeStep === 4 && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>
                CONFIGURE RESOURCE QUOTA LIMITS:
              </Typography>
              <Grid container spacing={2}>
                {metrics.map((metric) => {
                  const planLimits = editingPlan.usageLimits || (editingPlan as any).usage_limits || [];
                  const limit = planLimits.find((l: any) => (l.limitCode || l.limit_code) === metric.code);
                  const limitVal = limit ? (limit.limitValue ?? limit.limit_value ?? 100) : 100;
                  const periodVal = limit ? (limit.period || 'MONTHLY') : 'MONTHLY';
                  return (
                    <Grid item xs={12} sm={6} key={metric.code}>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          {metric.name}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                          <TextField
                            type="number"
                            size="small"
                            label={`Limit (${metric.unit})`}
                            value={limitVal}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              const nextLimits = planLimits.filter(
                                (l: any) => (l.limitCode || l.limit_code) !== metric.code
                              );
                              nextLimits.push({
                                limitCode: metric.code,
                                limit_code: metric.code,
                                limitValue: val,
                                limit_value: val,
                                period: periodVal,
                                isUnlimited: false,
                                unlimited: false,
                              });
                              setEditingPlan({ ...editingPlan, usageLimits: nextLimits, usage_limits: nextLimits } as any);
                            }}
                            sx={{ flexGrow: 1 }}
                          />
                          <TextField
                            select
                            size="small"
                            label="Period"
                            value={periodVal}
                            onChange={(e) => {
                              const p = e.target.value as any;
                              const nextLimits = planLimits.filter(
                                (l: any) => (l.limitCode || l.limit_code) !== metric.code
                              );
                              nextLimits.push({
                                limitCode: metric.code,
                                limit_code: metric.code,
                                limitValue: limitVal,
                                limit_value: limitVal,
                                period: p,
                                isUnlimited: false,
                                unlimited: false,
                              });
                              setEditingPlan({ ...editingPlan, usageLimits: nextLimits, usage_limits: nextLimits } as any);
                            }}
                            sx={{ width: 130 }}
                          >
                            <MenuItem value="LIFETIME">Lifetime</MenuItem>
                            <MenuItem value="DAILY">Daily</MenuItem>
                            <MenuItem value="MONTHLY">Monthly</MenuItem>
                            <MenuItem value="YEARLY">Yearly</MenuItem>
                          </TextField>
                        </Stack>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

          {/* Step 5: Watermark & Branding */}
          {activeStep === 5 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Theme Gradient (CSS)"
                  value={editingPlan.themeGradient || 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)'}
                  onChange={(e) => setEditingPlan({ ...editingPlan, themeGradient: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Migration Policy on Edit"
                  value={editingPlan.migrationPolicy || 'GRANDFATHER_EXISTING'}
                  onChange={(e) => setEditingPlan({ ...editingPlan, migrationPolicy: e.target.value as any })}
                >
                  <MenuItem value="GRANDFATHER_EXISTING">
                    Grandfather Existing Subscribers (Keep their original entitlements)
                  </MenuItem>
                  <MenuItem value="MIGRATE_ON_RENEWAL">Migrate on Next Renewal</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          )}

          {/* Step 6: Review */}
          {activeStep === 6 && (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                Review complete! Ready to save configuration for <strong>{editingPlan.name}</strong>.
              </Alert>
              <Typography variant="body2">
                <strong>Audience:</strong> {editingPlan.audience}
              </Typography>
              <Typography variant="body2">
                <strong>Price:</strong> ${editingPlan.pricingMatrix?.USD?.monthly}/mo ($
                {editingPlan.pricingMatrix?.USD?.yearly}/yr)
              </Typography>
              <Typography variant="body2">
                <strong>Features:</strong> {editingPlan.features?.filter((f) => f.enabled).length} enabled
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
          <Button color="error" variant="outlined" onClick={() => setPlanDialogOpen(false)} sx={{ fontWeight: 700, borderRadius: '10px' }}>
            Cancel
          </Button>
          <Box>
            <Button disabled={activeStep === 0} onClick={() => setActiveStep((s) => s - 1)} sx={{ mr: 1, fontWeight: 700 }}>
              Back
            </Button>
            {activeStep < STEPS.length - 1 ? (
              <Button variant="contained" onClick={() => setActiveStep((s) => s + 1)} sx={{ fontWeight: 700, borderRadius: '10px' }}>
                Next
              </Button>
            ) : (
              <Button variant="contained" color="success" onClick={handleSavePlan} sx={{ fontWeight: 800, borderRadius: '10px' }}>
                Save & Publish Plan
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>

      {/* Feature Registration Dialog */}
      <Dialog open={featureDialogOpen} onClose={() => setFeatureDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Register New Feature in Catalog</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Feature Code (e.g. VIP_CONCIERGE)"
              value={newFeature.code || ''}
              onChange={(e) => setNewFeature({ ...newFeature, code: e.target.value.toUpperCase() })}
            />
            <TextField
              fullWidth
              label="Display Name"
              value={newFeature.name || ''}
              onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
            />
            <TextField
              select
              fullWidth
              label="Category"
              value={newFeature.category || 'CORE_GENERATION'}
              onChange={(e) => setNewFeature({ ...newFeature, category: e.target.value as any })}
            >
              <MenuItem value="CORE_GENERATION">Core Generation</MenuItem>
              <MenuItem value="EXPORT_OUTPUT">Export & Output</MenuItem>
              <MenuItem value="BRANDING_DESIGN">Branding & Design</MenuItem>
              <MenuItem value="B2B_COLLABORATION">B2B Collaboration</MenuItem>
              <MenuItem value="TRAVEL_INTELLIGENCE">Travel Intelligence</MenuItem>
            </TextField>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Description"
              value={newFeature.description || ''}
              onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setFeatureDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveFeature} sx={{ fontWeight: 800 }}>
            Register Feature
          </Button>
        </DialogActions>
      </Dialog>

      {/* Metric Registration Dialog */}
      <Dialog open={metricDialogOpen} onClose={() => setMetricDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Define New Usage Quota Metric</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Metric Code (e.g. API_CALLS)"
              value={newMetric.code || ''}
              onChange={(e) => setNewMetric({ ...newMetric, code: e.target.value.toUpperCase() })}
            />
            <TextField
              fullWidth
              label="Metric Name"
              value={newMetric.name || ''}
              onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Unit (e.g. calls, MB, trips, exports)"
              value={newMetric.unit || ''}
              onChange={(e) => setNewMetric({ ...newMetric, unit: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setMetricDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveMetric} sx={{ fontWeight: 800 }}>
            Define Metric
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionManagementPage;
