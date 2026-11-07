import React from 'react';
import { Box, Typography } from '@mui/material';
import { PageHeader } from '@/components/PageHeader';
import { GlassCard } from '@/components/GlassCard';

export const CmsPage: React.FC = () => {
  return (
    <Box>
      <PageHeader
        title="CMS & Content Management"
        subtitle="Update FAQs, Terms of Service, Privacy Policy, About text, and promo hero banners."
        breadcrumbs={[{ label: 'CMS' }]}
      />
      <GlassCard sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Platform CMS Editor
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Module loaded. Legal documents & promo hero banner manager ready.
        </Typography>
      </GlassCard>
    </Box>
  );
};
