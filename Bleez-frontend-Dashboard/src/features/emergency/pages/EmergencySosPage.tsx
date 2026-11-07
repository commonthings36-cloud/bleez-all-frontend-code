import React from 'react';
import { Box, Typography } from '@mui/material';
import { PageHeader } from '@/components/PageHeader';
import { GlassCard } from '@/components/GlassCard';

export const EmergencySosPage: React.FC = () => {
  return (
    <Box>
      <PageHeader
        title="Live Emergency SOS Console"
        subtitle="Manage active geotagged panic alerts, emergency contacts, safe zones, and resolution timelines."
        breadcrumbs={[{ label: 'Emergency SOS' }]}
      />
      <GlassCard sx={{ p: 4, borderColor: 'error.main', borderStyle: 'solid' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main' }}>
          Active SOS Panic Command Center
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Module loaded. 24/7 Geotagged distress signals stream online.
        </Typography>
      </GlassCard>
    </Box>
  );
};
