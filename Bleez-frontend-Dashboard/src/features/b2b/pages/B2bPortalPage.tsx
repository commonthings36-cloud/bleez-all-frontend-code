import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Grid,
  Chip,
  Paper,
  TextField,
  MenuItem,
  Divider,
  Alert,
} from '@mui/material';
import { Business, AutoAwesome, Palette, People, Save } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

import { GlassCard } from '@/components/GlassCard';
import { PageHeader } from '@/components/PageHeader';
import { B2bOrganization } from '../types/b2b.types';
import { b2bService } from '../services/b2b.service';

export const B2bPortalPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [org, setOrg] = useState<B2bOrganization>({
    name: 'ABC Global Travel Specialists',
    branding: {
      companyName: 'ABC Global Travel',
      logoUrl: 'https://assets.ai-travelhub.com/orgs/abc_logo.png',
      primaryColorHex: '#1E3A8A',
      secondaryColorHex: '#F59E0B',
      headerText: 'Exclusive Itinerary Prepared for Your Journey',
      footerText: 'ABC Global Travel • 24/7 Concierge: +1-800-555-0199',
      websiteUrl: 'https://abctravel.com',
      contactPhone: '+1-800-555-0199',
      contactEmail: 'concierge@abctravel.com',
    },
    aiConfig: {
      customInstructions:
        'Always recommend boutique 5-star luxury hotels, private VIP airport transfers, and Michelin-starred dining options. Tone should be executive and elegant.',
      itineraryStyle: 'LUXURY_EXECUTIVE',
      tone: 'ELEGANT',
    },
  });

  const loadData = async () => {
    try {
      const data = await b2bService.getMyOrganization();
      if (data && data.name) {
        setOrg(data);
      }
    } catch (err) {
      console.log('No existing B2B org profile found, using starter template');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    try {
      await b2bService.saveOrganization(org);
      enqueueSnackbar('B2B Organization branding & AI prompts saved', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to save organization settings', { variant: 'error' });
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <PageHeader
        title="B2B Organization Portal & White-Labeling"
        subtitle="Manage custom company branding on PDF itineraries, agency logos, and bespoke AI prompt tuning"
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<Save />}
            onClick={handleSave}
            sx={{ fontWeight: 800, borderRadius: '10px' }}
          >
            Save Changes
          </Button>
        }
      />

      <Grid container spacing={3}>
        {/* Left Column: Brand Kit */}
        <Grid item xs={12} md={6}>
          <GlassCard sx={{ p: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <Palette sx={{ color: 'primary.main', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                White-Label Brand Kit
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Organization / Company Name"
                value={org.name || ''}
                onChange={(e) => setOrg({ ...org, name: e.target.value })}
              />
              <TextField
                fullWidth
                label="Custom Brand Logo URL (PNG/SVG)"
                value={org.branding?.logoUrl || ''}
                onChange={(e) =>
                  setOrg({ ...org, branding: { ...org.branding, logoUrl: e.target.value } })
                }
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="Primary Brand Color (Hex)"
                  value={org.branding?.primaryColorHex || '#1E3A8A'}
                  onChange={(e) =>
                    setOrg({
                      ...org,
                      branding: { ...org.branding, primaryColorHex: e.target.value },
                    })
                  }
                />
                <TextField
                  fullWidth
                  label="Secondary Color (Hex)"
                  value={org.branding?.secondaryColorHex || '#F59E0B'}
                  onChange={(e) =>
                    setOrg({
                      ...org,
                      branding: { ...org.branding, secondaryColorHex: e.target.value },
                    })
                  }
                />
              </Stack>
              <TextField
                fullWidth
                label="PDF Custom Header Text"
                value={org.branding?.headerText || ''}
                onChange={(e) =>
                  setOrg({ ...org, branding: { ...org.branding, headerText: e.target.value } })
                }
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                label="PDF Custom Footer & Contact Details"
                value={org.branding?.footerText || ''}
                onChange={(e) =>
                  setOrg({ ...org, branding: { ...org.branding, footerText: e.target.value } })
                }
              />
            </Stack>
          </GlassCard>
        </Grid>

        {/* Right Column: AI Prompt Customization */}
        <Grid item xs={12} md={6}>
          <GlassCard sx={{ p: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <AutoAwesome sx={{ color: 'warning.main', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                B2B AI Prompt & Persona Tuning
              </Typography>
            </Stack>

            <Alert severity="info" sx={{ mb: 2 }}>
              These custom guidelines and preferences are automatically injected into the AI itinerary generation engine for all team agents in your organization.
            </Alert>

            <Stack spacing={2}>
              <TextField
                fullWidth
                multiline
                rows={5}
                label="Agency AI Travel Policies & Prompt Instructions"
                placeholder="e.g. Always prioritize 5-star properties, executive airport lounges, and private guided excursions."
                value={org.aiConfig?.customInstructions || ''}
                onChange={(e) =>
                  setOrg({
                    ...org,
                    aiConfig: { ...org.aiConfig, customInstructions: e.target.value },
                  })
                }
              />
              <TextField
                select
                fullWidth
                label="Default Itinerary Style"
                value={org.aiConfig?.itineraryStyle || 'LUXURY_EXECUTIVE'}
                onChange={(e) =>
                  setOrg({
                    ...org,
                    aiConfig: { ...org.aiConfig, itineraryStyle: e.target.value },
                  })
                }
              >
                <MenuItem value="LUXURY_EXECUTIVE">Luxury Executive</MenuItem>
                <MenuItem value="FAST_BUSINESS">Fast-Paced Business</MenuItem>
                <MenuItem value="BOUTIQUE_LEISURE">Boutique & Leisure</MenuItem>
                <MenuItem value="FAMILY_ADVENTURE">Family Adventure</MenuItem>
              </TextField>
              <TextField
                select
                fullWidth
                label="AI Tone"
                value={org.aiConfig?.tone || 'ELEGANT'}
                onChange={(e) =>
                  setOrg({
                    ...org,
                    aiConfig: { ...org.aiConfig, tone: e.target.value },
                  })
                }
              >
                <MenuItem value="ELEGANT">Elegant & Executive</MenuItem>
                <MenuItem value="CONCISE">Concise & Action-Oriented</MenuItem>
                <MenuItem value="FRIENDLY">Warm & Friendly</MenuItem>
              </TextField>
            </Stack>
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default B2bPortalPage;
