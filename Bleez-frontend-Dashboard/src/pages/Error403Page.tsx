import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import { GlassCard } from '@/components/GlassCard';

export const Error403Page: React.FC = () => {
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
          <SecurityIcon sx={{ fontSize: 72, color: 'warning.main' }} />
          <Typography variant="h2" sx={{ fontWeight: 800 }}>
            403
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Access Forbidden
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You do not have the required RBAC permissions to view this module.
          </Typography>
          <Button variant="contained" size="large" onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
            Return to Dashboard
          </Button>
        </Stack>
      </GlassCard>
    </Box>
  );
};
