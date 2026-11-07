import React from 'react';
import { Box, Typography } from '@mui/material';
import { PageHeader } from '@/components/PageHeader';
import { GlassCard } from '@/components/GlassCard';

export const SchedulerPage: React.FC = () => {
  return (
    <Box>
      <PageHeader
        title="Scheduler & Background Cron Jobs"
        subtitle="Manage scheduled background tasks, trigger 'Run Now', pause/resume cron jobs, and inspect logs."
        breadcrumbs={[{ label: 'Scheduler' }]}
      />
      <GlassCard sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Spring Boot Scheduler & Cron Monitor
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Module loaded. Background threat scan and alert precompute jobs active.
        </Typography>
      </GlassCard>
    </Box>
  );
};
