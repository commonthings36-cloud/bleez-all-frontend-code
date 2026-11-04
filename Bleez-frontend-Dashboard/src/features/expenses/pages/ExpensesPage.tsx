import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useSnackbar } from 'notistack';
import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { apiClient } from '@/services/apiClient';

interface Expense {
  id: string;
  tripId?: string;
  userId?: string;
  category?: string;
  description?: string;
  amount?: number;
  currency?: string;
  date?: string;
  vendor?: string;
  createdAt?: string;
}

export const ExpensesPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [rows, setRows] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Expense | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/expenses/all');
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Could not load expenses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const currencies = useMemo(() => Array.from(new Set(rows.map((r) => r.currency || '—'))), [rows]);

  // Totals are kept per currency; amounts in different currencies are never added together.
  const categoryData = useMemo(() => {
    const single = currencies.length === 1 ? currencies[0] : null;
    if (!single) return [];
    const map: Record<string, number> = {};
    rows.forEach((r) => {
      const k = r.category || 'Uncategorised';
      map[k] = (map[k] || 0) + (r.amount || 0);
    });
    return Object.entries(map).map(([category, total]) => ({ category, total }));
  }, [rows, currencies]);

  const remove = async () => {
    if (!toDelete) return;
    try {
      await apiClient.delete(`/expenses/${toDelete.id}`);
      enqueueSnackbar('Expense deleted', { variant: 'success' });
      setToDelete(null);
      load();
    } catch (e: any) {
      enqueueSnackbar(e?.response?.data?.message || 'Could not delete expense', { variant: 'error' });
      setToDelete(null);
    }
  };

  const columns: GridColDef<Expense>[] = [
    { field: 'description', headerName: 'Description', flex: 1, minWidth: 220 },
    { field: 'category', headerName: 'Category', width: 150, renderCell: (p) => (p.value ? <Chip size="small" label={p.value} variant="outlined" /> : null) },
    { field: 'vendor', headerName: 'Vendor', width: 160 },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 150,
      type: 'number',
      valueFormatter: (_v: number, row: Expense) => (row.amount == null ? '—' : `${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${row.currency || ''}`),
    },
    { field: 'date', headerName: 'Date', width: 130 },
    { field: 'tripId', headerName: 'Trip', width: 140 },
    {
      field: 'actions',
      headerName: '',
      width: 70,
      sortable: false,
      renderCell: (p) => (
        <Tooltip title="Delete expense">
          <IconButton size="small" color="error" aria-label="Delete expense" onClick={() => setToDelete(p.row)}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Trip Expenses"
        subtitle="Expenses recorded by travelers against their trips."
        breadcrumbs={[{ label: 'Trip Expenses' }]}
        action={<Button variant="outlined" startIcon={<RefreshIcon />} onClick={load} disabled={loading}>Refresh</Button>}
      />

      <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
        The backend returns the signed-in user's expenses, or every user's expenses when that user has none. Deletions
        are performed as the signed-in admin and may be rejected for records owned by other users.
      </Alert>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <GlassCard sx={{ p: 2.5, flex: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Records</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>{loading ? '…' : rows.length}</Typography>
          <Typography variant="caption" color="text.secondary">Currencies: {currencies.join(', ') || '—'}</Typography>
        </GlassCard>
        <GlassCard sx={{ p: 2.5, flex: 2, minHeight: 200 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
            Spend by category {currencies.length === 1 ? `(${currencies[0]})` : ''}
          </Typography>
          {categoryData.length > 0 ? (
            <Box sx={{ height: 170, mt: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} width={50} />
                  <ChartTooltip />
                  <Bar dataKey="total" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {rows.length === 0 ? 'No data yet.' : 'Chart hidden because expenses use more than one currency.'}
            </Typography>
          )}
        </GlassCard>
      </Stack>

      <GlassCard sx={{ p: 2 }}>
        {!loading && rows.length === 0 ? (
          <EmptyState title="No expenses" description="No expenses have been recorded." />
        ) : (
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <DataGrid rows={rows} columns={columns} loading={loading} autoHeight disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} sx={{ border: 0, minWidth: 860 }} />
          </Box>
        )}
      </GlassCard>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this expense?"
        message={`"${toDelete?.description || 'Expense'}" will be permanently removed.`}
        confirmText="Delete"
        color="error"
        onConfirm={remove}
        onClose={() => setToDelete(null)}
      />
    </Box>
  );
};
