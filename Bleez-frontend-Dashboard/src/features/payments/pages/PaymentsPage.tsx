import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Chip, InputAdornment, Stack, Tab, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { apiClient } from '@/services/apiClient';
import type { BillingTransaction } from '@/features/subscriptions/types/subscription.types';

interface ProviderReadiness {
  provider: string;
  enabled: boolean;
  environment?: string;
  configured: boolean;
  status?: string;
  missingRequirements?: string[];
}

const txStatusColor = (s?: string): 'success' | 'warning' | 'error' | 'default' => {
  const v = (s || '').toUpperCase();
  if (['VERIFIED', 'SUCCESS', 'SUCCEEDED', 'COMPLETED', 'PAID'].includes(v)) return 'success';
  if (['PENDING', 'PROCESSING'].includes(v)) return 'warning';
  if (['FAILED', 'REFUNDED', 'REVOKED', 'CANCELLED'].includes(v)) return 'error';
  return 'default';
};

const columns: GridColDef<BillingTransaction>[] = [
  { field: 'transactionId', headerName: 'Transaction', flex: 1, minWidth: 220 },
  { field: 'provider', headerName: 'Provider', width: 130 },
  { field: 'transactionType', headerName: 'Type', width: 150 },
  { field: 'productId', headerName: 'Product', width: 180 },
  {
    field: 'amount',
    headerName: 'Amount',
    width: 140,
    type: 'number',
    valueFormatter: (_v: number, row: BillingTransaction) =>
      row.amount == null ? '—' : `${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${row.currency || ''}`,
  },
  { field: 'status', headerName: 'Status', width: 130, renderCell: (p) => <Chip size="small" label={p.value} color={txStatusColor(p.value)} sx={{ fontWeight: 700 }} /> },
  { field: 'userId', headerName: 'User ID', width: 220 },
  { field: 'createdAt', headerName: 'Created', width: 180, valueFormatter: (v: string) => (v ? new Date(v).toLocaleString() : '—') },
];

export const PaymentsPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [transactions, setTransactions] = useState<BillingTransaction[]>([]);
  const [providers, setProviders] = useState<ProviderReadiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [tx, prov] = await Promise.allSettled([
      apiClient.get('/admin/subscriptions/transactions'),
      apiClient.get('/payments/providers/readiness'),
    ]);
    if (tx.status === 'fulfilled') setTransactions(Array.isArray(tx.value.data) ? tx.value.data : []);
    else setError('Could not load transactions.');
    if (prov.status === 'fulfilled') setProviders(prov.value.data?.providers ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter((t) => [t.transactionId, t.provider, t.productId, t.status, t.userId, t.transactionType].some((v) => (v || '').toLowerCase().includes(q)));
  }, [transactions, query]);

  // Revenue is summed per currency from verified/successful transactions only.
  const revenueByCurrency = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter((t) => txStatusColor(t.status) === 'success' && t.amount != null).forEach((t) => {
      const c = t.currency || '—';
      map[c] = (map[c] || 0) + (t.amount || 0);
    });
    return Object.entries(map);
  }, [transactions]);

  return (
    <Box>
      <PageHeader
        title="Payments"
        subtitle="Billing transactions and payment provider status."
        breadcrumbs={[{ label: 'Payments' }]}
        action={<Button variant="outlined" startIcon={<RefreshIcon />} onClick={load} disabled={loading}>Refresh</Button>}
      />
      {error && <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={load}>Retry</Button>}>{error}</Alert>}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <GlassCard sx={{ p: 2.5, flex: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Transactions</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>{loading ? '…' : transactions.length.toLocaleString()}</Typography>
        </GlassCard>
        <GlassCard sx={{ p: 2.5, flex: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Verified revenue</Typography>
          {revenueByCurrency.length === 0 ? (
            <Typography variant="h5" sx={{ fontWeight: 800 }}>{loading ? '…' : '—'}</Typography>
          ) : (
            <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
              {revenueByCurrency.map(([c, v]) => (
                <Typography key={c} variant="h4" sx={{ fontWeight: 800 }}>{v.toLocaleString(undefined, { minimumFractionDigits: 2 })} <Typography component="span" color="text.secondary">{c}</Typography></Typography>
              ))}
            </Stack>
          )}
        </GlassCard>
      </Stack>

      <GlassCard sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Transactions" />
          <Tab label={`Providers (${providers.length})`} />
        </Tabs>

        {tab === 0 && (
          <>
            <TextField
              size="small"
              placeholder="Search transaction, user, provider, status…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{ mb: 2, width: { xs: '100%', sm: 380 } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            />
            {!loading && filtered.length === 0 ? (
              <EmptyState title="No transactions" description={query ? 'Nothing matches your search.' : 'No billing transactions have been recorded yet.'} />
            ) : (
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <DataGrid
                  rows={filtered}
                  columns={columns}
                  loading={loading}
                  autoHeight
                  disableRowSelectionOnClick
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{ pagination: { paginationModel: { pageSize: 10 } }, sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] } }}
                  sx={{ border: 0, minWidth: 1000 }}
                />
              </Box>
            )}
          </>
        )}

        {tab === 1 && (
          providers.length === 0 && !loading ? (
            <EmptyState title="No provider information" description="The backend did not report any payment providers." />
          ) : (
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
              {providers.map((p) => (
                <GlassCard key={p.provider} sx={{ p: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: 800, textTransform: 'capitalize' }}>{p.provider}</Typography>
                    {p.configured ? <CheckCircleOutlineIcon color="success" /> : <ErrorOutlineIcon color="warning" />}
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ my: 1 }}>
                    <Chip size="small" label={p.enabled ? 'Enabled' : 'Disabled'} color={p.enabled ? 'success' : 'default'} />
                    {p.environment && <Chip size="small" variant="outlined" label={p.environment} />}
                    {p.status && <Chip size="small" variant="outlined" label={p.status} />}
                  </Stack>
                  {p.missingRequirements && p.missingRequirements.length > 0 && (
                    <Tooltip title="Configure these on the backend to enable the provider">
                      <Typography variant="caption" color="warning.main">Missing: {p.missingRequirements.join(', ')}</Typography>
                    </Tooltip>
                  )}
                </GlassCard>
              ))}
            </Box>
          )
        )}
      </GlassCard>
    </Box>
  );
};
