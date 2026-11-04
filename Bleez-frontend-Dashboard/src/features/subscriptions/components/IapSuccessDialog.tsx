import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import { CheckCircle, AutoAwesome, WorkspacePremium } from '@mui/icons-material';

interface IapSuccessDialogProps {
  open: boolean;
  planName: string;
  planCode: string;
  platform: 'ios' | 'android' | 'web';
  onClose: () => void;
}

export const IapSuccessDialog: React.FC<IapSuccessDialogProps> = ({
  open,
  planName,
  planCode,
  platform,
  onClose,
}) => {
  const storeLabel = platform === 'ios' ? 'Apple App Store (Apple Pay)' : platform === 'android' ? 'Google Play (Google Pay)' : 'Sandbox Mode';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}>
      <DialogContent sx={{ textAlign: 'center', pt: 3 }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: 'success.main',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 8px 24px rgba(46, 125, 50, 0.35)',
          }}
        >
          <CheckCircle sx={{ fontSize: 44 }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>
          Subscription Activated!
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Your payment was successfully verified via <strong>{storeLabel}</strong>.
        </Typography>

        <Chip
          icon={<WorkspacePremium />}
          label={`ACTIVE PLAN: ${planName || planCode}`}
          color="success"
          sx={{ fontWeight: 800, mb: 3, py: 2, px: 1, fontSize: '0.9rem' }}
        />

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={1} sx={{ textAlign: 'left', mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AutoAwesome sx={{ color: 'primary.main', fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Higher AI Itinerary Generation Quota
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <AutoAwesome sx={{ color: 'primary.main', fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              High-Resolution PDF & Document Exports
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <AutoAwesome sx={{ color: 'primary.main', fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Offline Downloads & Safety Intelligence Access
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={onClose}
          sx={{ fontWeight: 800, borderRadius: '12px', py: 1.2 }}
        >
          Start Exploring Benefits
        </Button>
      </DialogActions>
    </Dialog>
  );
};
