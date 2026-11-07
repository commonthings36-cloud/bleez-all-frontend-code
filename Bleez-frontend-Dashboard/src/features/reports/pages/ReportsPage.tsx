import React from 'react';
import { Box, Typography } from '@mui/material';
import { PageHeader } from '@/components/PageHeader';
import { GlassCard } from '@/components/GlassCard';

export const ReportsPage: React.FC = () => {
  return (
    <Box>
      <PageHeader
        title="Custom Reports & Data Exports"
        subtitle="Generate and download customized CSV, Excel, and PDF reports for revenue, bookings, and AI usage."
        breadcrumbs={[{ label: 'Reports' }]}
      />
      <GlassCard sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Business Intelligence Data Exporter
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Module loaded. CSV, XLSX, and PDF export engines online.
        </Typography>
      </GlassCard>
    </Box>
  );
};
