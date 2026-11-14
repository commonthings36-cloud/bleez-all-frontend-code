import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Stack,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useSnackbar } from 'notistack';
import { subscriptionService } from '../services/subscription.service';

export interface GrantOfferDialogProps {
  open: boolean;
  onClose: () => void;
  targetUser?: {
    id: string;
    name: string;
    email: string;
  } | null;
  onSuccess?: () => void;
}

export const GrantOfferDialog: React.FC<GrantOfferDialogProps> = ({
  open,
  onClose,
  targetUser,
  onSuccess,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const [offerType, setOfferType] = useState<'EXTRA_AI_GENERATIONS' | 'PLAN_UPGRADE' | 'RESET_USAGE'>('EXTRA_AI_GENERATIONS');
  const [extraGenerations, setExtraGenerations] = useState<number>(10);
  const [isUnlimited, setIsUnlimited] = useState<boolean>(false);
  const [planCode, setPlanCode] = useState<string>('BUSINESS');
  const [durationDays, setDurationDays] = useState<number>(30);
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [userEmailInput, setUserEmailInput] = useState<string>('');

  useEffect(() => {
    if (targetUser) {
      setUserEmailInput(targetUser.email);
    }
  }, [targetUser]);

  const quickGenerationOptions = [5, 10, 25, 50, 100];

  const handleSubmit = async () => {
    const finalUserId = targetUser?.id;
    const finalUserEmail = targetUser?.email || userEmailInput.trim();

    if (!finalUserId && !finalUserEmail) {
      enqueueSnackbar('Please provide a user email or select a user', { variant: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await subscriptionService.grantOffer({
        userId: finalUserId,
        userEmail: finalUserEmail,
        offerType,
        extraGenerations: isUnlimited ? 999999 : extraGenerations,
        isUnlimited,
        planCode,
        durationDays: durationDays > 0 ? durationDays : undefined,
        reason: reason.trim() || undefined,
      });

      enqueueSnackbar(res.message || 'Offer granted successfully!', { variant: 'success' });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to grant offer';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <CardGiftcardIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Grant Special Offer & Perks
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Provide extra AI itinerary credits or premium perks to users
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2.5 }}>
        <Stack spacing={2.5}>
          {/* Target User Info */}
          {targetUser ? (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                Recipient User
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {targetUser.name || 'User'}
              </Typography>
              <Typography variant="body2" color="primary.main">
                {targetUser.email}
              </Typography>
            </Box>
          ) : (
            <TextField
              label="Recipient User Email"
              fullWidth
              size="small"
              value={userEmailInput}
              onChange={(e) => setUserEmailInput(e.target.value)}
              placeholder="e.g. user@bleez.ai"
              helperText="Enter the registered email of the user to receive the offer"
            />
          )}

          {/* Offer Type Selection */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Select Offer Type
            </Typography>
            <RadioGroup
              value={offerType}
              onChange={(e) => setOfferType(e.target.value as any)}
            >
              <Box
                sx={{
                  p: 1.5,
                  mb: 1,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: offerType === 'EXTRA_AI_GENERATIONS' ? 'primary.main' : 'divider',
                  bgcolor: offerType === 'EXTRA_AI_GENERATIONS' ? 'primary.50' : 'transparent',
                  cursor: 'pointer',
                }}
                onClick={() => setOfferType('EXTRA_AI_GENERATIONS')}
              >
                <FormControlLabel
                  value="EXTRA_AI_GENERATIONS"
                  control={<Radio size="small" />}
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AutoAwesomeIcon color="primary" fontSize="small" />
                      <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>
                        Extra AI Itinerary Generations
                      </Typography>
                    </Stack>
                  }
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
                  Grant additional trip generation quotas to the user's account
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 1.5,
                  mb: 1,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: offerType === 'PLAN_UPGRADE' ? 'warning.main' : 'divider',
                  bgcolor: offerType === 'PLAN_UPGRADE' ? 'warning.50' : 'transparent',
                  cursor: 'pointer',
                }}
                onClick={() => setOfferType('PLAN_UPGRADE')}
              >
                <FormControlLabel
                  value="PLAN_UPGRADE"
                  control={<Radio size="small" />}
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <WorkspacePremiumIcon color="warning" fontSize="small" />
                      <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>
                        Free Subscription Plan Upgrade
                      </Typography>
                    </Stack>
                  }
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
                  Temporarily or permanently grant Explorer or Business tier access
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: offerType === 'RESET_USAGE' ? 'success.main' : 'divider',
                  bgcolor: offerType === 'RESET_USAGE' ? 'success.50' : 'transparent',
                  cursor: 'pointer',
                }}
                onClick={() => setOfferType('RESET_USAGE')}
              >
                <FormControlLabel
                  value="RESET_USAGE"
                  control={<Radio size="small" />}
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <RestartAltIcon color="success" fontSize="small" />
                      <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>
                        Reset Monthly Usage Quota
                      </Typography>
                    </Stack>
                  }
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
                  Clear used trip counter back to 0 so user gets immediate fresh quota
                </Typography>
              </Box>
            </RadioGroup>
          </Box>

          {/* Offer Details Configuration */}
          {offerType === 'EXTRA_AI_GENERATIONS' && (
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Amount of Extra Generations:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2, gap: 1 }}>
                {quickGenerationOptions.map((opt) => (
                  <Chip
                    key={opt}
                    label={`+${opt} Trips`}
                    color={!isUnlimited && extraGenerations === opt ? 'primary' : 'default'}
                    variant={!isUnlimited && extraGenerations === opt ? 'filled' : 'outlined'}
                    onClick={() => {
                      setIsUnlimited(false);
                      setExtraGenerations(opt);
                    }}
                    sx={{ fontWeight: 700 }}
                  />
                ))}
                <Chip
                  label="♾️ Unlimited"
                  color={isUnlimited ? 'primary' : 'default'}
                  variant={isUnlimited ? 'filled' : 'outlined'}
                  onClick={() => setIsUnlimited(true)}
                  sx={{ fontWeight: 800 }}
                />
              </Stack>

              {!isUnlimited && (
                <TextField
                  label="Custom Amount"
                  type="number"
                  size="small"
                  value={extraGenerations}
                  onChange={(e) => setExtraGenerations(Math.max(1, parseInt(e.target.value) || 1))}
                  fullWidth
                />
              )}
            </Box>
          )}

          {offerType === 'PLAN_UPGRADE' && (
            <Stack spacing={2} sx={{ p: 2, borderRadius: 2, bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: '1px solid', borderColor: 'divider' }}>
              <TextField
                select
                label="Target Plan"
                size="small"
                fullWidth
                value={planCode}
                onChange={(e) => setPlanCode(e.target.value)}
              >
                <MenuItem value="EXPLORER">EXPLORER ($2.99/mo Tier - 20 Trips, PDF Export)</MenuItem>
                <MenuItem value="BUSINESS">BUSINESS ($39.00/mo Tier - Unlimited Trips, Branding, Team)</MenuItem>
              </TextField>

              <TextField
                select
                label="Grant Duration"
                size="small"
                fullWidth
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value))}
              >
                <MenuItem value={7}>7 Days (Trial Extension)</MenuItem>
                <MenuItem value={30}>30 Days (1 Month Promo)</MenuItem>
                <MenuItem value={90}>90 Days (Quarterly Promo)</MenuItem>
                <MenuItem value={365}>1 Year (Annual Gift)</MenuItem>
                <MenuItem value={0}>Permanent / Lifetime</MenuItem>
              </TextField>
            </Stack>
          )}

          {offerType === 'RESET_USAGE' && (
            <Alert severity="info" sx={{ fontWeight: 600 }}>
              This will reset the user's consumption count for this month to 0. They will immediately regain their full plan allowance.
            </Alert>
          )}

          {/* Reason Note */}
          <TextField
            label="Admin Note / Reason (Optional)"
            placeholder="e.g. VIP loyalty reward, customer support gesture, early adopter perk"
            multiline
            rows={2}
            size="small"
            fullWidth
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <CardGiftcardIcon />}
          sx={{ fontWeight: 800, px: 3 }}
        >
          {submitting ? 'Applying...' : 'Apply Offer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

