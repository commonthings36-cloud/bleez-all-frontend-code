import React, { useState } from 'react';
import { Alert, Box, Button, InputAdornment, List, ListItem, ListItemIcon, ListItemText, CircularProgress, Stack, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { apiClient } from '@/services/apiClient';

interface Place {
  description?: string;
  place_id?: string;
  main_text?: string;
  secondary_text?: string;
}

export const DestinationsPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/places/autocomplete', { params: { query: q } });
      setResults(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Place search failed.');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Destinations"
        subtitle="Look up places exactly as travelers see them when planning a trip."
        breadcrumbs={[{ label: 'Destinations' }]}
      />
      <GlassCard sx={{ p: 3 }}>
        <form onSubmit={search}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Search a city, landmark or region"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            />
            <Button type="submit" variant="contained" disabled={loading || query.trim().length < 2} sx={{ minWidth: 140 }}>
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Search'}
            </Button>
          </Stack>
        </form>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {results && results.length === 0 && <EmptyState title="No places found" description="Try a different spelling or a broader term." />}
        {results && results.length > 0 && (
          <List sx={{ mt: 2 }}>
            {results.map((p, i) => (
              <ListItem key={p.place_id || i} divider>
                <ListItemIcon><PlaceOutlinedIcon color="primary" /></ListItemIcon>
                <ListItemText primary={p.main_text || p.description} secondary={p.secondary_text || p.place_id} />
              </ListItem>
            ))}
          </List>
        )}
        {!results && !loading && !error && (
          <EmptyState icon={<PlaceOutlinedIcon sx={{ fontSize: 64, opacity: 0.5 }} />} title="Search for a destination" description="Results come from the same place-autocomplete service the traveler apps use." />
        )}
      </GlassCard>
    </Box>
  );
};
