import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { GlassCard } from '@/components/GlassCard';

export const Error404Page: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <GlassCard sx={{ p: 5, textAlign: 'center', maxWidth: 480, width: '100%' }}>
        <Stack spacing={2} alignItems="center">
          <ErrorOutlineIcon sx={{ fontSize: 72, color: 'error.main' }} />
          <Typography variant="h2" sx={{ fontWeight: 800 }}>
            404
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Page Not Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The admin console page you are attempting to access does not exist or has been relocated.
          </Typography>
          <Button variant="contained" size="large" onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
            Return to Dashboard
          </Button>
        </Stack>
      </GlassCard>
    </Box>
  );
};
