import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { ArrowForward, LocalOffer } from '@mui/icons-material';
import { campaignService } from '@/features/campaigns/services/campaign.service';
import { Campaign } from '@/features/campaigns/types/campaign.types';

export const WebHeroCampaignWidget: React.FC = () => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    const fetchEligibleHero = async () => {
      try {
        const list = await campaignService.getEligibleCampaigns('MASS_SEGMENT_AUDIENCE', 'WEB', 'HOME_HERO');
        if (list && list.length > 0) {
          setCampaign(list[0]);
        }
      } catch (err) {
        // Silent fallback if backend API is offline
      }
    };
    fetchEligibleHero();
  }, []);

  if (!campaign || !campaign.content?.web) {
    return null; // Don't render banner if no active approved campaign is returned
  }

  const webContent = campaign.content.web;

  return (
    <Paper
      elevation={4}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        mb: 4,
        background: `linear-gradient(135deg, rgba(30, 58, 138, 0.9) 0%, rgba(59, 130, 246, 0.8) 100%), url(${webContent.imageUrl || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#ffffff',
        p: { xs: 3, md: 5 },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <LocalOffer fontSize="small" sx={{ color: '#facc15' }} />
          <Typography variant="overline" sx={{ letterSpacing: 1.5, color: '#facc15', fontWeight: 700 }}>
            FEATURED SPECIAL OFFER
          </Typography>
        </Box>

        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
          {webContent.title}
        </Typography>

        <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, mb: 3, maxWidth: 700 }}>
          {webContent.subtitle}
        </Typography>

        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForward />}
          href={webContent.ctaLink || '/itinerary/create'}
          sx={{
            bgcolor: '#ffffff',
            color: '#1e3a8a',
            fontWeight: 700,
            px: 4,
            py: 1.5,
            borderRadius: 2,
            '&:hover': {
              bgcolor: '#f1f5f9',
            },
          }}
        >
          {webContent.ctaText || 'Explore Now'}
        </Button>
      </Container>
    </Paper>
  );
};
